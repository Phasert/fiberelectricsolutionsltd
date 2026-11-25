import "server-only";
import { formatFibreText } from "@/lib/site-content/spelling";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FIREBASE_CACHE_NAMESPACE } from "@/lib/firebase/cache-namespace";
import { aboutContentSchema, homepageContentSchema, servicePageContentSchema, sectionSchema, type SiteContentSection } from "@/lib/site-content/schemas";
import { PUBLIC_SERVICES_TAG, PUBLIC_SITE_CONTENT_TAG } from "@/lib/site-content/public-cache";
import { defaultServices } from "@/lib/site-content/defaults";
import {getPublicMediaDetails}from"@/lib/media/public-repository";
import type { PublicAboutContent, PublicHomepageContent, PublicService, PublicServicePageContent, ServiceKind } from "@/types/content";

const fixturePattern = /\bphase\s+[a-z]\d+\b|\bstaging[- ]only\b|\bemulator\b|\bbrowser\s+(?:test|verification|content|service)\b/i;
const containsFixtureLabel = (value: unknown) => fixturePattern.test(JSON.stringify(value));

const storedPageSchema = z.object({ schemaVersion: z.literal(1), section: sectionSchema, published: z.unknown() });
export type PublicSiteContent = PublicHomepageContent | PublicServicePageContent | PublicAboutContent;

export async function getPublicSiteContentUncached(sectionValue: string): Promise<PublicSiteContent | null> {
  const section = sectionSchema.parse(sectionValue);
  const document = await getAdminFirestore().collection("siteContent").doc(`${section}-v1`).get();
  const stored = storedPageSchema.safeParse(document.data());
  if (!stored.success || stored.data.section !== section || containsFixtureLabel(stored.data.published)) return null;
  if (section === "homepage") { const parsed=homepageContentSchema.safeParse(stored.data.published);if(!parsed.success)return null;const{heroImageId,...content}=parsed.data,image=heroImageId?(await getPublicMediaDetails([heroImageId],"lg")).get(heroImageId):null,slideMedia=await getPublicMediaDetails(content.heroSlides.map(slide=>slide.imageId).filter(Boolean),"lg");return{...content,heroSlides:content.heroSlides.map(slide=>{const selected=slideMedia.get(slide.imageId);return{...slide,...(selected?.type==="image"?{imageSrc:selected.src,imageAlt:formatFibreText(selected.alt)}:{})}}),...(image?.type==="image"?{heroImageSrc:image.src,heroImageAlt:formatFibreText(image.alt)}:{})}; }
  if (section === "electrical" || section === "fiber") { const parsed=servicePageContentSchema.safeParse(stored.data.published); if (!parsed.success) return null;
    const { heroImageId, ...content } = parsed.data;
    const image = heroImageId ? (await getPublicMediaDetails([heroImageId], "lg")).get(heroImageId) : undefined;
    return image?.type === "image" ? { ...content, heroImageSrc: image.src, heroImageAlt: formatFibreText(image.alt) } : content; }
  if (section === "about") { const parsed=aboutContentSchema.safeParse(stored.data.published);if(!parsed.success)return null;const{imageId,...content}=parsed.data,image=imageId?(await getPublicMediaDetails([imageId],"lg")).get(imageId):null;return{...content,...(image?.type==="image"?{imageSrc:image.src,imageAlt:formatFibreText(image.alt)}:{})}; }
  return null;
}

const storedServiceSchema = z.object({
  schemaVersion: z.literal(1), category: z.enum(["electrical", "fiber"]),
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  published: z.object({ title: z.string().trim().min(1).max(160), shortDescription: z.string().trim().min(1).max(500), detailedDescription: z.string().trim().min(1).max(3000), displayOrder: z.number().int().min(0).max(999), enabled: z.literal(true) }),
});

export async function listPublicServicesUncached(categoryValue: string): Promise<PublicService[]> {
  const category = z.enum(["electrical", "fiber"]).parse(categoryValue);
  const snapshot = await getAdminFirestore().collection("services").where("category", "==", category).get();
  if (snapshot.empty) {
    return defaultServices
      .filter(service => service.category === category && service.status === "Published" && service.enabled)
      .map(({ id, category, slug, title, shortDescription, detailedDescription, displayOrder }) => ({
        id, category, slug, title, shortDescription, detailedDescription, displayOrder,
      }));
  }
  return snapshot.docs.flatMap(document => {
    const parsed = storedServiceSchema.safeParse(document.data());
    if (!parsed.success || containsFixtureLabel(parsed.data.published)) return [];
    const { title, shortDescription, detailedDescription, displayOrder } = parsed.data.published;
    return [{ id: document.id, category: parsed.data.category as ServiceKind, slug: parsed.data.slug, title: formatFibreText(title), shortDescription: formatFibreText(shortDescription), detailedDescription: formatFibreText(detailedDescription), displayOrder }];
  }).toSorted((left, right) => left.displayOrder - right.displayOrder || left.title.localeCompare(right.title));
}

const getPageCached = unstable_cache(getPublicSiteContentUncached, ["public-site-content-v2",FIREBASE_CACHE_NAMESPACE], { tags: [PUBLIC_SITE_CONTENT_TAG], revalidate: 3600 });
const listServicesCached = unstable_cache(listPublicServicesUncached, ["public-services-v2",FIREBASE_CACHE_NAMESPACE], { tags: [PUBLIC_SERVICES_TAG], revalidate: 3600 });
export const getPublicSiteContent = cache((section: SiteContentSection) => getPageCached(section));
export const listPublicServices = cache((category: ServiceKind) => listServicesCached(category));
