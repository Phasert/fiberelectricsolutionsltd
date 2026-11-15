import {describe,expect,it}from"vitest";
import {featuredSelectionSchema}from"@/lib/featured/schemas";

describe("homepage project selection",()=>{
 it("accepts a project collection",()=>{expect(featuredSelectionSchema.parse({projectId:"project-1",resourceId:"",tipIds:[]})).toMatchObject({projectId:"project-1"})});
 it("does not allow a loose photograph to replace a project collection",()=>{expect(featuredSelectionSchema.safeParse({projectId:"",mediaId:"media-1",resourceId:"",tipIds:[]}).success).toBe(false)});
 it("requires a project",()=>{expect(featuredSelectionSchema.safeParse({projectId:"",resourceId:"",tipIds:[]}).success).toBe(false)});
});
