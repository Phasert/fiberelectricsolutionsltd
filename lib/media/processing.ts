import "server-only";

import { createHash } from "node:crypto";
import sharp from "sharp";
import type { EditorialMimeType, MediaDerivative } from "@/lib/media/schemas";

const variants = [{ variant: "sm" as const, width: 640 }, { variant: "md" as const, width: 1280 }, { variant: "lg" as const, width: 1920 }];
const checksum = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

export async function decodeAndProcessImage(input: { bytes: Uint8Array; mimeType: EditorialMimeType; maxPixels: number; maxDimension: number; version: string }) {
  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(input.bytes, { failOn: "error", limitInputPixels: input.maxPixels, sequentialRead: true }).metadata();
  } catch {
    throw new Error("MEDIA_DECODE_INVALID");
  }
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  if (!width || !height || width > input.maxDimension || height > input.maxDimension || width * height > input.maxPixels) throw new Error("MEDIA_DIMENSIONS_INVALID");
  if ((metadata.pages ?? 1) !== 1 || (metadata.pageHeight && metadata.pageHeight !== height)) throw new Error("MEDIA_ANIMATION_INVALID");

  const source = sharp(input.bytes, { failOn: "error", limitInputPixels: input.maxPixels, sequentialRead: true }).rotate().toColourspace("srgb");
  const normalized = input.mimeType === "image/jpeg"
    ? await source.clone().jpeg({ quality: 90, mozjpeg: true }).toBuffer()
    : input.mimeType === "image/png"
      ? await source.clone().png({ compressionLevel: 9 }).toBuffer()
      : await source.clone().webp({ quality: 90 }).toBuffer();
  const normalizedMetadata = await sharp(normalized).metadata();
  const normalizedWidth = normalizedMetadata.width ?? width;
  const normalizedHeight = normalizedMetadata.height ?? height;
  const derivativeBuffers: Array<{ descriptor: Omit<MediaDerivative, "storagePath">; bytes: Buffer }> = [];
  for (const definition of variants.filter((item) => item.width <= normalizedWidth || item.variant === "sm")) {
    const bytes = await sharp(normalized, { limitInputPixels: input.maxPixels }).resize({ width: Math.min(definition.width, normalizedWidth), withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toBuffer();
    const info = await sharp(bytes).metadata();
    derivativeBuffers.push({ descriptor: { variant: definition.variant, mimeType: "image/webp", sizeBytes: bytes.length, width: info.width!, height: info.height!, checksum: checksum(bytes), version: input.version }, bytes });
  }
  return { width: normalizedWidth, height: normalizedHeight, pixelCount: normalizedWidth * normalizedHeight, normalized, checksum: checksum(normalized), derivatives: derivativeBuffers };
}
