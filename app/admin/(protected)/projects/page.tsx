import { AdminPageHeader, MockNotice } from "@/components/admin/admin-ui";
import { ProjectList } from "@/components/admin/project-list";
import { adminRepository } from "@/lib/admin/repository";
export default async function AdminProjects(){const projects=await adminRepository.getProjects();return <><AdminPageHeader title="Projects" description="Manage completed work, galleries and what appears on the public website." action={{label:"Add project",href:"/admin/projects/new"}}/><MockNotice/><ProjectList projects={projects}/></>}
