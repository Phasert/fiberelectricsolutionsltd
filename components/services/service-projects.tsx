import Link from "next/link";
import { ProjectCard } from "@/components/projects/project-card";
import type { ProjectCategory, PublicProject } from "@/types/content";

export function ServiceProjects({ projects, category }: { projects: PublicProject[]; category: Exclude<ProjectCategory, "Combined"> }) {
  const matches = projects.filter(project => project.category === category).slice(0, 2);

  if (!matches.length) return <div className="border border-white/12 bg-white/[.04] p-7 sm:p-9">
    <h3 className="display text-3xl">No projects listed for this service.</h3>
    <Link href="/projects" className="mt-7 inline-flex items-center gap-2 text-sm font-black text-white">View the project gallery <span aria-hidden="true">→</span></Link>
  </div>;

  return <div className="grid gap-5 sm:grid-cols-2">{matches.map(project => <ProjectCard key={project.slug} project={project} />)}</div>;
}
