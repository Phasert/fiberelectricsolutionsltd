import "server-only";

import {createHash} from "node:crypto";
import sharp from "sharp";

export type PreparedQuoteAttachment={checksum:string;bytes:Buffer;width:number;height:number;sizeBytes:number;mimeType:"image/webp"};
const detectedType=(bytes:Uint8Array)=>bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255?"image/jpeg":bytes.length>=8&&[137,80,78,71,13,10,26,10].every((value,index)=>bytes[index]===value)?"image/png":bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP"?"image/webp":null;

export async function prepareQuoteAttachments(files:File[],limits:{maxFiles:number;maxFileBytes:number;maxTotalBytes:number;maxPixels:number;maxDimension:number;outputMaxDimension:number}){
  if(files.length>limits.maxFiles)throw new Error("QUOTE_ATTACHMENT_COUNT_INVALID");
  if(files.reduce((total,file)=>total+file.size,0)>limits.maxTotalBytes)throw new Error("QUOTE_ATTACHMENT_TOTAL_INVALID");
  const prepared:PreparedQuoteAttachment[]=[];
  for(const file of files){
    if(!["image/jpeg","image/png","image/webp"].includes(file.type))throw new Error("QUOTE_ATTACHMENT_TYPE_INVALID");
    if(!file.size||file.size>limits.maxFileBytes)throw new Error("QUOTE_ATTACHMENT_SIZE_INVALID");
    const input=new Uint8Array(await file.arrayBuffer());
    if(detectedType(input)!==file.type)throw new Error("QUOTE_ATTACHMENT_SIGNATURE_INVALID");
    let metadata:sharp.Metadata;
    try{metadata=await sharp(input,{failOn:"error",limitInputPixels:limits.maxPixels,sequentialRead:true}).metadata();}catch{throw new Error("QUOTE_ATTACHMENT_DECODE_INVALID")}
    const width=metadata.width??0,height=metadata.height??0;
    if(!width||!height||width>limits.maxDimension||height>limits.maxDimension||width*height>limits.maxPixels)throw new Error("QUOTE_ATTACHMENT_DIMENSIONS_INVALID");
    if((metadata.pages??1)!==1||(metadata.pageHeight&&metadata.pageHeight!==height))throw new Error("QUOTE_ATTACHMENT_ANIMATION_INVALID");
    const bytes=await sharp(input,{failOn:"error",limitInputPixels:limits.maxPixels,sequentialRead:true}).rotate().resize({width:limits.outputMaxDimension,height:limits.outputMaxDimension,fit:"inside",withoutEnlargement:true}).toColourspace("srgb").webp({quality:82,effort:5}).toBuffer();
    const output=await sharp(bytes).metadata();
    prepared.push({bytes,width:output.width!,height:output.height!,sizeBytes:bytes.length,mimeType:"image/webp",checksum:createHash("sha256").update(bytes).digest("hex")});
  }
  return prepared;
}
