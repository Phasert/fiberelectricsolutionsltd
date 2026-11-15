import {MediaProjectsWorkspace}from"@/components/admin/media-projects-workspace";
import {adminRepository}from"@/lib/admin/repository";
import {getEditorialStorageMode}from"@/lib/media/repository";

export default async function MediaPage({searchParams}:{searchParams:Promise<{tab?:string;upload?:string}>}){
 const[{tab,upload},items,projects]=await Promise.all([searchParams,adminRepository.getMedia(),adminRepository.getProjects()]),initialTab=tab==="library"?tab:"gallery";
 return <MediaProjectsWorkspace initialItems={items} projects={projects} initialTab={initialTab} initialUpload={upload==="1"} storageMode={getEditorialStorageMode()}/>
}
