import {describe,expect,it}from"vitest";
import {mediaPatchSchema}from"@/lib/media/schemas";

describe("public media gallery metadata",()=>{
 it("accepts bounded publish and order updates",()=>{expect(mediaPatchSchema.parse({galleryPublished:true,galleryOrder:12})).toEqual({galleryPublished:true,galleryOrder:12})});
 it("rejects invalid gallery order values",()=>{expect(()=>mediaPatchSchema.parse({galleryOrder:-1})).toThrow();expect(()=>mediaPatchSchema.parse({galleryOrder:10_001})).toThrow()});
});
