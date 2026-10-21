import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/session";
import { readEnquiryAttachment } from "@/lib/enquiries/repository";

export const dynamic="force-dynamic";
export async function GET(request:Request,{params}:{params:Promise<{id:string;attachmentId:string}>}){
  const session=request.headers.get("cookie")?.match(/(?:^|;\s*)__session=([^;]+)/)?.[1];
  if(!await verifyAdminSession(session?decodeURIComponent(session):""))return NextResponse.json({error:"Unauthorized"},{status:401});
  try{const {id,attachmentId}=await params,{bytes,mimeType}=await readEnquiryAttachment(id,attachmentId);return new NextResponse(new Uint8Array(bytes),{headers:{"content-type":mimeType,"cache-control":"private, no-store","content-disposition":'inline; filename="customer-photo.webp"',"x-content-type-options":"nosniff"}});}
  catch{return NextResponse.json({error:"Photograph not found."},{status:404,headers:{"cache-control":"private, no-store"}});}
}
