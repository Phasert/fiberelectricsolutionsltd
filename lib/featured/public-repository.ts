import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FIREBASE_CACHE_NAMESPACE } from "@/lib/firebase/cache-namespace";
import { PUBLIC_HOMEPAGE_FEATURED_TAG } from "@/lib/featured/public-cache";
import { getPublicProjectByIdUncached } from "@/lib/projects/public-repository";
import { getPublicResourceByIdUncached } from "@/lib/resources/public-repository";
import type { PublicFeaturedContent, PublicTip } from "@/types/content";

const idSchema = z.string().trim().min(1).max(128);
const selectionSchema = z.object({
  projectId: z.union([idSchema,z.literal("")]).default(""),
  mediaId: idSchema.optional(),
  resourceId: z.union([idSchema, z.literal("")]).default(""),
  tipIds: z.array(idSchema).max(12).refine((ids) => new Set(ids).size === ids.length),
});
const tipSchema = z.object({
  type: z.enum(["Do", "Don’t"]),
  title: z.string().trim().max(80).default(""),
  body: z.string().trim().min(1).max(220),
  enabled: z.literal(true),
  category: z.enum(["Electrical", "Fiber Optic", "General"]).optional().default("General"),
  imageMediaId: z.string().trim().min(1).max(128).nullable().optional().default(null),
});

const empty: PublicFeaturedContent = { project: null, resource: null, tips: [] };
const fixturePattern = /\bphase\s+[a-z]\d+\b|\bstaging(?:[- ]only)?\b|\bbrowser\s+(?:test|verification|resource)\b|\bemulator\b/i;

function isClearlyLabelledFixture(...values: string[]) {
  return fixturePattern.test(values.join(" "));
}

export async function getPublicHomepageFeaturedUncached(): Promise<PublicFeaturedContent> {
  const database = getAdminFirestore();
  const selectionDocument = await database.collection("featuredContent").doc("homepage").get();
  const selection = selectionDocument.exists ? selectionSchema.safeParse(selectionDocument.data()) : null;
  if (selection && !selection.success) return empty;
  const selected = selection?.success ? selection.data : { projectId: "", resourceId: "", tipIds: [] };
  const tipDocuments = selected.tipIds.length
    ? await Promise.all(selected.tipIds.map((id) => database.collection("tips").doc(id).get()))
    : (await database.collection("tips").where("enabled", "==", true).get()).docs.sort(
        (left, right) => Number(left.data().order) - Number(right.data().order),
      );
  const selectedProjectSource=selected.projectId?await database.collection("projects").doc(selected.projectId).get():null;

  const [selectedProject, selectedResource] = await Promise.all([
    selected.projectId?getPublicProjectByIdUncached(selected.projectId):Promise.resolve(null),
    selected.resourceId?getPublicResourceByIdUncached(selected.resourceId):Promise.resolve(null),
  ]);

  const sourceData=selectedProjectSource?.data(),project = selectedProject&&!isClearlyLabelledFixture(String(sourceData?.title??""),String(sourceData?.summary??""))?selectedProject:null;
  const resource = selectedResource&&!isClearlyLabelledFixture(selectedResource.title,selectedResource.summary)?selectedResource:null;
  const tips: PublicTip[] = tipDocuments.flatMap((document) => {
    if (!document.exists) return [];
    const parsed = tipSchema.safeParse(document.data());
    if (!parsed.success || isClearlyLabelledFixture(parsed.data.title, parsed.data.body)) return [];
    return [{ id: document.id, type: parsed.data.type === "Do" ? "do" as const : "dont" as const, title: parsed.data.title, body: parsed.data.body, category: parsed.data.category, ...(parsed.data.imageMediaId ? { image: `/media/${parsed.data.imageMediaId}/md` } : {}) }];
  });

  return { project, resource, tips };
}

const getCached = unstable_cache(getPublicHomepageFeaturedUncached, ["public-homepage-featured-v2",FIREBASE_CACHE_NAMESPACE], {
  tags: [PUBLIC_HOMEPAGE_FEATURED_TAG],
  revalidate: 3600,
});

export const getPublicHomepageFeatured = cache(getCached);
