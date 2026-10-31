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
  projectId: idSchema,
  resourceId: z.union([idSchema, z.literal("")]).default(""),
  tipIds: z.array(idSchema).max(12).refine((ids) => new Set(ids).size === ids.length),
});
const tipSchema = z.object({
  type: z.enum(["Do", "Don’t"]),
  title: z.string().trim().min(1).max(80),
  body: z.string().trim().min(1).max(220),
  enabled: z.literal(true),
});

const empty: PublicFeaturedContent = { project: null, resource: null, tips: [] };
const fixturePattern = /\bphase\s+[a-z]\d+\b|\bstaging(?:[- ]only)?\b|\bbrowser\s+(?:test|verification|resource)\b|\bemulator\b/i;

function isClearlyLabelledFixture(...values: string[]) {
  return fixturePattern.test(values.join(" "));
}

export async function getPublicHomepageFeaturedUncached(): Promise<PublicFeaturedContent> {
  const database = getAdminFirestore();
  const selectionDocument = await database.collection("featuredContent").doc("homepage").get();
  if (!selectionDocument.exists) return empty;
  const selection = selectionSchema.safeParse(selectionDocument.data());
  if (!selection.success) return empty;

  const [selectedProject, selectedResource, ...tipDocuments] = await Promise.all([
    getPublicProjectByIdUncached(selection.data.projectId),
    selection.data.resourceId?getPublicResourceByIdUncached(selection.data.resourceId):Promise.resolve(null),
    ...selection.data.tipIds.map((id) => database.collection("tips").doc(id).get()),
  ]);

  const project = selectedProject&&!isClearlyLabelledFixture(selectedProject.title,selectedProject.summary)?selectedProject:null;
  const resource = selectedResource&&!isClearlyLabelledFixture(selectedResource.title,selectedResource.summary)?selectedResource:null;
  const tips: PublicTip[] = tipDocuments.flatMap((document) => {
    if (!document.exists) return [];
    const parsed = tipSchema.safeParse(document.data());
    if (!parsed.success || isClearlyLabelledFixture(parsed.data.title, parsed.data.body)) return [];
    return [{ id: document.id, type: parsed.data.type === "Do" ? "do" as const : "dont" as const, title: parsed.data.title, body: parsed.data.body }];
  });

  return { project, resource, tips };
}

const getCached = unstable_cache(getPublicHomepageFeaturedUncached, ["public-homepage-featured-v1",FIREBASE_CACHE_NAMESPACE], {
  tags: [PUBLIC_HOMEPAGE_FEATURED_TAG],
  revalidate: 3600,
});

export const getPublicHomepageFeatured = cache(getCached);
