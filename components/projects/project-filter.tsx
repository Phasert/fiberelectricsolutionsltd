"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { ProjectCategory, PublicProject } from "@/types/content";
import { ProjectCard } from "./project-card";

const filters: ("All" | ProjectCategory)[] = ["All", "Electrical", "Fiber", "Combined"];
export function ProjectFilter({ projects }: { projects: PublicProject[] }) {
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return projects.filter(project => active === "All" || project.category === active).filter(project => !search || `${project.title} ${project.summary}`.toLocaleLowerCase().includes(search));
  }, [active, projects, query]);
  const filtered = active !== "All" || Boolean(query.trim());
  const reset = () => { setActive("All"); setQuery(""); };

  return <><div className="mb-8 rounded-sm border border-black/8 bg-white p-4 shadow-[0_18px_45px_rgb(20_19_21/.06)] sm:p-5"><div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center"><label className="relative block"><span className="sr-only">Search projects</span><Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35"/><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search projects" className="min-h-12 w-full rounded-sm border border-black/12 bg-paper/45 pl-11 pr-11 text-sm placeholder:text-ink/38 focus:border-wine"/>{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear project search" className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-ink/45 hover:bg-white"><X size={16}/></button>}</label><div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">{filters.map(filter => <button type="button" key={filter} onClick={() => setActive(filter)} aria-pressed={active === filter} className={`min-h-11 rounded-sm px-4 text-[.68rem] font-black uppercase tracking-[.11em] transition-colors ${active === filter ? "bg-wine text-white" : "border border-black/12 bg-white text-ink/65 hover:border-wine hover:text-wine"}`}>{filter === "Fiber" ? "Fiber Optic" : filter === "All" ? "All Projects" : filter}</button>)}</div></div></div><div className="mb-6 flex items-center justify-between gap-4"><p aria-live="polite" className="text-sm text-ink/55"><strong className="text-ink">{visible.length}</strong> {visible.length === 1 ? "project" : "projects"}</p>{filtered && <button type="button" onClick={reset} className="text-sm font-bold text-wine underline decoration-wine/25">Reset filters</button>}</div>{visible.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{visible.map((project, index) => <ProjectCard project={project} key={project.slug} priority={index < 3}/>)}</div> : <div className="grid min-h-72 place-items-center rounded-sm border border-dashed border-black/15 bg-white px-6 text-center"><div className="max-w-md"><span className="mx-auto grid size-12 place-items-center rounded-full bg-paper text-wine"><Search size={21}/></span><h2 className="display mt-5 text-3xl">No matching projects</h2><p className="mt-3 text-sm leading-6 text-ink/55">Try a different search or return to all project categories.</p><button type="button" onClick={reset} className="mt-5 min-h-11 rounded-sm bg-wine px-5 text-sm font-bold text-white hover:bg-wine-dark">Show all projects</button></div></div>}</>;
}
