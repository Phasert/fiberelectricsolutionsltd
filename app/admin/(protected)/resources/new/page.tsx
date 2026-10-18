import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { adminRepository } from "@/lib/admin/repository";
export default async function NewResource(){const media=await adminRepository.getMedia();return <><AdminPageHeader title="Add Content" description="Create an original FES article, company update or attributed external resource."/><ResourceForm media={media}/></>}
