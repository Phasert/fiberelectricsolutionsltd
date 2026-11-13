"use client";

import { useMemo, useState } from "react";
import { ProjectGallery } from "@/components/projects/project-gallery";
import type { PublicProject, ProjectImage } from "@/types/content";

type Filter = "All" | "Electrical" | "Fiber";

export function PortfolioGallery({ projects }: { projects: PublicProject[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const images = useMemo(() => projects.flatMap((project) => {
    if (filter !== "All" && project.category !== filter && project.category !== "Combined") return [];
    return project.gallery.map((image): ProjectImage => ({ ...image, caption: undefined }));
  }), [filter, projects]);

  return <div>
    <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter portfolio photos">
      {(["All", "Electrical", "Fiber"] as const).map((option) => <button key={option} type="button" aria-pressed={filter === option} onClick={() => setFilter(option)} className={`min-h-11 rounded-full border px-5 text-sm font-bold transition ${filter === option ? "border-wine bg-wine text-white" : "border-black/12 bg-white text-ink/65 hover:border-wine/40 hover:text-wine"}`}>{option === "Fiber" ? "Fiber Optic" : option}</button>)}
    </div>
    {images.length ? <ProjectGallery images={images} title={filter === "All" ? "FES project portfolio" : `${filter === "Fiber" ? "Fiber Optic" : filter} portfolio`}/> : <div className="rounded-sm border border-dashed border-black/15 bg-white px-6 py-16 text-center"><h2 className="display text-3xl">Photos are being prepared.</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-ink/55">Published {filter === "Fiber" ? "fiber optic" : filter.toLowerCase()} work will appear here.</p></div>}
  </div>;
}
