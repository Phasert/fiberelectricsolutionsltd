"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpDown, Edit3, EllipsisVertical, ImageIcon, Search, X } from "lucide-react";
import type { AdminProject, PublishStatus } from "@/types/admin";
import type { ProjectCategory } from "@/types/content";
import { StatusBadge } from "./admin-ui";

type CategoryFilter = "All" | ProjectCategory;
type StatusFilter = "All" | PublishStatus;
type SortOption = "updated" | "newest" | "alphabetical";

const dateValue = (value: string) => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export function ProjectList({ projects }: { projects: AdminProject[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [sort, setSort] = useState<SortOption>("updated");
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return projects.filter((item) => category === "All" || item.category === category)
      .filter((item) => status === "All" || item.status === status)
      .filter((item) => item.title.toLocaleLowerCase().includes(normalized))
      .toSorted((a, b) => sort === "alphabetical" ? a.title.localeCompare(b.title) : sort === "newest" ? dateValue(b.period) - dateValue(a.period) : dateValue(b.updatedAt) - dateValue(a.updatedAt));
  }, [category, projects, query, sort, status]);
  const filtered = Boolean(query.trim()) || category !== "All" || status !== "All";
  const clear = () => { setQuery(""); setCategory("All"); setStatus("All"); };

  return <section aria-labelledby="project-count">
    <div className="rounded-xl border border-black/[.08] bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(16rem,1fr)_repeat(3,minmax(9rem,auto))] lg:items-end">
        <label className="grid gap-1.5 text-sm font-bold">Search projects<span className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} className="input rounded-md pl-10 pr-10" placeholder="Search by project title" type="search"/>{query && <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded hover:bg-paper" aria-label="Clear search"><X size={16}/></button>}</span></label>
        <FilterSelect label="Category" value={category} onChange={(value) => setCategory(value as CategoryFilter)} options={["All", "Electrical", "Fiber", "Combined"]}/>
        <FilterSelect label="Status" value={status} onChange={(value) => setStatus(value as StatusFilter)} options={["All", "Draft", "Published"]}/>
        <FilterSelect label="Sort by" value={sort} onChange={(value) => setSort(value as SortOption)} options={["updated", "newest", "alphabetical"]} labels={{ updated: "Last updated", newest: "Newest project", alphabetical: "A–Z" }} icon={<ArrowUpDown size={15}/>}/>
      </div>
    </div>
    <div className="my-4 flex min-h-8 flex-wrap items-center justify-between gap-3"><p id="project-count" aria-live="polite" className="text-sm font-semibold text-ink/60">Showing <strong className="text-ink">{visible.length}</strong> of <strong className="text-ink">{projects.length}</strong> {projects.length === 1 ? "project" : "projects"}</p>{filtered && <button type="button" onClick={clear} className="text-sm font-bold text-wine underline decoration-wine/30">Clear filters</button>}</div>
    {visible.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">{visible.map((project) => <article key={project.id} className="group overflow-hidden rounded-xl border border-black/[.08] bg-white shadow-sm transition hover:border-wine/35 hover:shadow-md xl:grid xl:grid-cols-[11rem_minmax(0,1fr)_auto] xl:items-center">
      <Link href={`/admin/projects/${project.id}`} className="relative block aspect-[16/10] overflow-hidden bg-charcoal xl:aspect-[4/3]" aria-label={`Edit ${project.title}`}><Image src={project.image} alt="" fill sizes="(min-width:1280px) 176px, (min-width:768px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]"/></Link>
      <div className="min-w-0 p-4 sm:p-5"><div className="flex flex-wrap gap-2"><StatusBadge tone={project.status === "Published" ? "good" : "warn"}>{project.status}</StatusBadge>{project.featured && project.status === "Published" && <StatusBadge tone="info">Featured</StatusBadge>}</div><h2 className="mt-3 truncate text-base font-bold tracking-tight sm:text-lg"><Link className="hover:text-wine" href={`/admin/projects/${project.id}`}>{project.title}</Link></h2><p className="mt-1.5 line-clamp-2 text-sm leading-6 text-ink/50">{project.summary}</p><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-ink/45"><span>{project.category}</span><span className="inline-flex items-center gap-1.5"><ImageIcon size={14}/>{project.galleryCount} photos</span><span>Updated {project.updatedAt}</span></div></div>
      <div className="flex items-center gap-2 border-t border-black/[.06] p-4 xl:border-l xl:border-t-0 xl:p-5"><Link href={`/admin/projects/${project.id}`} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md border border-wine/25 px-4 text-sm font-bold text-wine hover:bg-wine hover:text-white xl:flex-none"><Edit3 size={16}/> Edit</Link><details className="relative"><summary className="grid size-10 cursor-pointer list-none place-items-center rounded-md border border-black/10 hover:bg-paper" aria-label={`More actions for ${project.title}`}><EllipsisVertical size={18}/></summary><div className="absolute bottom-12 right-0 z-10 w-44 rounded-md border border-black/10 bg-white p-1 shadow-xl"><Link href="/projects" className="block rounded px-3 py-2 text-sm hover:bg-paper">View public projects</Link><Link href="/admin/projects/new" className="block rounded px-3 py-2 text-sm hover:bg-paper">Add another project</Link></div></details></div>
    </article>)}</div> : <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-black/15 bg-white px-6 py-12 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-full bg-paper text-wine"><Search size={22}/></span><h2 className="mt-4 text-lg font-bold">{projects.length ? "No matching projects" : "No projects yet"}</h2><p className="mt-2 text-sm text-ink/50">{projects.length ? "Try a different title, category or publication status." : "Add your first completed project to begin building the gallery."}</p>{projects.length ? <button type="button" onClick={clear} className="mt-5 min-h-11 rounded-md border border-wine/25 px-5 text-sm font-bold text-wine">Clear filters</button> : <Link href="/admin/projects/new" className="mt-5 inline-flex min-h-11 items-center rounded-md bg-wine px-5 text-sm font-bold text-white">Add project</Link>}</div></div>}
  </section>;
}

function FilterSelect({ label, value, options, onChange, labels, icon }: { label: string; value: string; options: string[]; onChange: (value: string) => void; labels?: Record<string, string>; icon?: React.ReactNode }) {
  return <label className="grid gap-1.5 text-sm font-bold">{label}<span className="relative">{icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35">{icon}</span>}<select value={value} onChange={(e) => onChange(e.target.value)} className={`input rounded-md pr-8 ${icon ? "pl-10" : ""}`}>{options.map((option) => <option key={option} value={option}>{labels?.[option] ?? option}</option>)}</select></span></label>;
}
