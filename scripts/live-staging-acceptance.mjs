import { randomUUID } from "node:crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import sharp from "sharp";

const baseURL = process.env.FES_ACCEPTANCE_BASE_URL || "http://localhost:3000";
const expectedProject = "fesr-c3ae1";
const expectedBucket = "fesr-c3ae1.firebasestorage.app";
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
if (projectId !== expectedProject || bucketName !== expectedBucket) throw new Error("STAGING_TARGET_MISMATCH");
for (const name of ["FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY", "NEXT_PUBLIC_FIREBASE_API_KEY"]) if (!process.env[name]) throw new Error(`MISSING_${name}`);

const app = getApps()[0] ?? initializeApp({ credential: cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") }), storageBucket: bucketName });
const auth = getAuth(app), database = getFirestore(app), bucket = getStorage(app).bucket();
const marker = `controlled-online-${Date.now()}`, slug = `fes-${marker}`;
const result = { target: { projectId, bucket: bucketName, environment: "local application with live staging Firebase" }, checks: {}, cleanup: {} };
let quoteId = "", mediaId = "", projectDocumentId = "";

const request = async (path, init = {}) => fetch(`${baseURL}${path}`, init);
const json = async response => ({ status: response.status, body: await response.json().catch(() => ({})), headers: response.headers });
const cookieHeaders = cookie => ({ origin: baseURL, cookie });

async function administratorSession() {
  const admins = await database.collection("admins").get();
  const approved = admins.docs.find(document => document.get("active") === true && document.get("role") === "admin");
  if (!approved) throw new Error("NO_ACTIVE_ADMINISTRATOR");
  const user = await auth.getUser(approved.id);
  if (user.disabled) throw new Error("ADMINISTRATOR_DISABLED");
  const customToken = await auth.createCustomToken(user.uid);
  const exchange = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: customToken, returnSecureToken: true }) });
  const exchanged = await exchange.json();
  if (!exchange.ok || !exchanged.idToken) throw new Error("CUSTOM_TOKEN_EXCHANGE_FAILED");
  const session = await request("/api/auth/session", { method: "POST", headers: { origin: baseURL, "content-type": "application/json" }, body: JSON.stringify({ idToken: exchanged.idToken }) });
  if (session.status !== 200) throw new Error("ADMIN_SESSION_FAILED");
  const cookie = session.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error("ADMIN_SESSION_COOKIE_MISSING");
  return cookie;
}

async function removeQuoteFixture() {
  if (!quoteId) return;
  const reference = database.collection("quoteRequests").doc(quoteId), snapshot = await reference.get();
  if (snapshot.exists) {
    const paths = (snapshot.get("attachments") || []).map(item => item.storagePath).filter(path => typeof path === "string" && path.startsWith(`quote-photos/private/requests/${quoteId}/`));
    await Promise.all(paths.map(path => bucket.file(path).delete({ ignoreNotFound: true })));
    await database.recursiveDelete(reference);
  }
  for (const name of ["quoteSubmissionKeys", "quoteDuplicateKeys"]) {
    const matches = await database.collection(name).where("requestId", "==", quoteId).get();
    await Promise.all(matches.docs.map(document => document.ref.delete()));
  }
  result.cleanup.quote = !(await reference.get()).exists;
}

async function removeMediaFixture() {
  if (!mediaId) return;
  const reference = database.collection("media").doc(mediaId), snapshot = await reference.get();
  if (snapshot.exists) {
    const data = snapshot.data(), paths = [data.temporaryPath, data.storagePath, ...(Array.isArray(data.derivatives) ? data.derivatives.map(item => item.storagePath) : [])].filter(Boolean);
    await Promise.all(paths.map(path => bucket.file(path).delete({ ignoreNotFound: true })));
    await database.collection("mediaReferences").doc(mediaId).delete();
    await reference.delete();
  }
  result.cleanup.media = !(await reference.get()).exists;
}

