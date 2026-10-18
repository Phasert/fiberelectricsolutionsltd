import { afterEach, describe, expect, it } from "vitest";
import { PUT as saveSettingsRoute } from "../../app/api/admin/settings/route";
import { businessSettings } from "../../data/admin-mock";
import { getAdminFirestore } from "../../lib/firebase/admin";
import { getAdminBusinessSettings, getApprovedBusinessSettings, saveBusinessSettings } from "../../lib/settings/repository";

const actor = "phase-c5-test-admin";
const valid = () => ({ approvalStatus: "Draft" as const, settings: { ...structuredClone(businessSettings), businessName: "PHASE C5 EMULATOR TEST", publicEmail: "settings@example.test", publicPhone: "+1 868 555 0100" } });

afterEach(async () => { await getAdminFirestore().collection("businessSettings").doc("public-v1").delete(); });

describe("Phase C5 business settings", () => {
  it("rejects untrusted mutations", async () => {
    const response = await saveSettingsRoute(new Request("http://localhost:3000/api/admin/settings", { method: "PUT", headers: { origin: "https://attacker.example", "content-type": "application/json" }, body: JSON.stringify(valid()) }));
    expect(response.status).toBe(403);
  });

  it("returns safe defaults when the settings document is missing", async () => {
    const state = await getAdminBusinessSettings();
    expect(state.approvalStatus).toBe("Draft");
    expect(state.settings.businessName).toBe("Fiber & Electric Solutions Ltd.");
    expect(await getApprovedBusinessSettings()).toBeNull();
  });

  it("persists settings and server-controlled audit fields across reads", async () => {
    await saveBusinessSettings(valid(), actor);
    expect((await getAdminBusinessSettings()).settings.businessName).toBe("PHASE C5 EMULATOR TEST");
    const stored = (await getAdminFirestore().collection("businessSettings").doc("public-v1").get()).data();
    expect(stored).toMatchObject({ schemaVersion: 1, approvalStatus: "Draft", createdBy: actor, updatedBy: actor });
    expect(stored?.createdAt).toBeTruthy(); expect(stored?.updatedAt).toBeTruthy();
  });

  it("validates emails, URLs, telephone numbers and opening hours", async () => {
    const base = valid();
    await expect(saveBusinessSettings({ ...base, settings: { ...base.settings, publicEmail: "invalid" } }, actor)).rejects.toThrow();
    await expect(saveBusinessSettings({ ...base, settings: { ...base.settings, publicPhone: "123" } }, actor)).rejects.toThrow();
    await expect(saveBusinessSettings({ ...base, settings: { ...base.settings, googleMapsUrl: "javascript:alert(1)" } }, actor)).rejects.toThrow();
    const hours = base.settings.businessHours.map((entry, index) => index === 0 ? { ...entry, opensAt: "17:00", closesAt: "08:00" } : entry);
    await expect(saveBusinessSettings({ ...base, settings: { ...base.settings, businessHours: hours } }, actor)).rejects.toThrow();
  });

  it("rejects secret fields and incomplete approval", async () => {
    await expect(saveBusinessSettings({ ...valid(), smtpPassword: "must-not-store" }, actor)).rejects.toThrow();
    const base = valid();
    await expect(saveBusinessSettings({ ...base, settings: { ...base.settings, firebasePrivateKey: "must-not-store" } }, actor)).rejects.toThrow();
    await expect(saveBusinessSettings({ approvalStatus: "Approved", settings: { ...base.settings, publicEmail: "", publicPhone: "", publicLocation: "" } }, actor)).rejects.toThrow();
  });

  it("returns only valid approved public settings", async () => {
    const payload = { ...valid(), approvalStatus: "Approved" as const };
    await saveBusinessSettings(payload, actor);
    expect((await getApprovedBusinessSettings())?.businessName).toBe("PHASE C5 EMULATOR TEST");
  });
});
