import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProjectForm } from "@/components/admin/project-form";
import { adminRepository } from "@/lib/admin/repository";
export default async function NewProject(){const media=await adminRepository.getMedia();return <><AdminPageHeader title="Add project" description="Create a secure draft project record in Firestore."/><ProjectForm media={media}/></>}
