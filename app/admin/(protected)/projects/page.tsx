import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProjectList } from "@/components/admin/project-list";
import { GalleryOrganizer } from "@/components/admin/gallery-organizer";
import { adminRepository } from "@/lib/admin/repository";
export default async function AdminProjects(){const[projects,media]=await Promise.all([adminRepository.getProjects(),adminRepository.getMedia()]);return <><AdminPageHeader title="Project Photos" description="Upload, arrange and publish electrical or fiber optic portfolio photos." action={{label:"Add Photos",href:"/admin/media"}}/><div className="space-y-10"><GalleryOrganizer initialItems={media}/>{projects.length>0&&<section><h2 className="mb-1 text-lg font-bold">Existing project galleries</h2><p className="mb-4 text-sm text-ink/50">These preserved records remain editable for backward compatibility.</p><ProjectList projects={projects}/></section>}</div></>}
