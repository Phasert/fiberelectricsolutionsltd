import {describe,expect,it}from"vitest";
import {featuredSelectionSchema}from"@/lib/featured/schemas";

describe("homepage project selection",()=>{
 it("accepts a project collection",()=>{expect(featuredSelectionSchema.parse({projectId:"project-1",resourceId:"",tipIds:[]})).toMatchObject({projectId:"project-1"})});
 it("allows resources and tips without a featured project",()=>{expect(featuredSelectionSchema.safeParse({projectId:"",resourceId:"resource-1",tipIds:[]}).success).toBe(true)});
 it("allows every featured section to be cleared",()=>{expect(featuredSelectionSchema.safeParse({projectId:"",resourceId:"",tipIds:[]}).success).toBe(true)});
});
