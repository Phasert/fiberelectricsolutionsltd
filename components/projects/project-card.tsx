import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { categoryLabel } from "@/lib/projects";
import type { Project, PublicProject } from "@/types/content";

export function ProjectCard({project,priority=false}:{project:Project|PublicProject;priority?:boolean}){
  const contain="featuredImageFit" in project&&project.featuredImageFit==="contain";
  return <Link href={`/projects/${project.slug}`} className="image-zoom card-lift group flex h-full flex-col overflow-hidden rounded-sm border border-black/8 bg-white focus-visible:outline-wine">
    <div className="relative aspect-[16/10] overflow-hidden bg-charcoal"><Image src={project.featuredImage} alt={project.featuredImageAlt||`${project.title} featured project photograph`} fill priority={priority} unoptimized={project.featuredImage.startsWith("/media/")} className={contain?"object-contain":"object-cover"} sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"/><div className="absolute left-4 top-4 flex flex-wrap gap-2"><span className="bg-paper/95 px-3 py-2 text-[.65rem] font-black uppercase tracking-[.14em] text-wine shadow-sm">{categoryLabel(project.category)}</span>{"demo" in project&&project.demo&&<span className="bg-ink/85 px-3 py-2 text-[.65rem] font-black uppercase tracking-[.14em] text-white backdrop-blur">Demo</span>}</div><div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent"/></div>
    <div className="flex flex-1 flex-col p-6 sm:p-7"><h3 className="display text-[1.75rem] leading-tight transition-colors group-hover:text-wine">{project.title}</h3>{project.summary&&<p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/60">{project.summary}</p>}<div className="mt-auto flex items-end justify-between gap-4 border-t border-black/10 pt-5"><div>{project.location&&<p className="flex items-center gap-1.5 text-xs font-semibold text-ink/48"><MapPin size={14} aria-hidden="true"/>{project.location}</p>}<p className={`${project.location?"mt-3":""} text-xs font-black uppercase tracking-[.12em] text-wine`}>View project</p></div><span className="grid size-10 shrink-0 place-items-center rounded-full border border-wine/20 text-wine transition group-hover:bg-wine group-hover:text-white"><ArrowUpRight size={18} aria-hidden="true"/></span></div></div>
  </Link>;
}
