import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FIREBASE_CACHE_NAMESPACE } from "@/lib/firebase/cache-namespace";
import { PUBLIC_PROJECTS_TAG } from "@/lib/projects/public-cache";
import { getPublicMediaDetails, getPublicMediaUrl } from "@/lib/media/public-repository";
import type { ProjectCategory, ProjectImage, PublicProject } from "@/types/content";
import { curatedProjects } from "@/lib/projects/curated";

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
const storedProjectSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(120),
  category: z.enum(["Electrical", "Fiber", "Combined"]),
  summary: z.string().trim().max(500).default(""),
  description: z.string().trim().max(10_000).optional(),
  location: z.string().trim().max(120).optional().default(""),
  period: z.string().trim().max(80).optional().default(""),
  status: z.literal("Published"),
  featured: z.boolean().optional().default(false),
  coverMediaId: z.string().trim().max(128).nullable().optional().default(null),
  gallery: z.array(z.object({
    mediaId: z.string().trim().min(1).max(128),
    alt: z.string().trim().min(1).max(180),
    caption: z.string().trim().max(300).optional().default(""),
    order: z.number().int().min(0).max(100),
  })).max(200).optional().default([]),
  publishedAt: z.unknown().optional(),
  updatedAt: z.unknown().optional(),
});

const placeholderByCategory: Record<ProjectCategory, string> = {
  Electrical: "/images/project-electrical.svg",
  Fiber: "/images/project-fiber.svg",
  Combined: "/images/project-combined.svg",
};

function toIsoDate(value: unknown) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return undefined;
}

export function projectPlaceholder(category: ProjectCategory) {
  return placeholderByCategory[category];
}

async function normalizeProject(id: string, raw: unknown): Promise<PublicProject | null> {
  const parsed = storedProjectSchema.safeParse(raw);
  if (!parsed.success) return null;
  const project = parsed.data;
  const placeholder = projectPlaceholder(project.category);
  const publicTitle = project.category === "Fiber" ? "Fiber Optic Project" : project.category === "Combined" ? "Electrical & Fiber Optic Project" : "Electrical Project";
  const mediaDetails=await getPublicMediaDetails(project.gallery.map(item=>item.mediaId),"lg");
  const gallery: ProjectImage[] = project.gallery
    .toSorted((left, right) => left.order - right.order)
    .map(item => ({ ...(mediaDetails.get(item.mediaId)??{src:placeholder,type:"image" as const}), alt: item.alt }));
  const cover = project.gallery.find(item => item.mediaId === project.coverMediaId) ?? project.gallery.toSorted((a, b) => a.order - b.order)[0];

  return {
    id,
    slug: project.slug,
    title: publicTitle,
    category: project.category,
    summary: "",
    featuredImage: (mediaDetails.get(cover?.mediaId??"")?.type==="image"?await getPublicMediaUrl(cover?.mediaId,"md"):mediaDetails.get(cover?.mediaId??"")?.poster) ?? placeholder,
    featuredImageAlt: cover?.alt || `${publicTitle} image`,
    gallery,
    featured: project.featured,
    ...(toIsoDate(project.publishedAt) ? { publishedAt: toIsoDate(project.publishedAt) } : {}),
    ...(toIsoDate(project.updatedAt) ? { updatedAt: toIsoDate(project.updatedAt) } : {}),
  };
}

export async function getPublicProjectByIdUncached(id:string):Promise<PublicProject|null>{const curated=curatedProjects.find(project=>project.id===id);if(curated)return curated;if(!z.string().trim().min(1).max(128).safeParse(id).success)return null;const document=await getAdminFirestore().collection("projects").doc(id).get();return document.exists?normalizeProject(document.id,document.data()):null}

export async function listPublicProjectsUncached(): Promise<PublicProject[]> {
  const database = getAdminFirestore();
  const [snapshot, ...managedDocuments] = await Promise.all([
    database.collection("projects").where("status", "==", "Published").get(),
    ...curatedProjects.flatMap((project) => [
      database.collection("projectSlugs").doc(project.slug).get(),
      database.collection("projectMigrations").doc(project.slug).get(),
    ]),
  ]);
  const managed=(await Promise.all(snapshot.docs
    .map(document => normalizeProject(document.id, document.data()))))
    .filter((project): project is PublicProject => project !== null);
  const managedSlugs = new Set(managedDocuments.filter((document) => document.exists).map((document) => document.id));
  const merged=new Map(curatedProjects.filter((project) => !managedSlugs.has(project.slug)).map(project=>[project.slug,project]));
  managed.forEach(project=>merged.set(project.slug,project));
  return [...merged.values()].toSorted((left, right) => (right.publishedAt ?? "").localeCompare(left.publishedAt ?? "") || left.title.localeCompare(right.title));
}

export async function getPublicProjectBySlugUncached(slug: string): Promise<PublicProject | null> {
  if (!slugSchema.safeParse(slug).success) return null;
  const curated=curatedProjects.find(project=>project.slug===slug);
  const database = getAdminFirestore();
  const [slugDocument,migrationDocument] = await Promise.all([database.collection("projectSlugs").doc(slug).get(),database.collection("projectMigrations").doc(slug).get()]);
  if (!slugDocument.exists) return migrationDocument.exists?null:curated??null;
  const projectId = slugDocument.get("projectId");
  if (typeof projectId !== "string" || !projectId) return null;
  const projectDocument = await database.collection("projects").doc(projectId).get();
  if (!projectDocument.exists) return null;
  const project = await normalizeProject(projectDocument.id, projectDocument.data());
  return project?.slug === slug ? project : null;
}

// v2 cold-starts the managed project read path after the Tommy's Brentwood cutover.
const listCached = unstable_cache(listPublicProjectsUncached, ["public-projects-list-v2",FIREBASE_CACHE_NAMESPACE], {
  tags: [PUBLIC_PROJECTS_TAG],
  revalidate: 3600,
});
const getBySlugCached = unstable_cache(getPublicProjectBySlugUncached, ["public-project-by-slug-v2",FIREBASE_CACHE_NAMESPACE], {
  tags: [PUBLIC_PROJECTS_TAG],
  revalidate: 3600,
});

export const listPublicProjects = cache(listCached);
export const getPublicProjectBySlug = cache(getBySlugCached);
