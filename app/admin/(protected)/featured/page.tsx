import { AdminPageHeader } from "@/components/admin/admin-ui";
import { FeaturedManager } from "@/components/admin/featured-manager";
import { adminRepository } from "@/lib/admin/repository";
export default async function FeaturedPage(){const [projects,resources,tips,media,initialSelection]=await Promise.all([adminRepository.getProjects(),adminRepository.getResources(),adminRepository.getTips(),adminRepository.getMedia(),adminRepository.getFeaturedSelection()]);return <><AdminPageHeader title="Homepage Content" description="Choose which approved projects, resources and tips are highlighted across the public homepage."/><FeaturedManager projects={projects} resources={resources} tips={tips} media={media} initialSelection={initialSelection}/></>}
