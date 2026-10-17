import { AdminPageHeader, MockNotice } from "@/components/admin/admin-ui";
import { EnquiryList } from "@/components/admin/enquiry-list";
import { adminRepository } from "@/lib/admin/repository";
export default async function EnquiriesPage(){const items=await adminRepository.getEnquiries();return <><AdminPageHeader title="Quote Requests" description="Review customer enquiries, understand the work requested and keep follow-up organised."/><MockNotice/><EnquiryList items={items}/></>}
