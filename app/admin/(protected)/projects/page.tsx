import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProjectList } from "@/components/admin/project-list";
import { adminRepository } from "@/lib/admin/repository";
export default async function AdminProjects(){const projects=await adminRepository.getProjects();return <><AdminPageHeader title="Projects" description="Create, organize and publish your completed projects." action={{label:"Add project",href:"/admin/projects/new"}}/><ProjectList projects={projects}/></>}
