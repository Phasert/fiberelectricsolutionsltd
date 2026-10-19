import { renderToStaticMarkup } from "react-dom/server";
import { Timestamp } from "firebase-admin/firestore";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("next/cache", () => ({
  unstable_cache: <Arguments extends unknown[], Result>(callback: (...arguments_: Arguments) => Result) => callback,
  revalidatePath,
  revalidateTag,
}));

import sitemap from "../../app/sitemap";
import { generateMetadata } from "../../app/resources/[slug]/page";
import { RichText } from "../../components/resources/rich-text";
import { getAdminFirestore } from "../../lib/firebase/admin";
import { invalidatePublicResources, PUBLIC_RESOURCES_TAG } from "../../lib/resources/public-cache";
import { getPublicArticleBySlugUncached, listPublicResourcesUncached } from "../../lib/resources/public-repository";

const marker = `phase-d1b-${Date.now()}`;
const articleId = `${marker}-article`;
const draftId = `${marker}-draft`;
const externalId = `${marker}-external`;
const stagingId = `${marker}-staging`;
const articleSlug = `${marker}-article`;
const draftSlug = `${marker}-draft`;
const externalSlug = `${marker}-external`;
const stagingSlug = `${marker}-staging`;
const safeContent = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Safe heading" }] },
    { type: "paragraph", content: [{ type: "text", text: "Safe linked text", marks: [{ type: "link", attrs: { href: "https://example.com/guide" } }] }] },
    { type: "orderedList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "First item" }] }] }] },
    { type: "script", content: [{ type: "text", text: "unsafe-script" }] },
    { type: "paragraph", content: [{ type: "text", text: "Unsafe link text", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] }] },
  ],
};

function article(status: "Draft" | "Published", slug: string) {
  return { slug, title: status === "Published" ? "Public electrical guide" : "Draft electrical guide", kind: "FES article", category: "Electrical", summary: "A complete article for published resource integration verification.", source: "", externalUrl: "", status, featured: true, publishedAt: Timestamp.now(), coverImage: "https://private.invalid/admin-media", content: safeContent, updatedAt: Timestamp.now(), createdBy: "private-admin-uid", internalNote: "must remain private" };
}

describe("Phase D1b public resources", () => {
  beforeAll(async () => {
    const database = getAdminFirestore();
    await Promise.all([
      database.collection("resources").doc(articleId).set(article("Published", articleSlug)),
      database.collection("resources").doc(draftId).set(article("Draft", draftSlug)),
      database.collection("resources").doc(externalId).set({ slug: externalSlug, title: "Approved external guide", kind: "External resource", category: "Fiber Optic", summary: "An attributed HTTPS destination with practical fiber guidance.", source: "Example Publisher", externalUrl: "https://example.com/fiber-guide", status: "Published", featured: false, publishedAt: Timestamp.now(), coverImage: "", content: null }),
      database.collection("resources").doc(stagingId).set({ ...article("Published", stagingSlug), title: "Phase D1b Browser Test Article" }),
      ...[[articleSlug, articleId], [draftSlug, draftId], [externalSlug, externalId], [stagingSlug, stagingId]].map(([slug, resourceId]) => database.collection("resourceSlugs").doc(slug).set({ resourceId })),
    ]);
  });

  afterAll(async () => {
    const database = getAdminFirestore();
    await Promise.all([
      ...[articleId, draftId, externalId, stagingId].map(id => database.collection("resources").doc(id).delete()),
      ...[articleSlug, draftSlug, externalSlug, stagingSlug].map(slug => database.collection("resourceSlugs").doc(slug).delete()),
    ]);
  });

  it("lists published articles and external resources while excluding drafts and staging-only records", async () => {
    const result = await listPublicResourcesUncached();
    expect(result.articles.some(item => item.id === articleId)).toBe(true);
    expect(result.articles.some(item => item.id === draftId || item.id === stagingId)).toBe(false);
    expect(result.externalResources.find(item => item.id === externalId)).toMatchObject({ source: "Example Publisher", url: "https://example.com/fiber-guide" });
  });

  it("resolves only valid published internal article slugs and reflects unpublishing", async () => {
    expect((await getPublicArticleBySlugUncached(articleSlug))?.id).toBe(articleId);
    expect(await getPublicArticleBySlugUncached(draftSlug)).toBeNull();
    expect(await getPublicArticleBySlugUncached(externalSlug)).toBeNull();
    expect(await getPublicArticleBySlugUncached("INVALID SLUG")).toBeNull();
    expect(await getPublicArticleBySlugUncached("unknown-article")).toBeNull();
    const reference = getAdminFirestore().collection("resources").doc(articleId);
    await reference.update({ status: "Draft" });
    expect(await getPublicArticleBySlugUncached(articleSlug)).toBeNull();
    await reference.update({ status: "Published" });
  });

  it("sanitizes rich text and renders only safe supported markup", async () => {
    const articleRecord = await getPublicArticleBySlugUncached(articleSlug);
    expect(articleRecord).not.toBeNull();
    const html = renderToStaticMarkup(RichText({ document: articleRecord!.content }));
    expect(html).toContain("<h2>Safe heading</h2>");
    expect(html).toContain("<ol>");
    expect(html).toContain('href="https://example.com/guide"');
    expect(html).not.toContain("unsafe-script");
    expect(html).not.toContain("javascript:");
  });

  it("uses a static placeholder and strips administrator-only fields", async () => {
    const articleRecord = await getPublicArticleBySlugUncached(articleSlug);
    expect(articleRecord?.featuredImage).toBe("/images/project-electrical.svg");
    const serialized = JSON.stringify(articleRecord);
    expect(serialized).not.toContain("private-admin-uid");
    expect(serialized).not.toContain("must remain private");
    expect(articleRecord).not.toHaveProperty("status");
  });

  it("generates published canonical metadata and noindexes drafts", async () => {
    const published = await generateMetadata({ params: Promise.resolve({ slug: articleSlug }), searchParams: Promise.resolve({}) });
    const draft = await generateMetadata({ params: Promise.resolve({ slug: draftSlug }), searchParams: Promise.resolve({}) });
    expect(published.alternates?.canonical).toBe(`http://localhost:3000/resources/${articleSlug}`);
    expect(published.openGraph).toMatchObject({ type: "article", title: "Public electrical guide" });
    expect(draft.robots).toMatchObject({ index: false, follow: false });
  });

  it("includes only published internal articles in the sitemap", async () => {
    const entries = await sitemap();
    expect(entries.some(entry => entry.url.endsWith(`/resources/${articleSlug}`))).toBe(true);
    expect(entries.some(entry => entry.url.endsWith(`/resources/${draftSlug}`))).toBe(false);
    expect(entries.some(entry => entry.url.endsWith(`/resources/${externalSlug}`))).toBe(false);
  });

  it("invalidates resource listing, detail routes and sitemap after mutations", () => {
    invalidatePublicResources();
    expect(revalidateTag).toHaveBeenCalledWith(PUBLIC_RESOURCES_TAG, { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith("/resources");
    expect(revalidatePath).toHaveBeenCalledWith("/resources/[slug]", "page");
    expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
  });
});
