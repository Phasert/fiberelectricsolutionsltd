import {afterEach,describe,expect,it,vi} from "vitest";

const original={...process.env};
afterEach(()=>{process.env={...original};vi.resetModules()});

describe("production security and indexing configuration",()=>{
  it("uses the Vercel production URL when SITE_URL is absent",async()=>{delete process.env.SITE_URL;Object.assign(process.env,{NODE_ENV:"production",VERCEL_ENV:"production",VERCEL_PROJECT_PRODUCTION_URL:"fiberelectricsolutionsltd.vercel.app"});vi.resetModules();const config=await import("../../lib/site-config");expect(config.siteUrl).toBe("https://fiberelectricsolutionsltd.vercel.app");expect(config.isProductionIndexingEnabled).toBe(true)});
  it("keeps Vercel preview deployments out of search indexes",async()=>{delete process.env.SITE_URL;Object.assign(process.env,{NODE_ENV:"production",VERCEL_ENV:"preview",VERCEL_PROJECT_PRODUCTION_URL:"preview.example.vercel.app"});vi.resetModules();const config=await import("../../lib/site-config");expect(config.isProductionIndexingEnabled).toBe(false)});
  it("sets CSP and baseline browser security headers",async()=>{const {default:config}=await import("../../next.config");const rules=await config.headers!();const headers=Object.fromEntries(rules[0].headers.map(item=>[item.key,item.value]));expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");expect(headers["X-Content-Type-Options"]).toBe("nosniff");expect(headers["Permissions-Policy"]).toContain("camera=()")});
});
