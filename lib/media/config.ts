import "server-only";

import { z } from "zod";

export const APPROVED_EDITORIAL_PROJECT_ID = "fesr-c3ae1";
export const APPROVED_EDITORIAL_BUCKET = "fesr-c3ae1.firebasestorage.app";

const positiveInteger = (fallback: number) => z.coerce.number().int().positive().catch(fallback);

export type EditorialStorageMode = "emulator" | "live-disabled" | "approved-staging";

export function getEditorialMediaConfig() {
  const emulator = Boolean(process.env.FIREBASE_STORAGE_EMULATOR_HOST);
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "";
  const liveRequested = process.env.EDITORIAL_MEDIA_LIVE_ENABLED === "true";
  const allowedProjectId = process.env.EDITORIAL_MEDIA_ALLOWED_PROJECT_ID || APPROVED_EDITORIAL_PROJECT_ID;
  const allowedBucket = process.env.EDITORIAL_MEDIA_ALLOWED_BUCKET || APPROVED_EDITORIAL_BUCKET;

  if (liveRequested && emulator) throw new Error("MEDIA_LIVE_EMULATOR_CONFLICT");
  if (liveRequested && (projectId !== APPROVED_EDITORIAL_PROJECT_ID || projectId !== allowedProjectId || bucket !== APPROVED_EDITORIAL_BUCKET || bucket !== allowedBucket)) {
    throw new Error("MEDIA_LIVE_TARGET_INVALID");
  }

  const mode: EditorialStorageMode = emulator ? "emulator" : liveRequested ? "approved-staging" : "live-disabled";
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
