import Link from "next/link";
import { ProjectCard } from "@/components/projects/project-card";
import type { ProjectCategory, PublicProject } from "@/types/content";

export function ServiceProjects({ projects, category }: { projects: PublicProject[]; category: Exclude<ProjectCategory, "Combined"> }) {
  const matches = projects.filter(project => project.category === category).slice(0, 2);

  if (!matches.length) return <div className="border border-white/12 bg-white/[.04] p-7 sm:p-9">
    <p className="text-xs font-black uppercase tracking-[.16em] text-[#ef9bb0]">Portfolio updates in progress</p>
    <h3 className="display mt-4 text-3xl">Approved {category.toLowerCase()} project stories will appear here.</h3>
    <p className="mt-4 max-w-xl text-sm leading-6 text-white/58">FES is preparing project photography and scope information for publication. No unrelated work or unapproved claims are shown in its place.</p>
    <Link href="/projects" className="mt-7 inline-flex items-center gap-2 text-sm font-black text-white">View the project gallery <span aria-hidden="true">→</span></Link>
  </div>;

  return <div className="grid gap-5 sm:grid-cols-2">{matches.map(project => <ProjectCard key={project.slug} project={project} />)}</div>;
}
