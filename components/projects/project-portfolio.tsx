"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/projects/project-card";
import { categoryLabel } from "@/lib/projects";
import type { PublicProject } from "@/types/content";

type Filter = "All" | "Electrical" | "Fiber";

export function ProjectPortfolio({ projects }: { projects: PublicProject[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const visible = projects.filter((project) => filter === "All" || project.category === filter || project.category === "Combined");
  return <div>
    <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter projects by service">
      {(["All", "Electrical", "Fiber"] as const).map((option) => <button key={option} type="button" aria-pressed={filter === option} onClick={() => setFilter(option)} className={`min-h-11 rounded-full border px-5 text-sm font-bold transition ${filter === option ? "border-wine bg-wine text-white" : "border-black/12 bg-white text-ink/65 hover:border-wine/40 hover:text-wine"}`}>{option === "All" ? "All projects" : categoryLabel(option)}</button>)}
    </div>
    {visible.length
      ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{visible.map((project, index) => <ProjectCard key={project.id} project={project} priority={index === 0}/>)}</div>
      : <div className="rounded-sm border border-dashed border-black/15 bg-white px-6 py-16 text-center"><h2 className="display text-3xl">Projects are being prepared.</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-ink/55">Published {filter === "Fiber" ? "fibre optic" : filter === "Electrical" ? "electrical" : ""} projects will appear here.</p></div>}
  </div>;
}
