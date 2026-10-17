import { AdminPageHeader, MockNotice } from "@/components/admin/admin-ui";
import { FeaturedManager } from "@/components/admin/featured-manager";
import { adminRepository } from "@/lib/admin/repository";
export default async function FeaturedPage(){const [projects,resources,tips,media]=await Promise.all([adminRepository.getProjects(),adminRepository.getResources(),adminRepository.getTips(),adminRepository.getMedia()]);return <><AdminPageHeader title="Homepage Content" description="Choose which approved projects, resources and tips are highlighted across the public homepage."/><MockNotice/><FeaturedManager projects={projects} resources={resources} tips={tips} media={media}/></>}
