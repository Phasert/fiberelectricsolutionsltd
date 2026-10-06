"use client";

import { useState } from "react";
import type { Project, ProjectCategory } from "@/types/content";
import { ProjectCard } from "./project-card";

const filters: ("All" | ProjectCategory)[] = ["All", "Electrical", "Fiber", "Combined"];
export function ProjectFilter({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const visible = active === "All" ? projects : projects.filter(p => p.category === active);
  return <><div className="mb-9 flex flex-wrap gap-2" role="group" aria-label="Filter projects">{filters.map(filter => <button key={filter} onClick={() => setActive(filter)} aria-pressed={active === filter} className={`min-h-11 px-5 text-xs font-black uppercase tracking-wider transition-colors ${active === filter ? "bg-wine text-white" : "border border-black/15 bg-transparent hover:border-wine"}`}>{filter}</button>)}</div><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{visible.map(project => <ProjectCard project={project} key={project.slug}/>)}</div></>;
}
