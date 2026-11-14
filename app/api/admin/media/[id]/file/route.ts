import {verifyAdminSession}from"@/lib/auth/session";
import {convertHeicToJpeg}from"@/lib/media/image-validation";
import {readEditorialMedia}from"@/lib/media/repository";
type Context={params:Promise<{id:string}>};
export const runtime="nodejs";
export async function GET(_request:Request,context:Context){if(!await verifyAdminSession())return new Response("Unauthorized",{status:401});try{const media=await readEditorialMedia((await context.params).id),isHeic=media.mimeType==="image/heic"||media.mimeType==="image/heif",bytes=isHeic?await convertHeicToJpeg(media.bytes):media.bytes;return new Response(new Uint8Array(bytes),{headers:{"content-type":isHeic?"image/jpeg":media.mimeType,"cache-control":"private, max-age=0, no-store","x-content-type-options":"nosniff"}})}catch{return new Response("Not found",{status:404})}}
