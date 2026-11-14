import {afterEach,describe,expect,it,vi}from"vitest";

const original={...process.env};
afterEach(()=>{process.env={...original};vi.resetModules()});

describe("sitemap Firebase configuration",()=>{
 it("builds static routes when Firebase is absent",async()=>{delete process.env.FIREBASE_PROJECT_ID;delete process.env.GCLOUD_PROJECT;delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;vi.resetModules();const{default:sitemap}=await import("@/app/sitemap");const entries=await sitemap();expect(entries.map(entry=>new URL(entry.url).pathname)).toEqual(["/","/electrical","/fiber-optic","/projects","/about","/resources","/contact","/request-a-quote"])});
});
