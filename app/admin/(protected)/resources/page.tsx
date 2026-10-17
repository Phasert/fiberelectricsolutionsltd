import { AdminPageHeader, MockNotice } from "@/components/admin/admin-ui";
import { ResourcesList } from "@/components/admin/resources-list";
import { adminRepository } from "@/lib/admin/repository";
export default async function ResourcesAdmin(){const items=await adminRepository.getResources();return <><AdminPageHeader title="Articles / Resources" description="Manage original FES writing, company updates and attributed external resources." action={{label:"Add Content",href:"/admin/resources/new"}}/><MockNotice/><ResourcesList items={items}/></>}
