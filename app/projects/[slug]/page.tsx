import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectGallery } from "@/components/projects/project-gallery";
import { categoryLabel } from "@/lib/projects";
import { getPublicProjectBySlug, listPublicProjects } from "@/lib/projects/public-repository";
import { siteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  if (!project) return { title: "Project not found", robots: { index: false, follow: false } };
  const canonical = `${siteUrl}/projects/${project.slug}`;
  return { title: project.title, ...(project.summary?{description:project.summary}:{}), alternates: { canonical }, openGraph: { title: project.title, ...(project.summary?{description:project.summary}:{}), url: canonical, images: [new URL(project.featuredImage, siteUrl).toString()] } };
}

export default async function ProjectDetail({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  if (!project) notFound();
  const images = project.gallery;
  const related = (await listPublicProjects()).filter(item => item.slug !== project.slug).toSorted((a, b) => Number(b.category === project.category) - Number(a.category === project.category)).slice(0, 3);

  return <>
    <section className="relative overflow-hidden bg-ink text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgb(125_16_40/.4),transparent_30%)]"/><div className="shell relative py-6"><Link href="/projects" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft size={17}/> Back to projects</Link></div><div className="shell relative grid gap-10 pb-16 pt-7 lg:grid-cols-[.82fr_1.18fr] lg:items-end lg:pb-24"><div className="pb-2"><p className="eyebrow !text-[#ef91a6]">{categoryLabel(project.category)} project</p><h1 className="display mt-6 text-[clamp(3.4rem,7vw,6.2rem)]">{project.title}</h1>{project.summary&&<p className="mt-6 max-w-xl text-lg leading-8 text-white/66">{project.summary}</p>}<dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-sm text-white/68">{project.location && <div className="flex items-center gap-2"><MapPin size={17} className="text-[#ef91a6]"/><dt className="sr-only">Location</dt><dd>{project.location}</dd></div>}{project.period && <div className="flex items-center gap-2"><CalendarDays size={17} className="text-[#ef91a6]"/><dt className="sr-only">Completion period</dt><dd>{project.period}</dd></div>}</dl></div><div className="relative aspect-[16/11] overflow-hidden border border-white/10 bg-charcoal shadow-2xl"><Image src={project.featuredImage} alt={project.featuredImageAlt} fill priority unoptimized={project.featuredImage.startsWith("/media/")} sizes="(max-width: 1024px) 100vw, 58vw" className={project.featuredImageFit==="contain"?"object-contain":"object-cover"}/></div></div></section>
    {(project.description||project.summary)&&<section className="section-pad"><div className="shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-20"><article><p className="eyebrow">Project overview</p><h2 className="display mt-5 text-4xl sm:text-5xl">The work at a glance.</h2><div className="mt-7 space-y-5 text-base leading-8 text-ink/65">{project.description ? project.description.split("\n").filter(Boolean).map(paragraph => <p key={paragraph}>{paragraph}</p>) : <p>{project.summary}</p>}</div></article><aside className="h-fit border-t-4 border-wine bg-white p-6 shadow-[0_18px_45px_rgb(20_19_21/.07)]"><p className="text-xs font-black uppercase tracking-[.14em] text-wine">Project details</p><dl className="mt-5 grid gap-5 text-sm"><div><dt className="text-ink/42">Service category</dt><dd className="mt-1 font-bold">{categoryLabel(project.category)}</dd></div>{project.location && <div><dt className="text-ink/42">Location</dt><dd className="mt-1 font-bold">{project.location}</dd></div>}{project.period && <div><dt className="text-ink/42">Completion</dt><dd className="mt-1 font-bold">{project.period}</dd></div>}</dl></aside></div></section>}
    {images.length > 0 && <section className="section-pad"><div className="shell"><div className="mb-10 max-w-2xl"><p className="eyebrow">Project gallery</p><h2 className="display mt-5 text-4xl sm:text-5xl">A closer look at the work.</h2></div><ProjectGallery images={images} title={project.title}/></div></section>}
    {related.length > 0 && <section className="section-pad bg-white"><div className="shell"><div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">More from FES</p><h2 className="display mt-5 text-4xl sm:text-5xl">Related projects.</h2></div><Link href="/projects" className="inline-flex items-center gap-2 text-sm font-bold text-wine">View all projects <ArrowRight size={16}/></Link></div><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{related.map(item => <ProjectCard key={item.slug} project={item}/>)}</div></div></section>}
    <section className="relative overflow-hidden bg-wine text-white"><div className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(135deg,transparent_45%,rgb(255_255_255/.06)_45%)]"/><div className="shell relative flex flex-col justify-between gap-8 py-16 md:flex-row md:items-center"><div><p className="text-xs font-black uppercase tracking-[.16em] text-white/60">Have a project in mind?</p><h2 className="display mt-3 text-4xl sm:text-5xl">Tell us what your site needs.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-white/70">Share your electrical or fiber optic requirements through the existing quote request form.</p></div><Link href="/request-a-quote" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-sm bg-white px-6 text-sm font-bold text-wine hover:bg-paper">Request a quote <ArrowRight size={17}/></Link></div></section>
  </>;
}
