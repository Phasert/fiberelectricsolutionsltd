import "server-only";

export const APPROVED_QUOTE_PROJECT_ID = "fesr-c3ae1";
export type QuoteSubmissionMode = "emulator" | "live-disabled" | "approved-staging";

export function getQuoteSubmissionConfig() {
  const emulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
  const liveRequested = process.env.QUOTE_SUBMISSIONS_LIVE_ENABLED === "true";
  const privacyApproved = process.env.QUOTE_PRIVACY_APPROVED === "true";
  const consentVersion = process.env.QUOTE_CONSENT_VERSION?.trim() || "";
  const abuseHashSecret = process.env.QUOTE_ABUSE_HASH_SECRET?.trim() || "";
  const retentionDays = Number(process.env.QUOTE_RETENTION_DAYS || 0);
  const photoUploadsApproved = process.env.QUOTE_PHOTO_UPLOADS_LIVE_ENABLED === "true";
  const photoConsentApproved = process.env.QUOTE_PHOTO_CONSENT_APPROVED === "true";

  if (liveRequested && emulator) throw new Error("QUOTE_LIVE_EMULATOR_CONFLICT");
  if (liveRequested && projectId !== APPROVED_QUOTE_PROJECT_ID) throw new Error("QUOTE_LIVE_TARGET_INVALID");
  if (liveRequested && (!privacyApproved || !consentVersion || abuseHashSecret.length < 32 || !Number.isInteger(retentionDays) || retentionDays < 1)) throw new Error("QUOTE_OWNER_APPROVALS_MISSING");

  const mode: QuoteSubmissionMode = emulator ? "emulator" : liveRequested ? "approved-staging" : "live-disabled";
  const attachmentLimits={maxFiles:4,maxFileBytes:5*1024*1024,maxTotalBytes:12*1024*1024,maxPixels:20_000_000,maxDimension:8_000,outputMaxDimension:2_000};
  return { mode, projectId, consentVersion: emulator ? "emulator-test-v1" : consentVersion, retentionDays: emulator ? 30 : retentionDays, abuseHashSecret: emulator ? "local-emulator-only-abuse-hash-secret" : abuseHashSecret, maxBodyBytes: 16 * 1024, maxMultipartBodyBytes:attachmentLimits.maxTotalBytes+256*1024,attachmentsEnabled:emulator||(mode==="approved-staging"&&photoUploadsApproved&&photoConsentApproved),attachmentLimits,rateLimit: 5, rateWindowMs: 15 * 60 * 1000, duplicateWindowMs: 10 * 60 * 1000 };
}

export function requireQuoteSubmissionsEnabled() {
  const config = getQuoteSubmissionConfig();
  if (config.mode === "live-disabled") throw new Error("LIVE_QUOTE_SUBMISSIONS_NOT_APPROVED");
  return config;
}
