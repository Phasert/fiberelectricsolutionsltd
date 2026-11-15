import { ProjectList } from "@/components/admin/project-list";
import { listAdminProjects } from "@/lib/projects/repository";
export default async function AdminProjects(){return <ProjectList projects={await listAdminProjects()}/>}
