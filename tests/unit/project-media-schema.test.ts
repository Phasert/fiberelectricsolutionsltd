import { describe, expect, it } from "vitest";
import { projectInputSchema } from "@/lib/projects/schemas";
import { editorialVideoMimeSchema } from "@/lib/media/schemas";

describe("project media schema",()=>{
  it("allows a name-only draft",()=>{
    const project=projectInputSchema.parse({title:"Tommy's Brentwood",slug:"tommys-brentwood"});
    expect(project.status).toBe("Draft");
    expect(project.summary).toBe("");
    expect(project.gallery).toEqual([]);
  });

  it("requires media and a cover before publication",()=>{
    const result=projectInputSchema.safeParse({title:"Tommy's Brentwood",slug:"tommys-brentwood",status:"Published"});
    expect(result.success).toBe(false);
  });

  it("accepts browser-compatible project video types",()=>{
    expect(editorialVideoMimeSchema.parse("video/mp4")).toBe("video/mp4");
    expect(editorialVideoMimeSchema.parse("video/quicktime")).toBe("video/quicktime");
  });
});
