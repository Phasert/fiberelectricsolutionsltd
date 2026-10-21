import { NextResponse } from "next/server";
import { requestHasTrustedOrigin, verifyAdminSession } from "@/lib/auth/session";
import { addEnquiryNote } from "@/lib/enquiries/repository";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!requestHasTrustedOrigin(request))return NextResponse.json({error:"Invalid origin"},{status:403});
  const administrator=await verifyAdminSession();if(!administrator)return NextResponse.json({error:"Unauthorized"},{status:401});
  try{const note=await addEnquiryNote((await params).id,await request.json(),administrator);return NextResponse.json({note},{status:201});}
  catch(error){return NextResponse.json({error:error instanceof Error&&error.message==="ENQUIRY_NOT_FOUND"?"Enquiry not found.":"Enter a note between 1 and 2,000 characters."},{status:error instanceof Error&&error.message==="ENQUIRY_NOT_FOUND"?404:400});}
}
