import { verifyAdminSession } from "@/lib/auth/session";
import { readEditorialMedia } from "@/lib/media/repository";
type Context={params:Promise<{id:string}>};
export const runtime="nodejs";
export async function GET(_request:Request,context:Context){if(!await verifyAdminSession())return new Response("Unauthorized",{status:401});try{const media=await readEditorialMedia((await context.params).id);return new Response(new Uint8Array(media.bytes),{headers:{"content-type":media.mimeType,"cache-control":"private, max-age=0, no-store","x-content-type-options":"nosniff"}})}catch{return new Response("Not found",{status:404})}}
