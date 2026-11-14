import {afterEach,describe,expect,it,vi}from"vitest";

const original={...process.env};
afterEach(()=>{process.env={...original};vi.resetModules()});

describe("public business settings configuration",()=>{
 it("uses the public fallback when Firebase is not configured during prerender",async()=>{delete process.env.FIREBASE_PROJECT_ID;delete process.env.GCLOUD_PROJECT;delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;vi.resetModules();const{getPublicBusinessSettingsUncached}=await import("@/lib/settings/public-repository");await expect(getPublicBusinessSettingsUncached()).resolves.toBeNull()});
});