try {
  const cookie = await administratorSession();
  result.checks.adminSession = "approved administrator session created without password handling";

  const unauthorizedMedia = await request("/api/admin/media");
  if (unauthorizedMedia.status !== 401) throw new Error("ANONYMOUS_ADMIN_ACCESS_NOT_DENIED");
  const invalidQuote = await request("/api/quote-requests", { method: "POST", headers: { origin: baseURL, "content-type": "application/json" }, body: "{}" });
  if (invalidQuote.status !== 400) throw new Error("INVALID_QUOTE_NOT_REJECTED");
  result.checks.errorHandling = "anonymous administrator access and invalid quotation rejected";

  const photo = await sharp({ create: { width: 640, height: 400, channels: 3, background: "#74233a" } }).png().withMetadata({ exif: { IFD0: { Copyright: "Synthetic FES controlled staging fixture" } } }).toBuffer();
  const submissionKey = randomUUID(), quotePayload = { schemaVersion: 1, submissionKey, name: "FES Controlled Online Test", email: `${marker}@example.test`, phone: "", preferredContact: "Email", service: "Electrical", selectedServiceIds: [], location: "Synthetic staging location", propertyType: "Commercial", description: "Clearly identified synthetic request for controlled online staging verification.", preferredTimeframe: "", consentAcknowledged: true, attachments: [] };
  const quoteForm = new FormData();
  quoteForm.set("payload", JSON.stringify({ startedAt: Date.now() - 4000, companyWebsite: "", quote: quotePayload }));
  quoteForm.append("photos", new File([photo], "controlled-staging-photo.png", { type: "image/png" }));
  const quoteResponse = await json(await request("/api/quote-requests", { method: "POST", headers: { origin: baseURL, "user-agent": "fes-controlled-online-acceptance", "x-forwarded-for": "192.0.2.80" }, body: quoteForm }));
  if (quoteResponse.status !== 201) throw new Error(`QUOTE_SUBMISSION_FAILED_${quoteResponse.status}`);
  quoteId = quoteResponse.body.reference;
  const quoteDocument = await database.collection("quoteRequests").doc(quoteId).get(), attachments = quoteDocument.get("attachments") || [], retention = quoteDocument.get("retentionUntil");
  if (!quoteDocument.exists || quoteDocument.get("consent.acknowledged") !== true || quoteDocument.get("consent.version") !== "privacy-notice-2026-10-20-v1" || !(retention instanceof Timestamp) || attachments.length !== 1) throw new Error("QUOTE_METADATA_INVALID");
  const retentionDays = Math.round((retention.toMillis() - quoteDocument.get("submittedAt").toMillis()) / 86400000);
  if (retentionDays !== 365 || !String(attachments[0].storagePath).startsWith(`quote-photos/private/requests/${quoteId}/`)) throw new Error("QUOTE_RETENTION_OR_PATH_INVALID");
  const privatePhoto = await request(`/api/admin/enquiries/${quoteId}/attachments/photo-1`, { headers: { cookie } }), anonymousPhoto = await request(`/api/admin/enquiries/${quoteId}/attachments/photo-1`);
  if (privatePhoto.status !== 200 || !String(privatePhoto.headers.get("cache-control")).includes("no-store") || anonymousPhoto.status !== 401) throw new Error("PRIVATE_PHOTO_BOUNDARY_FAILED");
  result.checks.quote = "stored in Firestore with approved consent and 365-day retention";
  result.checks.privatePhoto = "authorized access passed; anonymous access denied; no-store delivery confirmed";

  const mediaForm = new FormData();
  mediaForm.set("file", new File([photo], "controlled-editorial-image.png", { type: "image/png" }));
  mediaForm.set("alt", "Synthetic controlled staging editorial image"); mediaForm.set("caption", "Temporary controlled staging fixture"); mediaForm.set("category", "Electrical"); mediaForm.set("roles", "project-gallery,resource-cover,site-content");
  const mediaResponse = await json(await request("/api/admin/media", { method: "POST", headers: cookieHeaders(cookie), body: mediaForm }));
  if (mediaResponse.status !== 201) throw new Error(`MEDIA_UPLOAD_FAILED_${mediaResponse.status}`);
  mediaId = mediaResponse.body.id;
  const mediaDocument = await database.collection("media").doc(mediaId).get();
  if (mediaDocument.get("status") !== "Ready" || !String(mediaDocument.get("storagePath")).startsWith("editorial/private/originals/") || !Array.isArray(mediaDocument.get("derivatives")) || mediaDocument.get("derivatives").length < 1) throw new Error("MEDIA_PROCESSING_INVALID");
  result.checks.editorialMedia = "validated, metadata-stripped, private original plus public derivatives reached Ready";

  const projectPayload = { title: "FES Controlled Online Project", slug, category: "Electrical", summary: "Clearly identified synthetic project used only for controlled online staging verification.", location: "Synthetic staging location", period: "October 2026", status: "Published", featured: false, gallery: [{ mediaId, alt: "Synthetic controlled staging editorial image", caption: "Temporary controlled staging fixture", order: 0 }], coverMediaId: mediaId };
  const projectResponse = await json(await request("/api/admin/projects", { method: "POST", headers: { ...cookieHeaders(cookie), "content-type": "application/json" }, body: JSON.stringify(projectPayload) }));
  if (projectResponse.status !== 201) throw new Error(`PROJECT_PUBLICATION_FAILED_${projectResponse.status}`);
  projectDocumentId = projectResponse.body.id;
  const publicProject = await request(`/projects/${slug}`, { headers: { "cache-control": "no-cache" } });
  if (publicProject.status !== 200) throw new Error("PUBLISHED_PROJECT_NOT_VISIBLE");
  result.checks.publication = "published synthetic project became publicly readable through the server repository";

  const adminPage = await request(`/admin/enquiries/${quoteId}`, { headers: { cookie } });
  if (adminPage.status !== 200 || !(await adminPage.text()).includes(quoteId)) throw new Error("ADMIN_ENQUIRY_NOT_AVAILABLE");
  result.checks.adminEnquiry = "authorized administrator could immediately open the stored quotation";
} finally {
  if (projectDocumentId) { await database.collection("projects").doc(projectDocumentId).delete(); await database.collection("projectSlugs").doc(slug).delete(); }
  await removeMediaFixture();
  await removeQuoteFixture();
  console.log(JSON.stringify(result, null, 2));
}
