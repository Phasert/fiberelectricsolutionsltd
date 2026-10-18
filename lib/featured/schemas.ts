import { z } from "zod";

export const featuredSelectionSchema = z.object({
  projectId: z.string().trim().min(1, "Select a published project."),
  resourceId: z.string().trim().default(""),
  tipIds: z.array(z.string().trim().min(1)).max(12).refine((ids) => new Set(ids).size === ids.length, "Featured tips cannot contain duplicates."),
});

export type FeaturedSelection = z.infer<typeof featuredSelectionSchema>;
