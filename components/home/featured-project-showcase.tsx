import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MediaSlideshow, type PublicSlide } from "@/components/home/media-slideshow";
import type { PublicProject } from "@/types/content";

export function FeaturedProjectShowcase({project,slides}:{project:PublicProject;slides:PublicSlide[]}){
  const fallback=slides[0]??{id:"featured-fallback",src:project.featuredImage,alt:project.featuredImageAlt,focalPoint:{x:50,y:50}};
  return <article className="mt-12 grid overflow-hidden border border-black/10 bg-ink text-white shadow-[0_22px_60px_rgb(20_19_21/.12)] lg:grid-cols-[1.15fr_.85fr]">
    <div className="relative min-h-[34rem] bg-charcoal sm:min-h-[42rem]"><MediaSlideshow slides={slides} fallback={fallback} priority sizes="(max-width: 1024px) 100vw, 58vw" label={`${project.title} featured photographs`} controlsClassName="bottom-5 right-5 sm:bottom-7 sm:right-7" fit="contain"/></div>
    <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14"><p className="text-xs font-black uppercase tracking-[.18em] text-[#ef91a6]">{project.category === "Fiber" ? "Fiber Optic" : project.category} project</p><h3 className="display mt-5 text-4xl sm:text-5xl">{project.title}</h3><p className="mt-6 text-sm leading-7 text-white/65">Explore the curated project gallery.</p><Link href={`/projects/${project.slug}`} className="mt-9 inline-flex min-h-12 w-fit items-center gap-3 bg-wine px-6 text-sm font-bold text-white hover:bg-wine-dark">View project <ArrowUpRight size={17} aria-hidden="true"/></Link></div>
  </article>;
}
