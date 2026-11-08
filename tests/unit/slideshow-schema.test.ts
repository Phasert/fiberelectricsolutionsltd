import {describe,expect,it} from "vitest";
import {mediaSlideshowSchema} from "../../lib/media/schemas";
describe("media slideshow metadata",()=>{
 it("accepts valid draft and published assignments",()=>{expect(mediaSlideshowSchema.parse({placement:"hero",order:2,alt:"Technician working inside an electrical panel",focalPoint:{x:62,y:40},published:false}).placement).toBe("hero")});
 it("rejects empty alt text and invalid focal points",()=>{expect(mediaSlideshowSchema.safeParse({placement:"fiber",order:0,alt:"",focalPoint:{x:101,y:-1},published:true}).success).toBe(false)});
 it("rejects unsupported placements",()=>{expect(mediaSlideshowSchema.safeParse({placement:"projects",order:0,alt:"Project",focalPoint:{x:50,y:50},published:true}).success).toBe(false)});
 it("accepts editable hero content",()=>{expect(mediaSlideshowSchema.parse({placement:"hero",order:0,alt:"Electrical infrastructure",focalPoint:{x:50,y:50},published:true,headline:"Powering what matters.",description:"Practical electrical and fiber optic solutions.",ctaLabel:"Request a Quote",ctaHref:"/request-a-quote"}).ctaHref).toBe("/request-a-quote")});
 it("rejects unsafe hero CTA links",()=>{expect(mediaSlideshowSchema.safeParse({placement:"hero",order:0,alt:"Electrical infrastructure",focalPoint:{x:50,y:50},published:true,ctaHref:"javascript:alert(1)"}).success).toBe(false)});
});
