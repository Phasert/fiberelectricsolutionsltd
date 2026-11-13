import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProjectForm } from "@/components/admin/project-form";
import { adminRepository } from "@/lib/admin/repository";
export default async function EditProject({params}:{params:Promise<{id:string}>}){const {id}=await params;const [project,media]=await Promise.all([adminRepository.getProject(id),adminRepository.getMedia()]);if(!project)notFound();return <><AdminPageHeader title="Arrange Photos" description="Reorder, replace, publish or hide portfolio photos."/><ProjectForm project={project} media={media}/></>}
