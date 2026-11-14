import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { defaultPages, defaultServices } from "@/lib/site-content/defaults";
import {aboutContentSchema,pageInputSchema, sectionSchema, servicesInputSchema, type SiteContentAdminState, type SiteContentSection } from "@/lib/site-content/schemas";
import type { ManagedService } from "@/types/admin";
import { collectMediaIds,prepareMediaReferenceSync,syncMediaReferences } from "@/lib/media/references";

const pages = () => getAdminFirestore().collection("siteContent");
const services = () => getAdminFirestore().collection("services");
const pageRef = (section: SiteContentSection) => pages().doc(`${section}-v1`);

export async function listAdminSiteContent() {
  const sections = sectionSchema.options;
  const docs = await Promise.all(sections.map((section) => pageRef(section).get()));
  return Object.fromEntries(sections.map((section, index) => {
    const data = docs[index].data();
    const draft=data?.draft??defaultPages[section],content=section==="about"?(aboutContentSchema.safeParse(draft).data??defaultPages.about):draft;
    return [section, { status: data?.status === "Published" ? "Published" : "Draft", content }];
  })) as SiteContentAdminState;
}

export async function saveSiteContent(sectionValue: string, input: unknown, uid: string) {
  const section = sectionSchema.parse(sectionValue);
  const value = pageInputSchema.parse({ ...(input as object), section });
  const ref = pageRef(section);
  await getAdminFirestore().runTransaction(async (transaction) => {
    const current = await transaction.get(ref);
    const published = value.status === "Published" ? value.content : (current.data()?.published ?? null);
    await syncMediaReferences(transaction,{consumer:`siteContent/${ref.id}:content`,previousIds:collectMediaIds(current.data()),nextIds:collectMediaIds({draft:value.content,published}),role:"site-content",uid});
    transaction.set(ref, {
      schemaVersion: 1, section, status: value.status, draft: value.content, published,
      createdAt: current.exists ? current.data()?.createdAt : FieldValue.serverTimestamp(),
      createdBy: current.exists ? current.data()?.createdBy : uid,
      updatedAt: FieldValue.serverTimestamp(), updatedBy: uid,
      publishedAt: value.status === "Published" ? (current.data()?.publishedAt ?? FieldValue.serverTimestamp()) : (current.data()?.publishedAt ?? null),
      publishedBy: value.status === "Published" ? uid : (current.data()?.publishedBy ?? null),
    });
  });
}

export async function getPublishedSiteContent(sectionValue: string) {
  const section = sectionSchema.parse(sectionValue);
  const snapshot = await pageRef(section).get();
  const data = snapshot.data();
  return data?.published ?? null;
}

const serviceSnapshot = (data: FirebaseFirestore.DocumentData) => ({
  title: String(data.title ?? ""), shortDescription: String(data.shortDescription ?? ""),
  detailedDescription: String(data.detailedDescription ?? ""), imageId: String(data.imageId ?? ""),
  displayOrder: Number(data.displayOrder ?? 0), enabled: data.enabled === true,
});
const mapService = (id: string, data: FirebaseFirestore.DocumentData): ManagedService => ({
  id, category: data.category, slug: String(data.slug ?? ""), ...serviceSnapshot(data.draft ?? data),
  status: data.status === "Published" ? "Published" : "Draft",
});

export async function listAdminServices() {
  const snapshot = await services().get();
  if (snapshot.empty) return defaultServices;
  return snapshot.docs.map((doc) => mapService(doc.id, doc.data())).sort((a, b) => a.category.localeCompare(b.category) || a.displayOrder - b.displayOrder);
}

export async function saveServices(input: unknown, uid: string) {
  const value = servicesInputSchema.parse(input);
  const db = getAdminFirestore();
  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(services().where("category", "==", value.category));
    const incomingIds = new Set(value.services.map((service) => service.id));
    const current = new Map(existing.docs.map((doc) => [doc.id, doc.data()]));
    const plans=[];
    for(const item of value.services){const prior=current.get(item.id),draft=serviceSnapshot(item),published=item.status==="Published"?draft:(prior?.published??null);plans.push(await prepareMediaReferenceSync(transaction,{consumer:`services/${item.id}:image`,previousIds:collectMediaIds(prior),nextIds:collectMediaIds({draft,published}),role:"service-image",uid}))}
    for(const doc of existing.docs)if(!incomingIds.has(doc.id))plans.push(await prepareMediaReferenceSync(transaction,{consumer:`services/${doc.id}:image`,previousIds:collectMediaIds(doc.data()),nextIds:[],role:"service-image",uid}));
    plans.forEach(apply=>apply());
    for (const item of value.services) {
      const ref = services().doc(item.id);
      const prior = current.get(item.id);
      const draft = serviceSnapshot(item);
      transaction.set(ref, {
        schemaVersion: 1, category: item.category, slug: item.slug, status: item.status, draft,
        published: item.status === "Published" ? draft : (prior?.published ?? null),
        createdAt: prior?.createdAt ?? FieldValue.serverTimestamp(), createdBy: prior?.createdBy ?? uid,
        updatedAt: FieldValue.serverTimestamp(), updatedBy: uid,
        publishedAt: item.status === "Published" ? (prior?.publishedAt ?? FieldValue.serverTimestamp()) : (prior?.publishedAt ?? null),
        publishedBy: item.status === "Published" ? uid : (prior?.publishedBy ?? null),
      });
    }
    for (const doc of existing.docs) if (!incomingIds.has(doc.id)) transaction.delete(doc.ref);
  });
}

export async function listPublishedServices(categoryValue?: string) {
  const category = categoryValue ? servicesInputSchema.shape.category.parse(categoryValue) : undefined;
  let query: FirebaseFirestore.Query = services();
  if (category) query = query.where("category", "==", category);
  const snapshot = await query.get();
  return snapshot.docs.flatMap((doc) => {
    const data = doc.data();
    if (!data.published?.enabled) return [];
    return [{ id: doc.id, category: data.category, slug: data.slug, status: "Published" as const, ...serviceSnapshot(data.published) }];
  }).sort((a, b) => a.displayOrder - b.displayOrder);
}
