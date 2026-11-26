import { afterEach, describe, expect, it } from "vitest";
import { PUT as saveContentRoute } from "../../app/api/admin/site-content/[section]/route";
import { getPublishedSiteContent, listAdminServices, listAdminSiteContent, listPublishedServices, saveServices, saveSiteContent } from "../../lib/site-content/repository";
import { getAdminFirestore } from "../../lib/firebase/admin";

const actor = "phase-c4-test-admin";
const suffix = Date.now();
const serviceA = `phase-c4-a-${suffix}`;
const serviceB = `phase-c4-b-${suffix}`;
const homepage = {
  heroHeading: "Phase C4 draft heading", heroDescription: "Clearly labelled emulator-only content.",
  primaryCtaLabel: "Primary action", secondaryCtaLabel: "Secondary action",
  serviceHeading: "Service introduction", serviceDescription: "Emulator service introduction.",
  aboutHeading: "About introduction", aboutDescription: "Emulator about introduction.", heroImageId: "",
};
const service = (id: string, displayOrder: number, status: "Draft" | "Published" = "Published") => ({
  id, category: "electrical" as const, slug: id, title: `Test service ${displayOrder}`,
  shortDescription: "Clearly labelled emulator-only service.", detailedDescription: "Detailed emulator-only service description.",
  imageId: "", displayOrder, status, enabled: true,
});

afterEach(async () => {
  const db = getAdminFirestore();
  const batch = db.batch();
  batch.delete(db.collection("siteContent").doc("homepage-v1"));
  batch.delete(db.collection("services").doc(serviceA));
  batch.delete(db.collection("services").doc(serviceB));
  await batch.commit();
});

describe("Phase C4 site content and services", () => {
  it("rejects untrusted content mutations", async () => {
    const body = JSON.stringify({ status: "Draft", content: homepage });
    const untrusted = await saveContentRoute(new Request("http://localhost:3000/api/admin/site-content/homepage", { method: "PUT", headers: { origin: "https://attacker.example", "content-type": "application/json" }, body }), { params: Promise.resolve({ section: "homepage" }) });
    expect(untrusted.status).toBe(403);
  });

  it("persists draft page content without exposing it", async () => {
    await saveSiteContent("homepage", { status: "Draft", content: homepage }, actor);
    expect((await listAdminSiteContent()).homepage.content.heroHeading).toBe(homepage.heroHeading);
    expect(await getPublishedSiteContent("homepage")).toBeNull();
  });

  it("publishes an immutable snapshot and isolates later draft edits", async () => {
    await saveSiteContent("homepage", { status: "Published", content: homepage }, actor);
    await saveSiteContent("homepage", { status: "Draft", content: { ...homepage, heroHeading: "New isolated draft" } }, actor);
    const adminState = (await listAdminSiteContent()).homepage;
    expect(adminState.content.heroHeading).toBe("New isolated draft");
    expect(adminState.status).toBe("Draft");
    expect((await getPublishedSiteContent("homepage"))?.heroHeading).toBe(homepage.heroHeading);
    expect((await getAdminFirestore().collection("siteContent").doc("homepage-v1").get()).data()?.published.heroHeading).toBe(homepage.heroHeading);
  });

  it("reports Published for the latest saved published content", async () => {
    await saveSiteContent("homepage", { status: "Published", content: homepage }, actor);
    expect((await listAdminSiteContent()).homepage).toMatchObject({ status: "Published", content: { heroHeading: homepage.heroHeading } });
  });

  it("loads older page records that predate stored draft and status fields", async () => {
    await getAdminFirestore().collection("siteContent").doc("homepage-v1").set({ schemaVersion: 1, section: "homepage", published: { ...homepage, heroHeading: "Legacy published" } });
    expect((await listAdminSiteContent()).homepage).toMatchObject({ status: "Published", content: { heroHeading: "Legacy published" } });
  });

  it("rejects invalid page content", async () => {
    await expect(saveSiteContent("homepage", { status: "Published", content: { ...homepage, heroHeading: "" } }, actor)).rejects.toThrow();
  });

  it("persists service ordering and filters drafts from published queries", async () => {
    await saveServices({ category: "electrical", services: [service(serviceB, 1), service(serviceA, 0, "Draft")] }, actor);
    const admin = (await listAdminServices()).filter((item) => [serviceA, serviceB].includes(item.id));
    expect(admin.map((item) => item.id)).toEqual([serviceA, serviceB]);
    expect((await listPublishedServices("electrical")).filter((item) => [serviceA, serviceB].includes(item.id)).map((item) => item.id)).toEqual([serviceB]);
  });

  it("preserves a published service snapshot when a new draft is saved", async () => {
    await saveServices({ category: "electrical", services: [service(serviceA, 0)] }, actor);
    await saveServices({ category: "electrical", services: [{ ...service(serviceA, 0, "Draft"), title: "Unpublished edit" }] }, actor);
    expect((await listAdminServices()).find((item) => item.id === serviceA)).toMatchObject({ title: "Unpublished edit", status: "Draft" });
    expect((await listPublishedServices("electrical")).find((item) => item.id === serviceA)?.title).toBe("Test service 0");
    expect((await getAdminFirestore().collection("services").doc(serviceA).get()).data()?.published.title).toBe("Test service 0");
  });

  it("rejects duplicate service slugs and display orders", async () => {
    const duplicate = { ...service(serviceB, 0), slug: serviceA };
    await expect(saveServices({ category: "electrical", services: [service(serviceA, 0), duplicate] }, actor)).rejects.toThrow();
  });
});
