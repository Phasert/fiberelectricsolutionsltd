import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Cable, MapPin, Zap } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/projects/project-card";
import { aboutContent, electricalServices, fiberServices, projects } from "@/data/content";

export const metadata: Metadata = {
  title: "About Fiber & Electric Solutions Ltd.",
  description: "Learn about FES electrical and fiber-optic services for commercial and industrial requirements in Trinidad and Tobago.",
};

const approvedProjects = projects.filter((project) => project.status === "approved");

export default function AboutPage() {
  const { hero, introduction, capabilities, closing } = aboutContent;

  return <>
    <section className="hero-grid grain relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgb(125_16_40/.5),transparent_32%),linear-gradient(100deg,#0d0c0d_30%,rgb(13_12_13/.72)_62%,rgb(13_12_13/.2))]" />
      <div className="shell relative grid min-h-[min(48rem,calc(100svh-var(--nav-height)))] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
        <div className="relative z-10 max-w-3xl">
          <p className="eyebrow !text-[#ef91a6]">{hero.eyebrow}</p>
          <h1 className="display mt-7 text-[clamp(3.5rem,8vw,7rem)]">Powering the work.<br/><span className="text-[#dc496b]">Connecting what matters.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/72">{hero.description}</p>
          <div className="mt-9 flex flex-wrap gap-3"><ButtonLink href="/request-a-quote">Request a quote</ButtonLink><ButtonLink href="#capabilities" variant="outline">Explore our services</ButtonLink></div>
          <div className="mt-12 flex items-center gap-3 border-t border-white/15 pt-6 text-xs font-black uppercase tracking-[.14em] text-white/58"><MapPin size={16} className="text-[#ef91a6]" aria-hidden="true"/>Trinidad &amp; Tobago</div>
        </div>
        <div className="hero-visual relative mx-auto w-full max-w-[34rem] lg:ml-auto">
          <div className="relative aspect-[4/4.65] overflow-hidden border border-white/15 bg-charcoal shadow-2xl"><Image src={hero.image} alt={hero.imageAlt} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover"/><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent p-7 pt-28"><p className="text-[.65rem] font-black uppercase tracking-[.18em] text-[#ef91a6]">Electrical + fiber optic</p><p className="mt-2 max-w-sm text-sm leading-6 text-white/65">Technical service illustration—not project photography.</p></div></div>
          <div className="absolute -bottom-4 -left-3 flex h-24 w-24 items-center justify-center bg-wine text-center text-[.62rem] font-black uppercase leading-4 tracking-[.13em] text-white shadow-xl sm:-left-8 sm:h-28 sm:w-28">Local<br/>focus</div>
        </div>
      </div>
      <div className="h-1 bg-[linear-gradient(90deg,#fff_0_33.33%,#141315_33.33%_66.66%,#b5193d_66.66%)]" />
    </section>

    <section className="section-pad overflow-hidden">
      <div className="shell grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-20">
        <div className="reveal"><SectionHeading eyebrow={introduction.eyebrow} title={introduction.title}/></div>
        <div className="reveal lg:pt-8"><div className="space-y-6 text-lg leading-8 text-ink/68">{introduction.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><div className="mt-9 flex flex-wrap gap-3"><ButtonLink href="/electrical" variant="outline">Electrical services</ButtonLink><ButtonLink href="/fiber-optic" variant="outline">Fiber-optic services</ButtonLink></div></div>
      </div>
    </section>

    <section id="capabilities" className="section-pad scroll-mt-24 bg-white">
      <div className="shell"><SectionHeading eyebrow={capabilities.eyebrow} title={capabilities.title} body={capabilities.description}/><div className="mt-12 grid gap-6 lg:grid-cols-2"><CapabilityCard number="01" title="Electrical Services" href="/electrical" description="Commercial and industrial installation capability spanning electrical systems, data wiring and approved equipment requirements." image="/images/electrical-services.svg" imageAlt="Illustration of electrical distribution equipment" items={electricalServices.slice(0, 3).map((service) => service.title)} icon={<Zap size={22}/>}/><CapabilityCard number="02" title="Fiber Optic Services" href="/fiber-optic" description="Fiber installation, splicing, testing and consulting for infrastructure that needs a dependable connection." image="/images/fiber-services.svg" imageAlt="Illustration of fiber-optic strands and test equipment" items={fiberServices.slice(0, 3).map((service) => service.title)} icon={<Cable size={22}/>}/></div></div>
    </section>

    {approvedProjects.length > 0 && <section className="section-pad"><div className="shell"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><SectionHeading eyebrow="Our work" title="Selected FES projects." body="Approved project stories from across our electrical and fiber-optic work."/><ButtonLink href="/projects">View all projects</ButtonLink></div><div className="mt-12 grid gap-6 lg:grid-cols-3">{approvedProjects.slice(0, 3).map((project, index) => <ProjectCard key={project.slug} project={project} priority={index === 0}/>)}</div></div></section>}

    <section className="relative overflow-hidden bg-wine text-white"><div className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(135deg,transparent_45%,rgb(255_255_255/.07)_45%)]"/><div className="shell relative flex flex-col justify-between gap-10 py-16 md:flex-row md:items-center lg:py-20"><div><p className="text-xs font-black uppercase tracking-[.18em] text-white/60">{closing.eyebrow}</p><h2 className="display mt-4 max-w-2xl text-4xl sm:text-6xl">{closing.title}</h2><p className="mt-5 max-w-xl text-sm leading-6 text-white/70">{closing.description}</p></div><ButtonLink href="/request-a-quote" variant="light">Request a quote</ButtonLink></div></section>
  </>;
}

function CapabilityCard({ number, title, href, description, image, imageAlt, items, icon }: { number: string; title: string; href: string; description: string; image: string; imageAlt: string; items: string[]; icon: React.ReactNode }) {
  return <Link href={href} className="image-zoom card-lift group relative min-h-[36rem] overflow-hidden bg-ink text-white"><Image src={image} alt={imageAlt} fill className="object-cover opacity-48" sizes="(max-width: 1024px) 100vw, 50vw"/><div className="absolute inset-0 bg-gradient-to-t from-black via-black/72 to-black/10"/><div className="relative flex min-h-[36rem] flex-col p-7 sm:p-10"><div className="flex items-center justify-between"><span className="grid size-12 place-items-center border border-white/20 text-[#ef91a6]" aria-hidden="true">{icon}</span><span className="display text-4xl text-white/25">{number}</span></div><div className="mt-auto"><h3 className="display text-4xl sm:text-5xl">{title}</h3><p className="mt-5 max-w-lg text-sm leading-6 text-white/68">{description}</p><ul className="mt-6 flex flex-wrap gap-2">{items.map((item) => <li key={item} className="border border-white/15 bg-black/25 px-3 py-2 text-xs text-white/70">{item}</li>)}</ul><p className="mt-8 flex items-center gap-2 text-sm font-bold">Explore {title.toLowerCase()} <ArrowRight size={17} className="transition-transform group-hover:translate-x-1.5" aria-hidden="true"/></p></div></div></Link>;
}
