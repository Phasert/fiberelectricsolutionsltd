import {MediaProjectsWorkspace}from"@/components/admin/media-projects-workspace";
import {adminRepository}from"@/lib/admin/repository";
import {getEditorialStorageMode}from"@/lib/media/repository";

export default async function MediaPage({searchParams}:{searchParams:Promise<{upload?:string;project?:string}>}){
 const[{upload,project},items,projects]=await Promise.all([searchParams,adminRepository.getMedia(),adminRepository.getProjects()]);
 return <MediaProjectsWorkspace initialItems={items} projects={projects} initialUpload={upload==="1"} initialProject={project} storageMode={getEditorialStorageMode()}/>
}
