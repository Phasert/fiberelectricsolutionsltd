import { NextResponse } from "next/server";
import {
  requestHasTrustedOrigin,
  verifyAdminSession,
} from "@/lib/auth/session";
import {
  getEditorialStorageMode,
  listAdminMedia,
  updateMediaMetadata,
  uploadEditorialMedia,
} from "@/lib/media/repository";

export const runtime = "nodejs";
export async function GET() {
  if (!(await verifyAdminSession()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    items: await listAdminMedia(),
    storageMode: getEditorialStorageMode(),
  });
}
export async function POST(request: Request) {
  if (!requestHasTrustedOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const admin = await verifyAdminSession();
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (getEditorialStorageMode() === "live-disabled")
    return NextResponse.json(
      { error: "Live Firebase Storage is awaiting owner approval." },
      { status: 503 },
    );
  try {
    const form = await request.formData(),
      file = form.get("file");
    if (!(file instanceof File))
      return NextResponse.json(
        { error: "Choose a media file." },
        { status: 400 },
      );
    const cropValue = String(form.get("crop") ?? "");
    const crop = cropValue ? JSON.parse(cropValue) : null,
      lower = file.name.toLowerCase(),
      mimeType =
        lower.endsWith(".heic")
          ? "image/heic"
          : lower.endsWith(".heif")
            ? "image/heif"
            : file.type ||
              (lower.endsWith(".mov")
                ? "video/quicktime"
                : lower.endsWith(".mp4")
                  ? "video/mp4"
                  : "");
    const kind = form.get("kind");
    if ((kind === "image" || kind === "video") && !mimeType.startsWith(`${kind}/`))
      return NextResponse.json(
        { error: kind === "image" ? "Choose a supported image." : "Choose a supported video." },
        { status: 400 },
      );
    const id = await uploadEditorialMedia(
      {
        bytes: new Uint8Array(await file.arrayBuffer()),
        mimeType,
        originalName: file.name,
        metadata: {
          alt: String(form.get("alt") ?? ""),
          caption: String(form.get("caption") ?? ""),
          category: String(form.get("category") ?? "Combined"),
          projectId: String(form.get("projectId") ?? "") || null,
          roles: String(form.get("roles") ?? "general")
            .split(",")
            .filter(Boolean),
          galleryPublished: form.get("galleryPublished") === "true",
          galleryExcluded: false,
          galleryOrder: Number(form.get("galleryOrder") ?? 0),
        },
      },
      admin.uid,
    );
    if (crop) await updateMediaMetadata(id, { crop }, admin.uid);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "",
      messages: Record<string, string> = {
        MEDIA_SIZE_INVALID: "The media file exceeds the configured size limit.",
        MEDIA_SIGNATURE_INVALID:
          "The file content does not match its media type.",
        MEDIA_DIMENSIONS_INVALID:
          "The image dimensions or decoded pixel count are unsafe.",
        MEDIA_ANIMATION_INVALID: "Animated images are not supported.",
        MEDIA_DECODE_INVALID: "The image could not be decoded safely.",
        MEDIA_HEIC_CONVERSION_FAILED:
          "This HEIC photo could not be converted. Try exporting it as a JPEG.",
        MEDIA_DUPLICATE: "This exact media file is already in the library.",
        MEDIA_QUOTA_EXCEEDED:
          "The administrator upload quota has been reached.",
      };
    return NextResponse.json(
      { error: messages[code] ?? "Media validation or processing failed." },
      { status: code === "MEDIA_QUOTA_EXCEEDED" ? 429 : 400 },
    );
  }
}
