import {createRequire}from"node:module";
import { EDITORIAL_MEDIA_MAX_BYTES,EDITORIAL_MEDIA_MAX_DIMENSION,EDITORIAL_MEDIA_MAX_PIXELS,editorialMimeSchema,type EditorialMimeType } from "@/lib/media/schemas";
import { decodeAndProcessImage } from "@/lib/media/processing";

type ProcessableMime="image/jpeg"|"image/png"|"image/webp";
const extension:Record<EditorialMimeType,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/heic":"heic","image/heif":"heif"};
const heicBrands=new Set(["heic","heix","hevc","hevx","heim","heis","mif1","msf1"]);
type HeicConvert=(options:{buffer:Uint8Array;format:"JPEG"|"PNG";quality?:number})=>Promise<Uint8Array>;
const nodeRequire=createRequire(import.meta.url);

export async function convertHeicToJpeg(bytes:Uint8Array){
 try{const heicConvert=nodeRequire("heic-convert") as HeicConvert;return new Uint8Array(await heicConvert({buffer:Buffer.from(bytes),format:"JPEG",quality:0.92}))}
 catch{throw new Error("MEDIA_HEIC_CONVERSION_FAILED")}
}

export async function validateEditorialImage(input:{bytes:Uint8Array;mimeType:string;originalName:string;maxBytes?:number;maxPixels?:number;maxDimension?:number;version?:string}){
 const mimeType=editorialMimeSchema.parse(input.mimeType),maxBytes=input.maxBytes??Number(process.env.EDITORIAL_MEDIA_MAX_BYTES||EDITORIAL_MEDIA_MAX_BYTES);
 if(!Number.isSafeInteger(maxBytes)||maxBytes<1)throw new Error("MEDIA_CONFIG_INVALID");
 if(!input.bytes.length||input.bytes.length>maxBytes)throw new Error("MEDIA_SIZE_INVALID");
 if(detectType(input.bytes)!==normalizedFamily(mimeType))throw new Error("MEDIA_SIGNATURE_INVALID");
 const isHeic=mimeType==="image/heic"||mimeType==="image/heif";
 const processBytes=isHeic?await convertHeicToJpeg(input.bytes):input.bytes;
 const processMime:ProcessableMime=isHeic?"image/jpeg":mimeType;
 if(!isHeic){const dimensions=readDimensions(processBytes,processMime);if(!dimensions||!dimensions.width||!dimensions.height||dimensions.width>(input.maxDimension??EDITORIAL_MEDIA_MAX_DIMENSION)||dimensions.height>(input.maxDimension??EDITORIAL_MEDIA_MAX_DIMENSION)||(dimensions.width*dimensions.height)>(input.maxPixels??EDITORIAL_MEDIA_MAX_PIXELS))throw new Error("MEDIA_DIMENSIONS_INVALID")}
 const processed=await decodeAndProcessImage({bytes:processBytes,mimeType:processMime,maxPixels:input.maxPixels??EDITORIAL_MEDIA_MAX_PIXELS,maxDimension:input.maxDimension??EDITORIAL_MEDIA_MAX_DIMENSION,version:input.version??"v1"});
 const originalName=input.originalName.replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,180)||`image.${extension[mimeType]}`;
 return{mimeType,processingMimeType:processMime,extension:extension[mimeType],originalName,sizeBytes:input.bytes.length,privateOriginal:isHeic?input.bytes:processed.normalized,...processed}
}

function normalizedFamily(mimeType:EditorialMimeType){return mimeType==="image/heif"?"image/heic":mimeType}
function detectType(b:Uint8Array):"image/jpeg"|"image/png"|"image/webp"|"image/heic"|null{if(b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255)return"image/jpeg";if(b.length>=24&&[137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v))return"image/png";if(b.length>=16&&text(b,0,4)==="RIFF"&&text(b,8,12)==="WEBP")return"image/webp";if(b.length>=12&&text(b,4,8)==="ftyp"&&heicBrands.has(text(b,8,12)))return"image/heic";return null}
function readDimensions(b:Uint8Array,m:ProcessableMime){if(m==="image/png")return{width:be32(b,16),height:be32(b,20)};if(m==="image/jpeg"){let o=2;while(o+9<b.length){if(b[o]!==255){o++;continue}const marker=b[o+1];if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker))return{height:be16(b,o+5),width:be16(b,o+7)};const length=be16(b,o+2);if(length<2)return null;o+=2+length}return null}const c=text(b,12,16);if(c==="VP8X"&&b.length>=30)return{width:le24(b,24)+1,height:le24(b,27)+1};if(c==="VP8L"&&b.length>=25&&b[20]===47){const bits=(b[21]|b[22]<<8|b[23]<<16|b[24]<<24)>>>0;return{width:(bits&16383)+1,height:(bits>>>14&16383)+1}}if(c==="VP8 "&&b.length>=30&&b[23]===157&&b[24]===1&&b[25]===42)return{width:le16(b,26)&16383,height:le16(b,28)&16383};return null}
const text=(b:Uint8Array,s:number,e:number)=>String.fromCharCode(...b.slice(s,e));const be16=(b:Uint8Array,o:number)=>(b[o]<<8)|b[o+1];const be32=(b:Uint8Array,o:number)=>((b[o]<<24)|(b[o+1]<<16)|(b[o+2]<<8)|b[o+3])>>>0;const le24=(b:Uint8Array,o:number)=>b[o]|b[o+1]<<8|b[o+2]<<16;const le16=(b:Uint8Array,o:number)=>b[o]|b[o+1]<<8;
