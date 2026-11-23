import "server-only";

export const APPROVED_QUOTE_TARGETS = {
  staging: { projectId: "fesr-c3ae1", bucket: "fesr-c3ae1.firebasestorage.app" },
  production: { projectId: "fesproject-45db0", bucket: "fesproject-45db0.firebasestorage.app" },
} as const;
export const APPROVED_QUOTE_RETENTION_DAYS = 365;
export const APPROVED_QUOTE_CONSENT_VERSION = "privacy-notice-2026-10-20-v1";
export type QuoteSubmissionMode = "emulator" | "live-disabled" | "approved-staging" | "approved-production";

export function getQuoteSubmissionConfig() {
  const emulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "";
  const liveRequested = process.env.QUOTE_SUBMISSIONS_LIVE_ENABLED === "true";
  const environment = process.env.QUOTE_LIVE_ENVIRONMENT;
  const target = environment === "staging" || environment === "production" ? APPROVED_QUOTE_TARGETS[environment] : null;
  const allowedProjectId = process.env.QUOTE_ALLOWED_PROJECT_ID || "";
  const allowedBucket = process.env.QUOTE_ALLOWED_BUCKET || "";
  const privacyApproved = process.env.QUOTE_PRIVACY_APPROVED === "true";
  const consentVersion = process.env.QUOTE_CONSENT_VERSION?.trim() || "";
  const abuseHashSecret = process.env.QUOTE_ABUSE_HASH_SECRET?.trim() || "";
  const retentionDays = Number(process.env.QUOTE_RETENTION_DAYS || 0);
  const photoUploadsApproved = process.env.QUOTE_PHOTO_UPLOADS_LIVE_ENABLED === "true";
  const photoConsentApproved = process.env.QUOTE_PHOTO_CONSENT_APPROVED === "true";

  if (liveRequested && emulator) throw new Error("QUOTE_LIVE_EMULATOR_CONFLICT");
  if (liveRequested && (!target || projectId !== target.projectId || projectId !== allowedProjectId || bucket !== target.bucket || bucket !== allowedBucket)) throw new Error("QUOTE_LIVE_TARGET_INVALID");
  if (liveRequested && (!privacyApproved || !consentVersion || abuseHashSecret.length < 32 || !Number.isInteger(retentionDays) || retentionDays < 1)) throw new Error("QUOTE_OWNER_APPROVALS_MISSING");

  const mode: QuoteSubmissionMode = emulator ? "emulator" : liveRequested ? `approved-${environment}` as QuoteSubmissionMode : "live-disabled";
  const attachmentLimits={maxFiles:4,maxFileBytes:5*1024*1024,maxTotalBytes:12*1024*1024,maxPixels:20_000_000,maxDimension:8_000,outputMaxDimension:2_000};
  return { mode, projectId, bucket, consentVersion: emulator ? APPROVED_QUOTE_CONSENT_VERSION : consentVersion, retentionDays: emulator ? APPROVED_QUOTE_RETENTION_DAYS : retentionDays, abuseHashSecret: emulator ? "local-emulator-only-abuse-hash-secret" : abuseHashSecret, maxBodyBytes: 16 * 1024, maxMultipartBodyBytes:attachmentLimits.maxTotalBytes+256*1024,attachmentsEnabled:emulator||(mode!=="live-disabled"&&photoUploadsApproved&&photoConsentApproved),attachmentLimits,rateLimit: 5, rateWindowMs: 15 * 60 * 1000, duplicateWindowMs: 10 * 60 * 1000 };
}

export function requireQuoteSubmissionsEnabled() {
  const config = getQuoteSubmissionConfig();
  if (config.mode === "live-disabled") throw new Error("LIVE_QUOTE_SUBMISSIONS_NOT_APPROVED");
  return config;
}

export function quoteSubmissionsAreEnabled() {
  try {
    return getQuoteSubmissionConfig().mode !== "live-disabled";
  } catch {
    // The submission API remains fail-closed through getQuoteSubmissionConfig.
    // Public pages should still render when deployment approval settings are
    // incomplete so visitors can review the form and retry after configuration
    // is corrected.
    return false;
  }
}
