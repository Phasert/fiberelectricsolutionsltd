import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/content";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return <Link href={`/projects/${project.slug}`} className="image-zoom card-lift group block overflow-hidden bg-white">
    <div className="relative aspect-[4/3] overflow-hidden"><Image src={project.featuredImage} alt={`${project.title} placeholder artwork`} fill priority={priority} className="object-cover" sizes="(max-width: 768px) 100vw, 50vw"/><span className="absolute left-4 top-4 bg-paper px-3 py-2 text-[.65rem] font-black uppercase tracking-widest text-wine">{project.category}</span></div>
    <div className="p-6"><div className="flex items-start justify-between gap-5"><div><h3 className="display text-2xl">{project.title}</h3><p className="mt-3 text-sm leading-6 text-ink/60">{project.summary}</p></div><span className="text-xl text-wine transition-transform group-hover:translate-x-1">→</span></div><p className="mt-5 border-t border-black/10 pt-4 text-xs uppercase tracking-wider text-ink/45">{project.location}</p></div>
  </Link>;
}
