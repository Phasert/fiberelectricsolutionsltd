import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ContentEditor } from "@/components/admin/content-editor";
import { FeaturedManager } from "@/components/admin/featured-manager";
import { listAdminServices, listAdminSiteContent } from "@/lib/site-content/repository";
import { adminRepository } from "@/lib/admin/repository";
export default async function ContentPage(){const [initialPages,initialServices,media,projects,resources,tips,initialSelection]=await Promise.all([listAdminSiteContent(),listAdminServices(),adminRepository.getMedia(),adminRepository.getProjects(),adminRepository.getResources(),adminRepository.getTips(),adminRepository.getFeaturedSelection()]);return <><AdminPageHeader title="Site Content" description="Edit current website content and publish changes directly to the live site."/><ContentEditor initialPages={initialPages} initialServices={initialServices} media={media} homepageFeatures={<FeaturedManager projects={projects} resources={resources} tips={tips} media={media} initialSelection={initialSelection}/>}/></>}
