import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FIREBASE_CACHE_NAMESPACE } from "@/lib/firebase/cache-namespace";
import { aboutContentSchema, ctaContentSchema, homepageContentSchema, servicePageContentSchema, sectionSchema, type SiteContentSection } from "@/lib/site-content/schemas";
import { PUBLIC_SERVICES_TAG, PUBLIC_SITE_CONTENT_TAG } from "@/lib/site-content/public-cache";
import {getPublicMediaDetails}from"@/lib/media/public-repository";
import type { PublicAboutContent, PublicCta, PublicHomepageContent, PublicService, PublicServicePageContent, ServiceKind } from "@/types/content";

const fixturePattern = /\bphase\s+[a-z]\d+\b|\bstaging[- ]only\b|\bemulator\b|\bbrowser\s+(?:test|verification|content|service)\b/i;
const containsFixtureLabel = (value: unknown) => fixturePattern.test(JSON.stringify(value));

const storedPageSchema = z.object({ schemaVersion: z.literal(1), section: sectionSchema, published: z.unknown() });
export type PublicSiteContent = PublicHomepageContent | PublicServicePageContent | PublicAboutContent | PublicCta[];

export async function getPublicSiteContentUncached(sectionValue: string): Promise<PublicSiteContent | null> {
  const section = sectionSchema.parse(sectionValue);
  const document = await getAdminFirestore().collection("siteContent").doc(`${section}-v1`).get();
  const stored = storedPageSchema.safeParse(document.data());
  if (!stored.success || stored.data.section !== section || containsFixtureLabel(stored.data.published)) return null;
  if (section === "homepage") { const parsed=homepageContentSchema.omit({heroImageId:true}).safeParse(stored.data.published); return parsed.success?parsed.data:null; }
  if (section === "electrical" || section === "fiber") { const parsed=servicePageContentSchema.safeParse(stored.data.published); return parsed.success?parsed.data:null; }
  if (section === "about") { const parsed=aboutContentSchema.safeParse(stored.data.published);if(!parsed.success)return null;const{imageId,...content}=parsed.data,image=imageId?(await getPublicMediaDetails([imageId],"lg")).get(imageId):null;return{...content,...(image?.type==="image"?{imageSrc:image.src,imageAlt:image.alt}:{})}; }
  const parsed=ctaContentSchema.safeParse(stored.data.published);
  return parsed.success?parsed.data.items.filter(item=>item.enabled).map(({id,placement,label,supportingText,destination,essential=false})=>({id,placement,label,supportingText,destination,essential})):null;
}

const storedServiceSchema = z.object({
  schemaVersion: z.literal(1), category: z.enum(["electrical", "fiber"]),
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  published: z.object({ title: z.string().trim().min(1).max(160), shortDescription: z.string().trim().min(1).max(500), detailedDescription: z.string().trim().min(1).max(3000), displayOrder: z.number().int().min(0).max(999), enabled: z.literal(true) }),
});

export async function listPublicServicesUncached(categoryValue: string): Promise<PublicService[]> {
  const category = z.enum(["electrical", "fiber"]).parse(categoryValue);
  const snapshot = await getAdminFirestore().collection("services").where("category", "==", category).get();
  return snapshot.docs.flatMap(document => {
    const parsed = storedServiceSchema.safeParse(document.data());
    if (!parsed.success || containsFixtureLabel(parsed.data.published)) return [];
    const { title, shortDescription, detailedDescription, displayOrder } = parsed.data.published;
    return [{ id: document.id, category: parsed.data.category as ServiceKind, slug: parsed.data.slug, title, shortDescription, detailedDescription, displayOrder }];
  }).toSorted((left, right) => left.displayOrder - right.displayOrder || left.title.localeCompare(right.title));
}

const getPageCached = unstable_cache(getPublicSiteContentUncached, ["public-site-content-v1",FIREBASE_CACHE_NAMESPACE], { tags: [PUBLIC_SITE_CONTENT_TAG], revalidate: 3600 });
const listServicesCached = unstable_cache(listPublicServicesUncached, ["public-services-v1",FIREBASE_CACHE_NAMESPACE], { tags: [PUBLIC_SERVICES_TAG], revalidate: 3600 });
export const getPublicSiteContent = cache((section: SiteContentSection) => getPageCached(section));
export const listPublicServices = cache((category: ServiceKind) => listServicesCached(category));
