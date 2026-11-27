import { Timestamp } from "firebase-admin/firestore";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: <Arguments extends unknown[], Result>(callback: (...arguments_: Arguments) => Result) => callback,
  revalidatePath,
  revalidateTag,
}));

import sitemap from "../../app/sitemap";
import { generateMetadata } from "../../app/projects/[slug]/page";
import { getAdminFirestore } from "../../lib/firebase/admin";
import { invalidatePublicProjects, PUBLIC_PROJECTS_TAG } from "../../lib/projects/public-cache";
import { getPublicProjectBySlugUncached, listPublicProjectsUncached } from "../../lib/projects/public-repository";

const marker = `phase-d1a-${Date.now()}`;
const publishedId = `${marker}-published`;
const draftId = `${marker}-draft`;
const publishedSlug = `${marker}-published`;
const draftSlug = `${marker}-draft`;

function project(status: "Draft" | "Published", slug: string) {
  return {
    slug,
    title: status === "Published" ? "Phase D1a published project" : "Phase D1a draft project",
    category: "Electrical",
    summary: "A clearly labelled emulator record for public project integration testing.",
    description: "Approved public overview.\nSecond paragraph.",
    location: "Emulator",
    period: "October 2026",
    status,
    featured: false,
    coverMediaId: "missing-cover-media",
    gallery: [
      { mediaId: "missing-second", alt: "Second ordered test image", caption: "Second caption", order: 2 },
      { mediaId: "missing-cover-media", alt: "First ordered test image", caption: "First caption", order: 0 },
      { mediaId: "missing-alt", order: 3 },
    ],
    publishedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: "private-admin-uid",
    internalNote: "must never leave the public repository",
  };
}

describe("Phase D1a public projects", () => {
  beforeAll(async () => {
    const database = getAdminFirestore();
    await Promise.all([
      database.collection("projects").doc(publishedId).set(project("Published", publishedSlug)),
      database.collection("projects").doc(draftId).set(project("Draft", draftSlug)),
      database.collection("projectSlugs").doc(publishedSlug).set({ projectId: publishedId }),
      database.collection("projectSlugs").doc(draftSlug).set({ projectId: draftId }),
    ]);
  });

  afterAll(async () => {
    const database = getAdminFirestore();
    await Promise.all([
      database.collection("projects").doc(publishedId).delete(),
      database.collection("projects").doc(draftId).delete(),
      database.collection("projectSlugs").doc(publishedSlug).delete(),
      database.collection("projectSlugs").doc(draftSlug).delete(),
    ]);
  });

  it("lists published projects while isolating drafts", async () => {
    const projects = await listPublicProjectsUncached();
    expect(projects.some(item => item.id === publishedId)).toBe(true);
    expect(projects.some(item => item.id === draftId)).toBe(false);
  });

  it("returns only valid published slugs and reflects unpublishing", async () => {
    expect((await getPublicProjectBySlugUncached(publishedSlug))?.id).toBe(publishedId);
    expect(await getPublicProjectBySlugUncached(draftSlug)).toBeNull();
    expect(await getPublicProjectBySlugUncached("unknown-project")).toBeNull();
    expect(await getPublicProjectBySlugUncached("INVALID SLUG")).toBeNull();
    const reference = getAdminFirestore().collection("projects").doc(publishedId);
    await reference.update({ status: "Draft" });
    expect(await getPublicProjectBySlugUncached(publishedSlug)).toBeNull();
    await reference.update({ status: "Published" });
  });

  it("keeps the legacy Tommy's fallback until migration, then suppresses it after managed deletion", async () => {
    const database = getAdminFirestore();
    const migration = database.collection("projectMigrations").doc("tommys-brentwood");
    const slugReference = database.collection("projectSlugs").doc("tommys-brentwood");
    await Promise.all([migration.delete(), slugReference.delete()]);
    expect((await getPublicProjectBySlugUncached("tommys-brentwood"))?.id).toBe("curated-tommys-brentwood");
    await migration.set({ projectId: "tommys-brentwood", legacyFallbackSuppressed: true });
    expect(await getPublicProjectBySlugUncached("tommys-brentwood")).toBeNull();
    expect((await listPublicProjectsUncached()).some((item) => item.slug === "tommys-brentwood")).toBe(false);
    await migration.delete();
  });

  it("preserves gallery order and text while using safe missing-media fallbacks", async () => {
    const projectRecord = await getPublicProjectBySlugUncached(publishedSlug);
    expect(projectRecord?.gallery.map(image => image.alt)).toEqual(["First ordered test image", "Second ordered test image", "Phase D1a published project — photo 3"]);
    expect(projectRecord?.gallery.map(image => image.caption)).toEqual([undefined, undefined, undefined]);
    expect(projectRecord?.gallery.every(image => image.src === "/images/project-electrical.svg")).toBe(true);
    expect(projectRecord?.featuredImage).toBe("/images/project-electrical.svg");
  });

  it("returns a strict public contract without administrator metadata", async () => {
    const projectRecord = await getPublicProjectBySlugUncached(publishedSlug);
    const serialized = JSON.stringify(projectRecord);
    expect(serialized).not.toContain("private-admin-uid");
    expect(serialized).not.toContain("must never leave");
    expect(projectRecord).not.toHaveProperty("status");
    expect(projectRecord).not.toHaveProperty("createdBy");
  });

  it("generates canonical metadata only for published projects", async () => {
    const published = await generateMetadata({ params: Promise.resolve({ slug: publishedSlug }), searchParams: Promise.resolve({}) });
    const draft = await generateMetadata({ params: Promise.resolve({ slug: draftSlug }), searchParams: Promise.resolve({}) });
    expect(published.title).toBe("Phase D1a published project");
    expect(published.alternates?.canonical).toBe(`http://localhost:3000/projects/${publishedSlug}`);
    expect(draft.robots).toMatchObject({ index: false, follow: false });
  });

  it("includes only published projects in the sitemap", async () => {
    const entries = await sitemap();
    expect(entries.some(entry => entry.url.endsWith(`/projects/${publishedSlug}`))).toBe(true);
    expect(entries.some(entry => entry.url.endsWith(`/projects/${draftSlug}`))).toBe(false);
  });

  it("invalidates listings, details and sitemap after project mutations", () => {
    invalidatePublicProjects();
    expect(revalidateTag).toHaveBeenCalledWith(PUBLIC_PROJECTS_TAG, { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith("/projects");
    expect(revalidatePath).toHaveBeenCalledWith("/projects/[slug]", "page");
    expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
  });
});
