import Link from "next/link";
import { BookOpenText, ChevronRight, FilePlus2, FolderKanban, Lightbulb, MessageSquareText, Network, Sparkles, Zap } from "lucide-react";
import { AdminPageHeader, StatCard, StatusBadge } from "@/components/admin/admin-ui";
import { adminRepository } from "@/lib/admin/repository";
import { getAuthorizedAdminDashboardContent } from "@/lib/content/admin-dashboard-repository";

const quickActions = [
  { label: "Add project", description: "Create a new portfolio entry", href: "/admin/projects/new", icon: FolderKanban },
  { label: "Add article", description: "Write an insight or update", href: "/admin/resources/new", icon: FilePlus2 },
  { label: "Add tip", description: "Add practical homepage guidance", href: "/admin/articles-tips#tips-heading", icon: Lightbulb },
  { label: "View enquiries", description: "Review quote requests", href: "/admin/enquiries", icon: MessageSquareText },
  { label: "Manage site content", description: "Update homepage and page content", href: "/admin/content", icon: Sparkles },
];

export default async function AdminDashboard() {
  const [projects, resources, tips, enquiries, firebaseContent] = await Promise.all([adminRepository.getProjects(), adminRepository.getResources(), adminRepository.getTips(), adminRepository.getEnquiries(), getAuthorizedAdminDashboardContent()]);
  const recentContent = [
    ...projects.slice(0, 2).map((item) => ({ ...item, type: "Project", href: `/admin/projects/${item.id}` })),
    ...resources.slice(0, 2).map((item) => ({ ...item, type: item.kind === "FES article" ? "Article" : item.kind, href: `/admin/resources/${item.id}` })),
  ];

  return <>
    <AdminPageHeader title="Dashboard" description="Manage the content that keeps the FES website current." action={{ label: "Add project", href: "/admin/projects/new" }} />
    <section className="mb-6 rounded-lg border border-black/[.075] bg-white p-5" aria-labelledby="firebase-content-heading">
      <h2 id="firebase-content-heading" className="text-sm font-bold text-ink">Firebase foundation content</h2>
      <p className="mt-1 text-xs text-ink/40">Read-only records from the protected adminDashboardContent collection.</p>
      {firebaseContent.length ? <ul className="mt-4 grid gap-2">{firebaseContent.map((item) => <li key={item.id} className="border-l-2 border-wine/40 pl-3"><p className="text-sm font-bold">{item.title}</p><p className="text-xs text-ink/50">{item.summary}</p></li>)}</ul> : <p className="mt-4 text-sm text-ink/50">No foundation content records have been added.</p>}
    </section>
    <section aria-labelledby="content-overview-heading">
      <div className="mb-3 flex items-center justify-between"><h2 id="content-overview-heading" className="text-sm font-bold text-ink">Content overview</h2><p className="text-xs text-ink/35">Current managed content</p></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Projects" value={projects.length} detail={`${projects.filter((project) => project.status === "Draft").length} drafts`} icon={FolderKanban} />
        <StatCard label="Electrical" value={projects.filter((project) => project.category === "Electrical").length} detail="Project entries" icon={Zap} />
        <StatCard label="Fiber" value={projects.filter((project) => project.category === "Fiber").length} detail="Project entries" icon={Network} />
        <StatCard label="Resources" value={resources.length} detail="Articles and links" icon={BookOpenText} />
        <StatCard label="Enquiries" value={enquiries.length} detail="Customer requests" icon={MessageSquareText} />
      </div>
    </section>
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,.65fr)]">
      <section className="overflow-hidden rounded-lg border border-black/[.075] bg-white shadow-[0_1px_2px_rgba(20,19,21,.025)]" aria-labelledby="recent-content-heading">
        <div className="flex items-center justify-between border-b border-black/[.065] px-5 py-4 sm:px-6"><div><h2 id="recent-content-heading" className="text-sm font-bold text-ink">Recent content</h2><p className="mt-1 text-xs text-ink/40">Recently updated projects and resources</p></div><Link href="/admin/projects" className="rounded-md px-3 py-2 text-xs font-bold text-wine transition-colors hover:bg-wine/[.06]">View all</Link></div>
        <div className="divide-y divide-black/[.06]">{recentContent.map((item) => <div key={item.id} className="group grid gap-3 px-5 py-4 transition-colors hover:bg-[#faf9f8] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-6"><div className="min-w-0"><Link href={item.href} className="truncate text-sm font-bold text-ink hover:text-wine">{item.title}</Link><div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink/40"><span>{item.type}</span><span aria-hidden="true">•</span><span>Updated {item.updatedAt}</span></div></div><StatusBadge tone={item.status === "Published" ? "good" : "warn"}>{item.status}</StatusBadge><Link href={item.href} className="inline-flex min-h-9 items-center gap-1 rounded-md border border-black/[.08] px-3 text-xs font-bold text-ink/60 transition-colors hover:border-wine/25 hover:text-wine" aria-label={`Edit ${item.title}`}>Edit <ChevronRight size={14} /></Link></div>)}</div>
      </section>
      <section className="rounded-lg border border-black/[.075] bg-white p-5 shadow-[0_1px_2px_rgba(20,19,21,.025)] sm:p-6" aria-labelledby="quick-actions-heading">
        <div><h2 id="quick-actions-heading" className="text-sm font-bold text-ink">Quick actions</h2><p className="mt-1 text-xs text-ink/40">Common content-management tasks</p></div>
        <div className="mt-4 grid gap-2">{quickActions.map(({ label, description, href, icon: Icon }) => <Link key={href} href={href} className="group flex min-h-14 items-center gap-3 rounded-md border border-transparent px-3 py-2.5 transition-all hover:border-wine/10 hover:bg-wine/[.045] focus-visible:outline-wine"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-black/[.035] text-ink/50 transition-colors group-hover:bg-wine group-hover:text-white"><Icon size={17} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-ink">{label}</span><span className="mt-0.5 block truncate text-[.7rem] text-ink/40">{description}</span></span><ChevronRight size={16} className="text-ink/20 transition-transform group-hover:translate-x-0.5 group-hover:text-wine" /></Link>)}</div>
        <div className="mt-4 flex items-center gap-2 border-t border-black/[.06] pt-4 text-xs text-ink/40"><span className="grid size-6 place-items-center rounded-full bg-emerald-50 font-bold text-emerald-700">{tips.filter((tip) => tip.enabled).length}</span>Active homepage tips</div>
      </section>
    </div>
  </>;
}
