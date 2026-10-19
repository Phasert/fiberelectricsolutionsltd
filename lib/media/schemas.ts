import { z } from "zod";

export const EDITORIAL_MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const EDITORIAL_MEDIA_MAX_DIMENSION = 12000;
export const editorialMimeSchema = z.enum(["image/jpeg", "image/png", "image/webp"]);
export const mediaCategorySchema = z.enum(["Electrical", "Fiber", "Combined"]);
export const mediaMetadataInputSchema = z.object({ alt:z.string().trim().min(1,"Alternative text is required.").max(180), caption:z.string().trim().max(300).default(""), category:mediaCategorySchema.default("Combined"), projectId:z.union([z.string().trim().min(1).max(128),z.null()]).default(null) }).strict();
export const mediaPatchSchema = mediaMetadataInputSchema.partial().strict();
export type MediaMetadataInput=z.infer<typeof mediaMetadataInputSchema>;
export type EditorialMimeType=z.infer<typeof editorialMimeSchema>;
export type EditorialMediaRecord=MediaMetadataInput&{schemaVersion:1;kind:"editorial-image";status:"Pending"|"Ready"|"Failed";originalName:string;storagePath:string;mimeType:EditorialMimeType;sizeBytes:number;width:number;height:number;failureCode:string|null};
