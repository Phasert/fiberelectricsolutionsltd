import { afterEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("next/cache", () => ({
  unstable_cache: <A extends unknown[], R>(callback: (...args: A) => R) => callback,
  revalidatePath,
  revalidateTag,
}));

import { businessSettings } from "../../data/admin-mock";
import { getAdminFirestore } from "../../lib/firebase/admin";
import { invalidatePublicBusinessSettings, PUBLIC_BUSINESS_SETTINGS_TAG } from "../../lib/settings/public-cache";
import { formatBusinessHours, getPublicSeoDefaults, DEFAULT_PUBLIC_SEO } from "../../lib/settings/presentation";
import { getPublicBusinessSettingsUncached } from "../../lib/settings/public-repository";
import { saveBusinessSettings } from "../../lib/settings/repository";

const actor = "phase-d1c3-test-admin";
const approved = () => ({
  approvalStatus: "Approved" as const,
  settings: {
    ...structuredClone(businessSettings),
    businessName: "Approved FES Public Details",
    publicEmail: "contact@fes-approved.co.tt",
    publicPhone: "+1 (868) 555-0100",
    whatsappNumber: "+1 868 555 0199",
    publicLocation: "Central Trinidad",
    googleMapsUrl: "https://maps.google.com/?q=Central+Trinidad",
    socialLinks: { facebook: "https://facebook.com/fes-approved", instagram: "", linkedin: "", googleBusiness: "https://business.google.com/fes-approved", whatsapp: "https://wa.me/18685550199" },
    seo: { title: "Approved FES services", description: "Approved electrical and fiber optic services in Trinidad and Tobago.", socialImageUrl: null },
  },
});

afterEach(async () => {
  await getAdminFirestore().collection("businessSettings").doc("public-v1").delete();
  vi.clearAllMocks();
});

describe("Phase D1c-3 public business settings", () => {
  it("returns only a normalized public DTO for approved settings", async () => {
    await saveBusinessSettings(approved(), actor);
    const result = await getPublicBusinessSettingsUncached();
    expect(result).toMatchObject({
      businessName: "Approved FES Public Details",
      email: { label: "contact@fes-approved.co.tt", href: "mailto:contact@fes-approved.co.tt" },
      phone: { label: "+1 (868) 555-0100", href: "tel:+18685550100" },
      whatsapp: { href: "https://wa.me/18685550199" },
      location: "Central Trinidad",
    });
    expect(JSON.stringify(result)).not.toMatch(/createdBy|updatedBy|approvedBy|branding|socialImageUrl|secret/i);
  });

  it("hides missing, malformed, draft and revoked settings", async () => {
    await expect(getPublicBusinessSettingsUncached()).resolves.toBeNull();
    const ref = getAdminFirestore().collection("businessSettings").doc("public-v1");
    await ref.set({ schemaVersion: 2, approvalStatus: "Approved", public: approved().settings });
    await expect(getPublicBusinessSettingsUncached()).resolves.toBeNull();
    await saveBusinessSettings({ ...approved(), approvalStatus: "Draft" }, actor);
    await expect(getPublicBusinessSettingsUncached()).resolves.toBeNull();
  });

  it("excludes clearly labelled staging and test fixtures", async () => {
    const payload = approved();
    await saveBusinessSettings({ ...payload, settings: { ...payload.settings, businessName: "Phase D1c-3 staging settings" } }, actor);
    await expect(getPublicBusinessSettingsUncached()).resolves.toBeNull();
    await saveBusinessSettings({ ...payload, settings: { ...payload.settings, publicEmail: "settings@example.test" } }, actor);
    await expect(getPublicBusinessSettingsUncached()).resolves.toBeNull();
  });

  it("normalizes contact URLs and rejects an unapproved explicit WhatsApp host", async () => {
    const payload = approved();
    await saveBusinessSettings({ ...payload, settings: { ...payload.settings, socialLinks: { ...payload.settings.socialLinks, whatsapp: "https://attacker.example/contact" } } }, actor);
    const result = await getPublicBusinessSettingsUncached();
    expect(result?.whatsapp?.href).toBe("https://wa.me/18685550199");
    expect(result?.maps?.href).toMatch(/^https:\/\/maps\.google\.com\//);
    expect(result?.socialLinks).toEqual([{ label: "Facebook", href: "https://facebook.com/fes-approved" }]);
  });

  it("formats opening hours accessibly and supplies safe SEO fallbacks", () => {
    expect(formatBusinessHours({ day: "Monday", open: true, opensAt: "08:00", closesAt: "17:00" })).toBe("8:00 AM–5:00 PM");
    expect(formatBusinessHours({ day: "Sunday", open: false, opensAt: "", closesAt: "" })).toBe("Closed");
    expect(getPublicSeoDefaults(null)).toEqual(DEFAULT_PUBLIC_SEO);
  });

  it("invalidates the shared layout and relevant public routes after an administrator save", () => {
    invalidatePublicBusinessSettings();
    expect(revalidateTag).toHaveBeenCalledWith(PUBLIC_BUSINESS_SETTINGS_TAG, { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    for (const path of ["/", "/about", "/electrical", "/fiber-optic", "/request-a-quote"]) expect(revalidatePath).toHaveBeenCalledWith(path);
  });
});
