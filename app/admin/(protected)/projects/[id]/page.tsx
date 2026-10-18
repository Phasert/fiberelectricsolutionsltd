import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProjectForm } from "@/components/admin/project-form";
import { adminRepository } from "@/lib/admin/repository";
export default async function EditProject({params}:{params:Promise<{id:string}>}){const {id}=await params;const project=await adminRepository.getProject(id);if(!project)notFound();return <><AdminPageHeader title="Edit project" description="Update the Firestore project record and publication state."/><ProjectForm project={project}/></>}
