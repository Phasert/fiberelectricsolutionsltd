import { notFound } from "next/navigation";
import { AdminPageHeader, MockNotice } from "@/components/admin/admin-ui";
import { EnquiryDetail } from "@/components/admin/enquiry-detail";
import { adminRepository } from "@/lib/admin/repository";
export default async function EnquiryPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const item=await adminRepository.getEnquiry(id);if(!item)notFound();return <><AdminPageHeader title={item.name} description={`${item.service} quote request · ${item.id}`}/><MockNotice/><EnquiryDetail item={item}/></>}
