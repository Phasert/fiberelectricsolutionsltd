import { NextResponse } from "next/server";
import { requestHasTrustedOrigin, verifyAdminSession } from "@/lib/auth/session";
import { enquiryStatusSchema, updateEnquiryStatus } from "@/lib/enquiries/repository";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!requestHasTrustedOrigin(request))return NextResponse.json({error:"Invalid origin"},{status:403});
  const administrator=await verifyAdminSession();if(!administrator)return NextResponse.json({error:"Unauthorized"},{status:401});
  try{const {id}=await params,{status}=await request.json(),value=enquiryStatusSchema.parse(status);await updateEnquiryStatus(id,value,administrator);return NextResponse.json({status:value});}
  catch(error){return NextResponse.json({error:error instanceof Error&&error.message==="ENQUIRY_NOT_FOUND"?"Enquiry not found.":"Select a valid enquiry status."},{status:error instanceof Error&&error.message==="ENQUIRY_NOT_FOUND"?404:400});}
}
