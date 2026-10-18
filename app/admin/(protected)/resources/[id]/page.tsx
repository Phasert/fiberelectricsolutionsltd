import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { adminRepository } from "@/lib/admin/repository";
export default async function EditResource({params}:{params:Promise<{id:string}>}){const {id}=await params;const [item,media]=await Promise.all([adminRepository.getResource(id),adminRepository.getMedia()]);if(!item)notFound();return <><AdminPageHeader title="Edit Content" description={`Update ${item.title} without changing its content type.`}/><ResourceForm resource={item} media={media}/></>}
