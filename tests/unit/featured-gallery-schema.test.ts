import {describe,expect,it}from"vitest";
import {featuredSelectionSchema}from"@/lib/featured/schemas";

describe("homepage gallery photograph selection",()=>{
 it("accepts a published gallery media reference without a legacy project",()=>{expect(featuredSelectionSchema.parse({projectId:"",mediaId:"media-1",resourceId:"",tipIds:[]})).toMatchObject({projectId:"",mediaId:"media-1"})});
 it("keeps legacy project selections backward-compatible",()=>{expect(featuredSelectionSchema.parse({projectId:"project-1",resourceId:"",tipIds:[]})).toMatchObject({projectId:"project-1"})});
 it("requires either a gallery photograph or legacy project",()=>{expect(featuredSelectionSchema.safeParse({projectId:"",resourceId:"",tipIds:[]}).success).toBe(false)});
});
