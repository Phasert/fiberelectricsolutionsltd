import { NextResponse } from "next/server";
import { requestHasTrustedOrigin, verifyAdminSession } from "@/lib/auth/session";
import { enquiryStatusSchema, updateEnquiryStatus } from "@/lib/enquiries/repository";
import { deleteQuoteRequest } from "@/lib/quotes/repository";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!requestHasTrustedOrigin(request))return NextResponse.json({error:"Invalid origin"},{status:403});
  const administrator=await verifyAdminSession();if(!administrator)return NextResponse.json({error:"Unauthorized"},{status:401});
  try{const {id}=await params,{status}=await request.json(),value=enquiryStatusSchema.parse(status);await updateEnquiryStatus(id,value,administrator);return NextResponse.json({status:value});}
  catch(error){return NextResponse.json({error:error instanceof Error&&error.message==="ENQUIRY_NOT_FOUND"?"Enquiry not found.":"Select a valid enquiry status."},{status:error instanceof Error&&error.message==="ENQUIRY_NOT_FOUND"?404:400});}
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!requestHasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id || id.includes("/") || id === "." || id === "..") {
    return NextResponse.json({ error: "Invalid quote request reference." }, { status: 400 });
  }

  try {
    await deleteQuoteRequest(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "QUOTE_LEGAL_HOLD") {
      return NextResponse.json({ error: "This quote request is under a legal hold and cannot be deleted." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not finish deleting the quote request. Please try again." }, { status: 500 });
  }
}
