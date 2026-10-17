import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";
import { ProjectFilter } from "@/components/projects/project-filter";
import { projects } from "@/data/content";
import { getPublishedProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore published electrical and fiber optic projects from Fiber & Electric Solutions Ltd. in Trinidad & Tobago.",
};

export default function ProjectsPage() {
  const publishedProjects = getPublishedProjects(projects);
  return <>
    <section className="hero-grid grain relative overflow-hidden bg-ink text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgb(125_16_40/.48),transparent_31%),linear-gradient(115deg,#141315_25%,#211f21)]"/><div className="shell relative py-20 sm:py-28 lg:py-32"><div className="max-w-4xl"><p className="eyebrow !text-[#ef91a6]">Projects · Electrical + Fiber Optic</p><h1 className="display mt-7 text-[clamp(3.6rem,8vw,7rem)]">Our Work.<br/><span className="text-[#d83f62]">Our Expertise.</span></h1><p className="mt-7 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">Explore published project stories that show how FES approaches electrical and fiber optic requirements across Trinidad &amp; Tobago.</p></div><div className="mt-12 h-px max-w-xl bg-gradient-to-r from-[#d83f62] to-transparent"/></div></section>
    <section className="section-pad"><div className="shell"><div className="mb-10 grid gap-5 border-b border-black/10 pb-8 md:grid-cols-[1fr_auto] md:items-end"><div><p className="eyebrow">Project portfolio</p><h2 className="display mt-4 text-4xl sm:text-5xl">Built to power. Built to connect.</h2></div>{publishedProjects.length > 0 && <p className="max-w-sm text-sm leading-6 text-ink/55">Search by project name or description, then narrow the portfolio by service category.</p>}</div>
      {publishedProjects.length > 0 ? <>{publishedProjects.some(project => project.demo) && <div className="mb-6 border-l-4 border-wine bg-white px-5 py-4 text-sm leading-6 text-ink/60"><strong className="text-ink">Portfolio preview:</strong> Items marked Demo use sample content and illustrations to demonstrate the layout. They are not completed FES projects.</div>}<ProjectFilter projects={publishedProjects}/></> : <div className="relative overflow-hidden rounded-sm border border-black/10 bg-white px-6 py-16 text-center shadow-[0_22px_60px_rgb(20_19_21/.07)] sm:px-12 sm:py-20"><div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-wine via-[#cc3657] to-wine"/><span className="mx-auto grid size-14 place-items-center rounded-full bg-paper text-wine"><Images size={25} aria-hidden="true"/></span><h2 className="display mt-6 text-3xl sm:text-4xl">Project stories are being prepared.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink/58">FES will publish completed project details and approved photography here as they become available. In the meantime, explore our service capabilities or share your requirements with the team.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/electrical" className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-wine/20 px-5 text-sm font-bold text-wine hover:bg-paper">Electrical services</Link><Link href="/fiber-optic" className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-wine/20 px-5 text-sm font-bold text-wine hover:bg-paper">Fiber optic services</Link><Link href="/request-a-quote" className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-wine px-5 text-sm font-bold text-white hover:bg-wine-dark">Request a quote <ArrowRight size={16} aria-hidden="true"/></Link></div></div>}
    </div></section>
  </>;
}
