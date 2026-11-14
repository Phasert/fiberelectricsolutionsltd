import { AdminPageHeader } from "@/components/admin/admin-ui";
import { GalleryOrganizer } from "@/components/admin/gallery-organizer";
import { adminRepository } from "@/lib/admin/repository";
import { getEditorialStorageMode } from "@/lib/media/repository";
export default async function AdminProjects(){const media=await adminRepository.getMedia();return <><AdminPageHeader title="Projects" description="Upload, organize and publish Electrical and Fiber Optic photographs from one place."/><GalleryOrganizer initialItems={media} storageMode={getEditorialStorageMode()}/></>}
