import {describe,expect,it}from"vitest";
import {mediaMetadataInputSchema,mediaPatchSchema}from"@/lib/media/schemas";

describe("public media gallery metadata",()=>{
 it("accepts bounded publish and order updates",()=>{expect(mediaPatchSchema.parse({galleryPublished:true,galleryOrder:12})).toEqual({galleryPublished:true,galleryOrder:12})});
 it("supports optional gallery alt text and non-destructive removal metadata",()=>{expect(mediaMetadataInputSchema.parse({alt:"",caption:"",category:"Electrical",projectId:null,roles:["general","project-gallery"]}).alt).toBe("");expect(mediaPatchSchema.parse({galleryPublished:false,galleryExcluded:true})).toEqual({galleryPublished:false,galleryExcluded:true})});
 it("classifies a project upload as a draft in its initial media record",()=>{expect(mediaMetadataInputSchema.parse({alt:"Panel installation",caption:"",category:"Electrical",projectId:null,roles:["general","project-gallery"],galleryPublished:false,galleryExcluded:false,galleryOrder:3})).toMatchObject({galleryPublished:false,galleryExcluded:false,galleryOrder:3,roles:["general","project-gallery"]})});
 it("never injects creation defaults into partial publish or reorder patches",()=>{for(const patch of[{galleryPublished:true},{galleryOrder:4},{galleryExcluded:false},{}]){const parsed=mediaPatchSchema.parse(patch);expect(parsed).toEqual(patch);for(const key of["alt","caption","category","projectId","roles"])expect(parsed).not.toHaveProperty(key)}});
 it("keeps creation defaults and strict patch validation",()=>{expect(mediaMetadataInputSchema.parse({})).toEqual({alt:"",caption:"",category:"Combined",projectId:null,roles:["general"],galleryPublished:false,galleryExcluded:false,galleryOrder:0});expect(()=>mediaPatchSchema.parse({unknown:true})).toThrow();expect(()=>mediaPatchSchema.parse({category:"Solar"})).toThrow();expect(()=>mediaPatchSchema.parse({alt:"x".repeat(181)})).toThrow()});
 it("rejects invalid gallery order values",()=>{expect(()=>mediaPatchSchema.parse({galleryOrder:-1})).toThrow();expect(()=>mediaPatchSchema.parse({galleryOrder:10_001})).toThrow()});
});
