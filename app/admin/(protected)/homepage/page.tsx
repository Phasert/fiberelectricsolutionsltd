import { AdminPageHeader } from "@/components/admin/admin-ui";
import { FeaturedManager } from "@/components/admin/featured-manager";
import { adminRepository } from "@/lib/admin/repository";

export default async function HomepagePage() {
  const [projects, resources, tips, media, initialSelection] = await Promise.all([
    adminRepository.getProjects(),
    adminRepository.getResources(),
    adminRepository.getTips(),
    adminRepository.getMedia(),
    adminRepository.getFeaturedSelection(),
  ]);
  return <>
    <AdminPageHeader title="Homepage" description="Choose and preview the published projects, resources and tips featured on the homepage." />
    <FeaturedManager projects={projects} resources={resources} tips={tips} media={media} initialSelection={initialSelection} />
  </>;
}
