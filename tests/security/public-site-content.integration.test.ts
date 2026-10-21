import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const { revalidatePath, revalidateTag } = vi.hoisted(()=>({revalidatePath:vi.fn(),revalidateTag:vi.fn()}));
vi.mock("next/cache",()=>({unstable_cache:<A extends unknown[],R>(callback:(...args:A)=>R)=>callback,revalidatePath,revalidateTag}));

import { getAdminFirestore } from "../../lib/firebase/admin";
import { invalidatePublicServices, invalidatePublicSiteContent, PUBLIC_SERVICES_TAG, PUBLIC_SITE_CONTENT_TAG } from "../../lib/site-content/public-cache";
import { getPublicSiteContentUncached, listPublicServicesUncached } from "../../lib/site-content/public-repository";

const marker=`d1c1-${Date.now()}`;
const publishedId=`${marker}-published`,disabledId=`${marker}-disabled`,draftId=`${marker}-draft`,fiberId=`${marker}-fiber`;
const snapshot=(order:number,enabled=true)=>({title:`Approved service ${order}`,shortDescription:"Approved public description.",detailedDescription:"Approved detailed description.",imageId:"private-media-id",displayOrder:order,enabled});

beforeAll(async()=>{const db=getAdminFirestore();await Promise.all([
  db.collection("services").doc(publishedId).set({schemaVersion:1,category:"electrical",slug:`${marker}-published`,status:"Published",published:snapshot(2),createdBy:"private-admin"}),
  db.collection("services").doc(`${publishedId}-first`).set({schemaVersion:1,category:"electrical",slug:`${marker}-first`,status:"Published",published:snapshot(1),createdBy:"private-admin"}),
  db.collection("services").doc(disabledId).set({schemaVersion:1,category:"electrical",slug:`${marker}-disabled`,status:"Published",published:snapshot(0,false)}),
  db.collection("services").doc(draftId).set({schemaVersion:1,category:"electrical",slug:`${marker}-draft`,status:"Draft",published:snapshot(0)}),
  db.collection("services").doc(fiberId).set({schemaVersion:1,category:"fiber",slug:`${marker}-fiber`,status:"Published",published:snapshot(0)}),
]);});

afterAll(async()=>{const db=getAdminFirestore();await Promise.all([publishedId,`${publishedId}-first`,disabledId,draftId,fiberId].map(id=>db.collection("services").doc(id).delete()));await Promise.all(["electrical-v1","about-v1"].map(id=>db.collection("siteContent").doc(id).delete()));});

describe("Phase D1c-1 public site content and services",()=>{
  it("shows enabled published snapshots in administrator order while newer drafts remain isolated",async()=>{const services=await listPublicServicesUncached("electrical");const ours=services.filter(item=>item.id.startsWith(marker));expect(ours.map(item=>item.displayOrder)).toEqual([0,1,2]);expect(ours.some(item=>item.id===draftId)).toBe(true);expect(ours.some(item=>item.id===disabledId)).toBe(false);});
  it("isolates service categories",async()=>{const services=await listPublicServicesUncached("fiber");expect(services.some(item=>item.id===fiberId)).toBe(true);expect(services.some(item=>item.id===publishedId)).toBe(false);});
  it("returns a strict service DTO without audit or media fields",async()=>{const service=(await listPublicServicesUncached("electrical")).find(item=>item.id===publishedId);expect(service).toBeDefined();expect(JSON.stringify(service)).not.toContain("private-admin");expect(service).not.toHaveProperty("imageId");expect(service).not.toHaveProperty("status");});
  it("keeps the last valid published page snapshot visible while a new draft is edited",async()=>{const db=getAdminFirestore();await db.collection("siteContent").doc("electrical-v1").set({schemaVersion:1,section:"electrical",status:"Published",draft:{heading:"Hidden draft",description:"Hidden"},published:{heading:"Approved electrical heading",description:"Approved electrical description."},updatedBy:"private-admin"});expect(await getPublicSiteContentUncached("electrical")).toEqual({heading:"Approved electrical heading",description:"Approved electrical description."});await db.collection("siteContent").doc("electrical-v1").update({status:"Draft",draft:{heading:"New draft heading",description:"New draft description."}});expect(await getPublicSiteContentUncached("electrical")).toEqual({heading:"Approved electrical heading",description:"Approved electrical description."});});
  it("handles missing, malformed and clearly labelled fixture content safely",async()=>{expect(await getPublicSiteContentUncached("about")).toBeNull();const ref=getAdminFirestore().collection("siteContent").doc("about-v1");await ref.set({schemaVersion:1,section:"about",status:"Published",published:{heroHeading:"Phase D1c browser test",heroDescription:"Emulator only",overviewHeading:"Test",overviewBody:"Test",capabilitiesHeading:"Test",capabilitiesDescription:"Test"}});expect(await getPublicSiteContentUncached("about")).toBeNull();await ref.set({schemaVersion:1,section:"about",status:"Published",published:{heroHeading:""}});expect(await getPublicSiteContentUncached("about")).toBeNull();});
  it("invalidates every public consumer after mutations",()=>{invalidatePublicServices();invalidatePublicSiteContent();expect(revalidateTag).toHaveBeenCalledWith(PUBLIC_SERVICES_TAG,{expire:0});expect(revalidateTag).toHaveBeenCalledWith(PUBLIC_SITE_CONTENT_TAG,{expire:0});for(const path of ["/","/electrical","/fiber-optic","/about"])expect(revalidatePath).toHaveBeenCalledWith(path);});
});
