import {MediaProjectsWorkspace}from"@/components/admin/media-projects-workspace";
import {adminRepository}from"@/lib/admin/repository";
import {getEditorialStorageMode}from"@/lib/media/repository";

export default async function MediaPage({searchParams}:{searchParams:Promise<{tab?:string}>}){
 const[{tab},items,projects]=await Promise.all([searchParams,adminRepository.getMedia(),adminRepository.getProjects()]),initialTab=tab==="slideshows"||tab==="library"?tab:"gallery";
 return <MediaProjectsWorkspace initialItems={items} projects={projects} initialTab={initialTab} storageMode={getEditorialStorageMode()}/>
}
