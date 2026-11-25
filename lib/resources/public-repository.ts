import "server-only";
import { formatFibreText } from "@/lib/site-content/spelling";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FIREBASE_CACHE_NAMESPACE } from "@/lib/firebase/cache-namespace";
import { PUBLIC_RESOURCES_TAG } from "@/lib/resources/public-cache";
import { sanitizeRichText } from "@/lib/resources/schemas";
import { getPublicMediaUrl } from "@/lib/media/public-repository";
import type { PublicArticle, PublicExternalResource, PublicRichTextNode, ResourceCategory } from "@/types/content";

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120);
const storedResourceSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(160),
  kind: z.enum(["FES article", "Company update", "External resource"]),
  category: z.enum(["Electrical", "Fiber Optic", "Company Updates"]),
  summary: z.string().trim().min(1).max(500),
  source: z.string().trim().max(160).optional().default(""),
  externalUrl: z.string().trim().max(2_048).optional().default(""),
  status: z.literal("Published"),
  featured: z.boolean().optional().default(false),
  publishedAt: z.unknown().optional(),
  coverImage: z.string().trim().max(500).optional().default(""),
  coverMediaId: z.string().trim().max(128).nullable().optional().default(null),
  content: z.unknown().optional(),
  stagingOnly: z.boolean().optional().default(false),
  audience: z.enum(["Public", "Staging"]).optional().default("Public"),
});

const placeholderByCategory: Record<ResourceCategory, string> = {
  Electrical: "/images/project-electrical.svg",
  "Fiber Optic": "/images/project-fiber.svg",
  "Company Updates": "/images/project-combined.svg",
};

function toDate(value: unknown) {
  if (value instanceof Timestamp) return value.toDate().toISOString().slice(0, 10);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return undefined;
}

function safeCoverImage(value: string, category: ResourceCategory) {
  return /^\/images\/[a-z0-9/_-]+\.svg$/i.test(value) ? value : placeholderByCategory[category];
}

function safeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function formatArticleContent(node: PublicRichTextNode): PublicRichTextNode {
  return {
    ...node,
    ...(node.text === undefined ? {} : { text: formatFibreText(node.text) }),
    ...(node.content ? { content: node.content.map(formatArticleContent) } : {}),
  };
}

function wordCount(node: PublicRichTextNode): number {
  return (node.text?.trim().split(/\s+/).filter(Boolean).length ?? 0) + (node.content?.reduce((total, child) => total + wordCount(child), 0) ?? 0);
}

function isClearlyLabelledStagingFixture(resource: z.infer<typeof storedResourceSchema>) {
  const label = `${formatFibreText(resource.title)} ${resource.summary} ${resource.source}`;
  return /\bphase\s+[a-z]\d+\b|\bstaging[- ]only\b|\bemulator\b|\bbrowser\s+(?:test|verification|resource)\b/i.test(label);
}

async function normalize(id: string, raw: unknown): Promise<PublicArticle | PublicExternalResource | null> {
  const parsed = storedResourceSchema.safeParse(raw);
  if (!parsed.success || parsed.data.stagingOnly || parsed.data.audience === "Staging" || isClearlyLabelledStagingFixture(parsed.data)) return null;
  const resource = parsed.data;
  const publishedAt = toDate(resource.publishedAt);
  const mediaCover = await getPublicMediaUrl(resource.coverMediaId, "md");
  if (resource.kind === "External resource") {
    const url = safeExternalUrl(resource.externalUrl);
    if (!url || !resource.source) return null;
    return {
      id,
      title: formatFibreText(resource.title),
      source: resource.source,
      url,
      summary: formatFibreText(resource.summary),
      category: resource.category,
      ...(publishedAt ? { publishedAt } : {}),
      ...(mediaCover ? { featuredImage: mediaCover, featuredImageAlt: `${formatFibreText(resource.title)} resource cover` } : {}),
    };
  }
  const content = sanitizeRichText(resource.content) as PublicRichTextNode | undefined;
  if (!content || content.type !== "doc") return null;
  const featuredImage = mediaCover ?? safeCoverImage(resource.coverImage, resource.category);
  return {
    id,
    slug: resource.slug,
    title: formatFibreText(resource.title),
    kind: resource.kind,
    category: resource.category,
    summary: formatFibreText(resource.summary),
    ...(publishedAt ? { publishedAt } : {}),
    featured: resource.featured,
    featuredImage,
    featuredImageAlt: `${formatFibreText(resource.title)} article illustration`,
    readingTime: `${Math.max(1, Math.ceil(wordCount(content) / 220))} min read`,
    content: formatArticleContent(content),
  };
}

export async function getPublicResourceByIdUncached(id:string):Promise<PublicArticle|PublicExternalResource|null>{if(!z.string().trim().min(1).max(128).safeParse(id).success)return null;const document=await getAdminFirestore().collection("resources").doc(id).get();return document.exists?normalize(document.id,document.data()):null}

export interface PublicResources { articles: PublicArticle[]; externalResources: PublicExternalResource[]; }

export async function listPublicResourcesUncached(): Promise<PublicResources> {
  const snapshot = await getAdminFirestore().collection("resources").where("status", "==", "Published").get();
  const normalized = (await Promise.all(snapshot.docs.map(document => normalize(document.id, document.data())))).filter((item): item is PublicArticle | PublicExternalResource => item !== null);
  const byDateThenTitle = (left: { publishedAt?: string; title: string }, right: { publishedAt?: string; title: string }) => (right.publishedAt ?? "").localeCompare(left.publishedAt ?? "") || left.title.localeCompare(right.title);
  return {
    articles: normalized.filter((item): item is PublicArticle => "slug" in item).toSorted(byDateThenTitle),
    externalResources: normalized.filter((item): item is PublicExternalResource => "url" in item).toSorted(byDateThenTitle),
  };
}

export async function getPublicArticleBySlugUncached(slug: string): Promise<PublicArticle | null> {
  if (!slugSchema.safeParse(slug).success) return null;
  const database = getAdminFirestore();
  const slugDocument = await database.collection("resourceSlugs").doc(slug).get();
  if (!slugDocument.exists) return null;
  const resourceId = slugDocument.get("resourceId");
  if (typeof resourceId !== "string" || !resourceId) return null;
  const resourceDocument = await database.collection("resources").doc(resourceId).get();
  if (!resourceDocument.exists) return null;
  const resource = await normalize(resourceDocument.id, resourceDocument.data());
  return resource && "slug" in resource && resource.slug === slug ? resource : null;
}

const listCached = unstable_cache(listPublicResourcesUncached, ["public-resources-list-v3",FIREBASE_CACHE_NAMESPACE], { tags: [PUBLIC_RESOURCES_TAG], revalidate: 3600 });
const getArticleCached = unstable_cache(getPublicArticleBySlugUncached, ["public-article-by-slug-v3",FIREBASE_CACHE_NAMESPACE], { tags: [PUBLIC_RESOURCES_TAG], revalidate: 3600 });

export const listPublicResources = cache(listCached);
export const getPublicArticleBySlug = cache(getArticleCached);
