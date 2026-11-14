import {describe,expect,it}from"vitest";
import {mediaMetadataInputSchema,mediaPatchSchema}from"@/lib/media/schemas";

describe("public media gallery metadata",()=>{
 it("accepts bounded publish and order updates",()=>{expect(mediaPatchSchema.parse({galleryPublished:true,galleryOrder:12})).toEqual({galleryPublished:true,galleryOrder:12})});
 it("supports optional gallery alt text and non-destructive removal metadata",()=>{expect(mediaMetadataInputSchema.parse({alt:"",caption:"",category:"Electrical",projectId:null,roles:["general","project-gallery"]}).alt).toBe("");expect(mediaPatchSchema.parse({galleryPublished:false,galleryExcluded:true})).toEqual({galleryPublished:false,galleryExcluded:true})});
 it("rejects invalid gallery order values",()=>{expect(()=>mediaPatchSchema.parse({galleryOrder:-1})).toThrow();expect(()=>mediaPatchSchema.parse({galleryOrder:10_001})).toThrow()});
});
