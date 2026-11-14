import {MediaManager}from"@/components/admin/media-manager";
import {adminRepository}from"@/lib/admin/repository";
import {getEditorialStorageMode}from"@/lib/media/repository";

export default async function MediaPage({searchParams}:{searchParams:Promise<{project?:string}>}){
 const[{project},items,projects]=await Promise.all([searchParams,adminRepository.getMedia(),adminRepository.getProjects()]);
 return <MediaManager initialItems={items} projects={projects} initialProject={project} storageMode={getEditorialStorageMode()}/>
}
