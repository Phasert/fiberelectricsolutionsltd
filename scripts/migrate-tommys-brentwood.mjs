import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import sharp from "sharp";

const apply = process.argv.includes("--apply");
const publish = process.argv.includes("--publish");
const allowProduction = process.argv.includes("--allow-production");
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const emulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_STORAGE_EMULATOR_HOST);
const projectRefId = "tommys-brentwood";
const slug = "tommys-brentwood";
const actor = process.env.FES_MIGRATION_ACTOR_UID || "migration:tommys-brentwood";
const base = path.resolve("public/images/projects/tommys-brentwood");
const assets = [
  ["img-0637", "img_0637.jpg", "Two open electrical panelboards mounted within a framed interior"],
  ["img-0670", "img_0670.jpg", "Open electrical panel with a main breaker, copper busbars and yellow cabling"],
  ["img-0775", "img_0775.jpg", "Wide view of electrical equipment and cabling in an equipment room"],
  ["img-0776", "img_0776.jpg", "Open breaker panel with copper busbars and colored cabling"],
  ["img-0777", "img_0777.jpg", "Wide view of electrical equipment installed in an equipment room"],
];

if (apply && (!projectId || !bucketName)) throw new Error("Set FIREBASE_PROJECT_ID and NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.");
if (apply && !emulator && !allowProduction) throw new Error("Production writes are blocked. Obtain approval, then pass --allow-production.");
if (apply && !emulator && process.env.FES_APPROVED_FIREBASE_PROJECT !== projectId) throw new Error("Set FES_APPROVED_FIREBASE_PROJECT to the exact approved target project.");

const prepared = [];
for (const [suffix, filename, alt] of assets) {
  const bytes = await readFile(path.join(base, filename));
  const metadata = await sharp(bytes).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`Could not read ${filename}.`);
  prepared.push({ id: `tommys-brentwood-${suffix}`, filename, alt, bytes, width: metadata.width, height: metadata.height, checksum: createHash("sha256").update(bytes).digest("hex") });
}

console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", target: projectId || "not-configured", emulator, publish, project: { id: projectRefId, slug, media: prepared.map(({ id, filename, checksum }) => ({ id, filename, checksum })) } }, null, 2));
if (!apply) {
  console.log("Dry run complete. No Firebase or Storage data was changed.");
  process.exit(0);
}

const app = getApps()[0] || initializeApp({ projectId, credential: applicationDefault(), storageBucket: bucketName });
const db = getFirestore(app);
const bucket = getStorage(app).bucket();
const existingSlug = await db.collection("projectSlugs").doc(slug).get();
if (existingSlug.exists && existingSlug.get("projectId") !== projectRefId) throw new Error("SLUG_CONFLICT");

for (const asset of prepared) {
  const version = `sha256-${asset.checksum.slice(0, 16)}`;
  const originalPath = `editorial/private/originals/${asset.id}/${version}/source.jpg`;
  const derivatives = [];
  await bucket.file(originalPath).save(asset.bytes, { resumable: false, metadata: { contentType: "image/jpeg", cacheControl: "private, max-age=0, no-store" } });
  for (const [variant, width] of [["sm", 640], ["md", 1280], ["lg", 1920]]) {
    const output = await sharp(asset.bytes).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    const storagePath = `editorial/public/derivatives/${asset.id}/${version}/${variant}.webp`;
    const checksum = createHash("sha256").update(output.data).digest("hex");
    await bucket.file(storagePath).save(output.data, { resumable: false, metadata: { contentType: "image/webp", cacheControl: "public, max-age=31536000, immutable" } });
    derivatives.push({ variant, storagePath, mimeType: "image/webp", sizeBytes: output.data.length, width: output.info.width, height: output.info.height, checksum, version });
  }
  await db.collection("media").doc(asset.id).set({ schemaVersion: 2, kind: "editorial-image", status: "Ready", originalName: asset.filename, storagePath: originalPath, mimeType: "image/jpeg", sizeBytes: asset.bytes.length, width: asset.width, height: asset.height, pixelCount: asset.width * asset.height, checksum: asset.checksum, version, derivatives, failureCode: null, alt: asset.alt, caption: "", category: "Electrical", projectId: projectRefId, roles: ["project-gallery"], updatedAt: FieldValue.serverTimestamp(), updatedBy: actor, createdAt: FieldValue.serverTimestamp(), createdBy: actor }, { merge: true });
}

const gallery = prepared.map((asset, order) => ({ mediaId: asset.id, alt: asset.alt, caption: "", order }));
const project = { title: "Tommy's Brentwood", slug, category: "Electrical", summary: "", location: "", period: "", status: publish ? "Published" : "Draft", featured: false, gallery, coverMediaId: prepared[1].id, updatedAt: FieldValue.serverTimestamp(), updatedBy: actor };
await db.runTransaction(async (transaction) => {
  transaction.set(db.collection("projectSlugs").doc(slug), { projectId: projectRefId, createdAt: FieldValue.serverTimestamp() }, { merge: true });
  transaction.set(db.collection("projects").doc(projectRefId), { ...project, createdAt: FieldValue.serverTimestamp(), createdBy: actor, publishedAt: publish ? FieldValue.serverTimestamp() : null }, { merge: true });
  for (const asset of prepared) transaction.set(db.collection("mediaReferences").doc(asset.id), { references: [`projects/${projectRefId}:gallery`], updatedAt: FieldValue.serverTimestamp(), updatedBy: actor }, { merge: true });
});
console.log(`Migrated Tommy's Brentwood as ${project.status}.`);
