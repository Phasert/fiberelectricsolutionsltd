import { afterEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock("next/cache", () => ({
  unstable_cache: <A extends unknown[], R>(callback: (...args: A) => R) => callback,
  revalidatePath,
  revalidateTag,
}));

import { getAdminFirestore } from "../../lib/firebase/admin";
import { invalidatePublicHomepageFeatured, PUBLIC_HOMEPAGE_FEATURED_TAG } from "../../lib/featured/public-cache";
import { getPublicHomepageFeaturedUncached } from "../../lib/featured/public-repository";

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const projectId = `public-featured-project-${suffix}`;
const resourceId = `public-featured-resource-${suffix}`;
const tipA = `public-featured-tip-a-${suffix}`;
const tipB = `public-featured-tip-b-${suffix}`;
const ids = [projectId, resourceId, tipA, tipB];

async function seed(overrides: { project?: object; resource?: object; tipA?: object; tipB?: object; selection?: object } = {}) {
  const database = getAdminFirestore();
  const batch = database.batch();
  batch.set(database.collection("projects").doc(projectId), {
    slug: `public-featured-project-${suffix}`,
    title: "Approved public featured project",
    category: "Combined",
    summary: "Approved project summary for public featured testing.",
    status: "Published",
    gallery: [],
    internalNote: "must never be public",
    ...overrides.project,
  });
  batch.set(database.collection("resources").doc(resourceId), {
    slug: `public-featured-resource-${suffix}`,
    title: "Approved public featured resource",
    kind: "External resource",
    category: "Electrical",
    summary: "Approved attributed resource summary.",
    source: "Approved source",
    externalUrl: "https://example.com/approved-resource",
    status: "Published",
    internalNote: "must never be public",
    ...overrides.resource,
  });
  batch.set(database.collection("tips").doc(tipA), { type: "Do", title: "First approved tip", body: "First approved tip body.", enabled: true, order: 1, internalNote: "private", ...overrides.tipA });
  batch.set(database.collection("tips").doc(tipB), { type: "Don’t", title: "Second approved tip", body: "Second approved tip body.", enabled: true, order: 2, internalNote: "private", ...overrides.tipB });
  batch.set(database.collection("featuredContent").doc("homepage"), { projectId, resourceId, tipIds: [tipB, tipA], updatedBy: "private-admin-id", ...overrides.selection });
  await batch.commit();
}

afterEach(async () => {
  const database = getAdminFirestore();
  const batch = database.batch();
  batch.delete(database.collection("projects").doc(projectId));
  batch.delete(database.collection("resources").doc(resourceId));
  batch.delete(database.collection("featuredContent").doc("homepage"));
  for (const id of ids.slice(2)) batch.delete(database.collection("tips").doc(id));
  await batch.commit();
  vi.clearAllMocks();
});

describe("Phase D1c-2 public featured content and tips", () => {
  it("returns the selected published project, optional published resource and explicit tip order", async () => {
    await seed();
    const result = await getPublicHomepageFeaturedUncached();
    expect(result.project).toMatchObject({ id: projectId, title: "Approved public featured project", featuredImage: "/images/project-combined.svg" });
    expect(result.resource).toMatchObject({ id: resourceId, title: "Approved public featured resource", url: "https://example.com/approved-resource" });
    expect(result.tips.map((tip) => tip.id)).toEqual([tipB, tipA]);
    expect(result.tips[0]).toEqual({ id: tipB, type: "dont", title: "Second approved tip", body: "Second approved tip body." });
    expect(JSON.stringify(result)).not.toContain("internalNote");
    expect(JSON.stringify(result)).not.toContain("updatedBy");
  });

  it("revalidates source eligibility and omits unpublished, disabled and deleted selections", async () => {
    await seed();
    const database = getAdminFirestore();
    await Promise.all([
      database.collection("projects").doc(projectId).update({ status: "Draft" }),
      database.collection("resources").doc(resourceId).update({ status: "Draft" }),
      database.collection("tips").doc(tipB).update({ enabled: false }),
      database.collection("tips").doc(tipA).delete(),
    ]);
    await expect(getPublicHomepageFeaturedUncached()).resolves.toEqual({ project: null, resource: null, tips: [] });
  });

  it("excludes clearly labelled staging fixtures even when their source records are eligible", async () => {
    await seed({
      project: { title: "Phase D1c-2 staging project" },
      resource: { title: "Browser verification resource" },
      tipA: { title: "Emulator tip" },
      tipB: { body: "Staging-only tip body" },
    });
    await expect(getPublicHomepageFeaturedUncached()).resolves.toEqual({ project: null, resource: null, tips: [] });
  });

  it("returns a safe empty result for missing or malformed placement records", async () => {
    expect(await getPublicHomepageFeaturedUncached()).toEqual({ project: null, resource: null, tips: [] });
    await getAdminFirestore().collection("featuredContent").doc("homepage").set({ projectId: "", resourceId: 42, tipIds: "invalid" });
    expect(await getPublicHomepageFeaturedUncached()).toEqual({ project: null, resource: null, tips: [] });
  });

  it("invalidates the homepage tag and route after administrator changes", () => {
    invalidatePublicHomepageFeatured();
    expect(revalidateTag).toHaveBeenCalledWith(PUBLIC_HOMEPAGE_FEATURED_TAG, { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});
