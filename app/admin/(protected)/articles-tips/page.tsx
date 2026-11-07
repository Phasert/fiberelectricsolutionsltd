import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ResourcesList } from "@/components/admin/resources-list";
import { TipsManager } from "@/components/admin/tips-manager";
import { adminRepository } from "@/lib/admin/repository";

export default async function ArticlesAndTipsPage() {
  const [items, tips] = await Promise.all([
    adminRepository.getResources(),
    adminRepository.getTips(),
  ]);

  return <>
    <AdminPageHeader
      title="Articles & Tips"
      description="Create articles, resources and practical tips while keeping their public destinations separate."
      action={{ label: "Add article or resource", href: "/admin/resources/new" }}
    />
    <div className="space-y-10">
      <section aria-labelledby="articles-resources-heading">
        <div className="mb-4">
          <h2 id="articles-resources-heading" className="text-lg font-bold">Articles & resources</h2>
          <p className="mt-1 text-sm text-ink/50">Long-form content, company updates and trusted external resources.</p>
        </div>
        <ResourcesList items={items} />
      </section>
      <section aria-labelledby="tips-heading" className="border-t border-black/10 pt-8">
        <h2 id="tips-heading" className="sr-only">Practical tips</h2>
        <TipsManager initial={tips} embedded />
      </section>
    </div>
  </>;
}
