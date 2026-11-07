import "server-only";

import { z } from "zod";

export const APPROVED_EDITORIAL_TARGETS = {
  staging: { projectId: "fesr-c3ae1", bucket: "fesr-c3ae1.firebasestorage.app" },
  production: { projectId: "fesproject-45db0", bucket: "fesproject-45db0.firebasestorage.app" },
} as const;

const positiveInteger = (fallback: number) => z.coerce.number().int().positive().catch(fallback);

export type EditorialStorageMode = "emulator" | "live-disabled" | "approved-staging" | "approved-production";

export function getEditorialMediaConfig() {
  const emulator = Boolean(process.env.FIREBASE_STORAGE_EMULATOR_HOST);
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "";
  const liveRequested = process.env.EDITORIAL_MEDIA_LIVE_ENABLED === "true";
  const environment = process.env.EDITORIAL_MEDIA_LIVE_ENVIRONMENT;
  const target = environment === "staging" || environment === "production" ? APPROVED_EDITORIAL_TARGETS[environment] : null;
  const allowedProjectId = process.env.EDITORIAL_MEDIA_ALLOWED_PROJECT_ID || "";
  const allowedBucket = process.env.EDITORIAL_MEDIA_ALLOWED_BUCKET || "";

  if (liveRequested && emulator) throw new Error("MEDIA_LIVE_EMULATOR_CONFLICT");
  if (liveRequested && (!target || projectId !== target.projectId || projectId !== allowedProjectId || bucket !== target.bucket || bucket !== allowedBucket)) {
    throw new Error("MEDIA_LIVE_TARGET_INVALID");
  }

  const mode: EditorialStorageMode = emulator ? "emulator" : liveRequested ? `approved-${environment}` as EditorialStorageMode : "live-disabled";
  return {
    mode,
    projectId,
    bucket,
    maxBytes: positiveInteger(10 * 1024 * 1024).parse(process.env.EDITORIAL_MEDIA_MAX_BYTES),
    maxVideoBytes: positiveInteger(150 * 1024 * 1024).parse(process.env.EDITORIAL_VIDEO_MAX_BYTES),
    maxPixels: positiveInteger(40_000_000).parse(process.env.EDITORIAL_MEDIA_MAX_PIXELS),
    maxDimension: positiveInteger(12_000).parse(process.env.EDITORIAL_MEDIA_MAX_DIMENSION),
    dailyAdminLimit: positiveInteger(100).parse(process.env.EDITORIAL_MEDIA_DAILY_ADMIN_LIMIT),
  };
}

export function requireEditorialStorageEnabled() {
  const config = getEditorialMediaConfig();
  if (config.mode === "live-disabled") throw new Error("LIVE_STORAGE_NOT_APPROVED");
  return config;
}

export function requireEditorialStorageReadable() {
  const config = getEditorialMediaConfig();
  if (config.mode === "emulator") return config;
  const approved = Object.values(APPROVED_EDITORIAL_TARGETS).some(
    target => target.projectId === config.projectId && target.bucket === config.bucket,
  );
  if (!approved) throw new Error("MEDIA_READ_TARGET_INVALID");
  return config;
}
