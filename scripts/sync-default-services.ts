import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
// @ts-expect-error Node's strip-types runner requires the explicit TypeScript extension.
import { electricalServices, fiberServices } from "../data/content.ts";

const apply = process.argv.includes("--apply");
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
if (!projectId) throw new Error("Missing Firebase project ID.");
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const credential = clientEmail && privateKey ? cert({ projectId, clientEmail, privateKey }) : applicationDefault();
const db = getFirestore(initializeApp({ projectId, credential }, "default-service-sync"));
const defaultServices = [...electricalServices, ...fiberServices].map((service, index) => ({
  id: `${service.kind}-${service.slug}`,
  category: service.kind,
  slug: service.slug,
  title: service.title,
  shortDescription: service.description,
  detailedDescription: service.description,
  imageId: "",
  displayOrder: service.kind === "electrical" ? index + 1 : index - electricalServices.length + 1,
  enabled: true,
}));
const collection = db.collection("services");
const snapshots = await Promise.all(defaultServices.map(service => collection.doc(service.id).get()));
const missing = defaultServices.filter((_, index) => !snapshots[index].exists);

console.log(`Firebase project: ${projectId}`);
console.log(`Default services: ${defaultServices.length}`);
console.log(`Already saved: ${defaultServices.length - missing.length}`);
console.log(`Missing: ${missing.length}`);

if (!apply) {
  missing.forEach(service => console.log(`- ${service.id}: ${service.title}`));
  console.log("Dry run only. Run with --apply to create the missing services.");
  process.exit(0);
}

if (!missing.length) {
  console.log("No changes required.");
  process.exit(0);
}

const batch = db.batch();
for (const service of missing) {
  const { id, category, slug, title, shortDescription, detailedDescription, imageId = "", displayOrder, enabled } = service;
  const published = { title, shortDescription, detailedDescription, imageId, displayOrder, enabled };
  batch.create(collection.doc(id), {
    schemaVersion: 1,
    category,
    slug,
    status: "Published",
    draft: published,
    published,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: "default-service-sync",
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: "default-service-sync",
    publishedAt: FieldValue.serverTimestamp(),
    publishedBy: "default-service-sync",
  });
}

await batch.commit();
console.log(`Created ${missing.length} service documents.`);
