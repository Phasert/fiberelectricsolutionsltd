import { z } from "zod";

export const EDITORIAL_MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const EDITORIAL_VIDEO_MAX_BYTES = 150 * 1024 * 1024;
export const EDITORIAL_MEDIA_MAX_DIMENSION = 12000;
export const EDITORIAL_MEDIA_MAX_PIXELS = 40_000_000;
export const editorialMimeSchema = z.enum(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
export const editorialVideoMimeSchema = z.enum(["video/mp4", "video/quicktime"]);
export const mediaCategorySchema = z.enum(["Electrical", "Fiber", "Combined"]);
export const mediaRoleSchema = z.enum(["project-gallery", "resource-cover", "service-image", "site-content", "branding", "general"]);
export const slideshowPlacementSchema = z.enum(["hero", "electrical", "fiber"]);
const slideLinkSchema=z.string().trim().min(1).max(500).refine((value)=>value.startsWith("/")||/^https:\/\//i.test(value),"Use an internal path or HTTPS URL.");
export const mediaSlideshowSchema = z.object({ placement:slideshowPlacementSchema, order:z.number().int().min(0).max(99), alt:z.string().trim().min(1).max(180), focalPoint:z.object({x:z.number().min(0).max(100),y:z.number().min(0).max(100)}).strict(), published:z.boolean(), headline:z.string().trim().max(120).optional(),description:z.string().trim().max(300).optional(),ctaLabel:z.string().trim().max(60).optional(),ctaHref:slideLinkSchema.optional() }).strict();
export const mediaCropSchema=z.object({x:z.number().int().nonnegative(),y:z.number().int().nonnegative(),width:z.number().int().positive(),height:z.number().int().positive(),rotation:z.union([z.literal(0),z.literal(90),z.literal(180),z.literal(270)]),aspectRatio:z.enum(["original","freeform","1:1","4:3","16:9","9:16"])}).strict();
// Field rules without creation defaults. Patches must never inherit defaults, or a partial update
// (publish, reorder) would overwrite stored alt text, captions, categories, project links and roles.
const mediaMetadataFields={alt:z.string().trim().max(180),caption:z.string().trim().max(300),category:mediaCategorySchema,projectId:z.union([z.string().trim().min(1).max(128),z.null()]),roles:z.array(mediaRoleSchema).max(6),galleryPublished:z.boolean(),galleryExcluded:z.boolean(),galleryOrder:z.number().int().min(0).max(10_000)};
export const mediaMetadataInputSchema = z.object({ alt:mediaMetadataFields.alt.default(""), caption:mediaMetadataFields.caption.default(""), category:mediaMetadataFields.category.default("Combined"), projectId:mediaMetadataFields.projectId.default(null), roles:mediaMetadataFields.roles.default(["general"]),galleryPublished:mediaMetadataFields.galleryPublished.default(false),galleryExcluded:mediaMetadataFields.galleryExcluded.default(false),galleryOrder:mediaMetadataFields.galleryOrder.default(0) }).strict();
export const mediaPatchSchema = z.object(mediaMetadataFields).partial().extend({crop:z.union([mediaCropSchema,z.null()]).optional(),slideshow:z.union([mediaSlideshowSchema.omit({ctaLabel:true,ctaHref:true}).strict(),z.null()]).optional()}).strict();
export type MediaMetadataInput=z.infer<typeof mediaMetadataInputSchema>;
export type EditorialMimeType=z.infer<typeof editorialMimeSchema>;
export type MediaDerivative={variant:"sm"|"md"|"lg";storagePath:string;mimeType:"image/webp";sizeBytes:number;width:number;height:number;checksum:string;version:string};
export type EditorialMediaRecord=MediaMetadataInput&{schemaVersion:2;kind:"editorial-image";status:"Pending"|"Processing"|"Ready"|"Failed"|"Deleting"|"Deleted";originalName:string;storagePath:string;mimeType:EditorialMimeType;sizeBytes:number;width:number;height:number;pixelCount:number;checksum:string;version:string;derivatives:MediaDerivative[];failureCode:string|null;crop?:z.infer<typeof mediaCropSchema>|null;slideshow?:z.infer<typeof mediaSlideshowSchema>|null};
export type EditorialVideoRecord=MediaMetadataInput&{schemaVersion:2;kind:"editorial-video";status:"Pending"|"Processing"|"Ready"|"Failed"|"Deleting"|"Deleted";originalName:string;storagePath:string;mimeType:"video/mp4"|"video/quicktime";sizeBytes:number;width:number;height:number;durationSeconds:number|null;checksum:string;version:string;derivatives:[];posterMediaId:null;failureCode:string|null};
