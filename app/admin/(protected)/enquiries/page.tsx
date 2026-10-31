import { AdminPageHeader } from "@/components/admin/admin-ui";
import { EnquiryList } from "@/components/admin/enquiry-list";
import { adminRepository } from "@/lib/admin/repository";
export const dynamic="force-dynamic";
export default async function EnquiriesPage({searchParams}:{searchParams:Promise<{after?:string}>}){const {after}=await searchParams,{items,nextCursor}=await adminRepository.getEnquiriesPage(after);return <><AdminPageHeader title="Quote Requests" description="Review customer enquiries, understand the work requested and keep follow-up organised."/><EnquiryList items={items} nextCursor={nextCursor}/></>}
