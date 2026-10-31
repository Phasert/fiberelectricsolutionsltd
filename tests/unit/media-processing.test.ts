import {describe,expect,it} from "vitest";
import sharp from "sharp";
import {decodeAndProcessImage} from "@/lib/media/processing";

const cases=[[1600,900],[900,1600],[1000,1000],[2400,480],[480,2400]] as const;

describe("editorial image processing",()=>{
  it.each(cases)("keeps a complete %sx%s original and creates responsive derivatives",async(width,height)=>{
    const bytes=await sharp({create:{width,height,channels:3,background:"#7d1028"}}).jpeg().toBuffer();
    const result=await decodeAndProcessImage({bytes,mimeType:"image/jpeg",maxPixels:40_000_000,maxDimension:12_000,version:"test"});
    expect(result.width).toBe(width);expect(result.height).toBe(height);expect(result.derivatives.length).toBeGreaterThan(0);
  });
  it("applies a crop and 90 degree rotation to derivatives",async()=>{
    const bytes=await sharp({create:{width:1200,height:800,channels:3,background:"#0b6ca8"}}).jpeg().toBuffer();
    const result=await decodeAndProcessImage({bytes,mimeType:"image/jpeg",maxPixels:40_000_000,maxDimension:12_000,version:"crop",crop:{x:100,y:150,width:500,height:700,rotation:90,aspectRatio:"freeform"}});
    expect(result.width).toBe(500);expect(result.height).toBe(700);expect(result.derivatives[0].descriptor.width).toBe(500);
  });
  it("rejects crop coordinates outside the rotated source",async()=>{
    const bytes=await sharp({create:{width:800,height:600,channels:3,background:"white"}}).png().toBuffer();
    await expect(decodeAndProcessImage({bytes,mimeType:"image/png",maxPixels:40_000_000,maxDimension:12_000,version:"bad",crop:{x:700,y:0,width:200,height:200,rotation:0,aspectRatio:"1:1"}})).rejects.toThrow("MEDIA_CROP_INVALID");
  });
  it("processes a bounded image batch with concurrency two",async()=>{const source=await sharp({create:{width:1920,height:1080,channels:3,background:"#7d1028"}}).jpeg().toBuffer(),jobs=Array.from({length:10},(_,index)=>()=>decodeAndProcessImage({bytes:source,mimeType:"image/jpeg",maxPixels:40_000_000,maxDimension:12_000,version:`load-${index}`})),started=performance.now(),results:Awaited<ReturnType<typeof decodeAndProcessImage>>[]=[],queue=[...jobs];await Promise.all(Array.from({length:2},async()=>{while(queue.length){const job=queue.shift();if(job)results.push(await job())}}));const elapsed=performance.now()-started;expect(results).toHaveLength(10);console.info("AUDIT image-processing",{images:results.length,concurrency:2,elapsedMs:Math.round(elapsed),imagesPerSecond:Number((results.length/(elapsed/1000)).toFixed(2))})});
});
