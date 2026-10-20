import { z } from "zod";

export const EDITORIAL_MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const EDITORIAL_MEDIA_MAX_DIMENSION = 12000;
export const EDITORIAL_MEDIA_MAX_PIXELS = 40_000_000;
export const editorialMimeSchema = z.enum(["image/jpeg", "image/png", "image/webp"]);
export const mediaCategorySchema = z.enum(["Electrical", "Fiber", "Combined"]);
export const mediaRoleSchema = z.enum(["project-gallery", "resource-cover", "service-image", "site-content", "branding", "general"]);
export const mediaMetadataInputSchema = z.object({ alt:z.string().trim().min(1,"Alternative text is required.").max(180), caption:z.string().trim().max(300).default(""), category:mediaCategorySchema.default("Combined"), projectId:z.union([z.string().trim().min(1).max(128),z.null()]).default(null), roles:z.array(mediaRoleSchema).max(6).default(["general"]) }).strict();
export const mediaPatchSchema = mediaMetadataInputSchema.partial().strict();
export type MediaMetadataInput=z.infer<typeof mediaMetadataInputSchema>;
export type EditorialMimeType=z.infer<typeof editorialMimeSchema>;
export type MediaDerivative={variant:"sm"|"md"|"lg";storagePath:string;mimeType:"image/webp";sizeBytes:number;width:number;height:number;checksum:string;version:string};
export type EditorialMediaRecord=MediaMetadataInput&{schemaVersion:2;kind:"editorial-image";status:"Pending"|"Processing"|"Ready"|"Failed"|"Deleting"|"Deleted";originalName:string;storagePath:string;mimeType:EditorialMimeType;sizeBytes:number;width:number;height:number;pixelCount:number;checksum:string;version:string;derivatives:MediaDerivative[];failureCode:string|null};
