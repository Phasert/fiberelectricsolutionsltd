import { MockNotice } from "@/components/admin/admin-ui";
import { TipsManager } from "@/components/admin/tips-manager";
import { adminRepository } from "@/lib/admin/repository";
export default async function TipsPage(){const tips=await adminRepository.getTips();return <><TipsManager initial={tips}/><MockNotice/></>}
