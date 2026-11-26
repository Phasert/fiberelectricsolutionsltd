"use client";

import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";
import type { AdminProject } from "@/types/admin";
import { categoryLabel } from "@/lib/projects";

export function ProjectList({ projects }: { projects: AdminProject[] }) {
  return <div className="space-y-5">
    <div className="flex flex-col justify-between gap-4 border-b border-black/[.07] pb-5 sm:flex-row sm:items-end">
      <div><h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Projects</h1><p className="mt-1 text-sm text-ink/50">Group photographs into named Electrical or Fibre project collections.</p></div>
      <Link href="/admin/projects/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-wine px-5 text-sm font-bold text-white"><Plus size={17}/> Create project</Link>
    </div>
    {projects.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{projects.map(project=><Link key={project.id} href={`/admin/projects/${project.id}`} className="group overflow-hidden rounded-xl border border-black/[.08] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex aspect-[16/9] items-center justify-center bg-charcoal text-white/25"><FolderOpen size={42}/></div>
      <div className="p-5"><div className="flex items-center justify-between gap-3"><span className="text-[.65rem] font-black uppercase tracking-wider text-wine">{categoryLabel(project.category)}</span><span className={`rounded-full px-2.5 py-1 text-[.6rem] font-black uppercase ${project.status === "Published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{project.status}</span></div><h2 className="mt-3 text-lg font-bold group-hover:text-wine">{project.title}</h2><p className="mt-2 text-xs text-ink/45">{project.galleryCount} photograph{project.galleryCount===1?"":"s"} · Updated {project.updatedAt}</p></div>
    </Link>)}</div> : <div className="rounded-xl border border-dashed border-black/15 bg-white px-6 py-16 text-center"><FolderOpen className="mx-auto text-ink/20" size={42}/><h2 className="mt-4 text-lg font-bold">No project collections yet</h2><p className="mt-2 text-sm text-ink/50">Create a project, then add its photographs.</p><Link href="/admin/projects/new" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-wine px-5 text-sm font-bold text-white"><Plus size={17}/> Create first project</Link></div>}
  </div>;
}
