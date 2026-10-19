import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { PUBLIC_PROJECTS_TAG } from "@/lib/projects/public-cache";
import type { ProjectCategory, ProjectImage, PublicProject } from "@/types/content";

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
const storedProjectSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(120),
  category: z.enum(["Electrical", "Fiber", "Combined"]),
  summary: z.string().trim().min(1).max(500),
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
  })).max(30).optional().default([]),
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

function normalizeProject(id: string, raw: unknown): PublicProject | null {
  const parsed = storedProjectSchema.safeParse(raw);
  if (!parsed.success) return null;
  const project = parsed.data;
  const placeholder = projectPlaceholder(project.category);
  const gallery: ProjectImage[] = project.gallery
    .toSorted((left, right) => left.order - right.order)
    .map(item => ({ src: placeholder, alt: item.alt, ...(item.caption ? { caption: item.caption } : {}) }));
  const cover = project.gallery.find(item => item.mediaId === project.coverMediaId) ?? project.gallery.toSorted((a, b) => a.order - b.order)[0];

  return {
    id,
    slug: project.slug,
    title: project.title,
    category: project.category,
    summary: project.summary,
    ...(project.description ? { description: project.description } : {}),
    ...(project.location ? { location: project.location } : {}),
    ...(project.period ? { period: project.period } : {}),
    featuredImage: placeholder,
    featuredImageAlt: cover?.alt || `${project.title} project image placeholder`,
    gallery,
    featured: project.featured,
    ...(toIsoDate(project.publishedAt) ? { publishedAt: toIsoDate(project.publishedAt) } : {}),
    ...(toIsoDate(project.updatedAt) ? { updatedAt: toIsoDate(project.updatedAt) } : {}),
  };
}

export async function listPublicProjectsUncached(): Promise<PublicProject[]> {
  const snapshot = await getAdminFirestore().collection("projects").where("status", "==", "Published").get();
  return snapshot.docs
    .map(document => normalizeProject(document.id, document.data()))
    .filter((project): project is PublicProject => project !== null)
    .toSorted((left, right) => (right.publishedAt ?? "").localeCompare(left.publishedAt ?? "") || left.title.localeCompare(right.title));
}

export async function getPublicProjectBySlugUncached(slug: string): Promise<PublicProject | null> {
  if (!slugSchema.safeParse(slug).success) return null;
  const database = getAdminFirestore();
  const slugDocument = await database.collection("projectSlugs").doc(slug).get();
  if (!slugDocument.exists) return null;
  const projectId = slugDocument.get("projectId");
  if (typeof projectId !== "string" || !projectId) return null;
  const projectDocument = await database.collection("projects").doc(projectId).get();
  if (!projectDocument.exists) return null;
  const project = normalizeProject(projectDocument.id, projectDocument.data());
  return project?.slug === slug ? project : null;
}

const listCached = unstable_cache(listPublicProjectsUncached, ["public-projects-list-v1"], {
  tags: [PUBLIC_PROJECTS_TAG],
  revalidate: 3600,
});
const getBySlugCached = unstable_cache(getPublicProjectBySlugUncached, ["public-project-by-slug-v1"], {
  tags: [PUBLIC_PROJECTS_TAG],
  revalidate: 3600,
});

export const listPublicProjects = cache(listCached);
export const getPublicProjectBySlug = cache(getBySlugCached);
