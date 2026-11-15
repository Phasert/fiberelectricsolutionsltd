import { z } from "zod";

export const featuredSelectionSchema = z.object({
  projectId: z.string().trim().default(""),
  mediaId: z.string().trim().min(1).max(128).optional(),
  resourceId: z.string().trim().default(""),
  tipIds: z.array(z.string().trim().min(1)).max(12).refine((ids) => new Set(ids).size === ids.length, "Featured tips cannot contain duplicates."),
}).refine(value=>Boolean(value.projectId),"Select a published project collection.");

export type FeaturedSelection = z.infer<typeof featuredSelectionSchema>;
