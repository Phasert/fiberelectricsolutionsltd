import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { ServiceGrid } from "@/components/services/service-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button-link";
import { fiberServices, projects } from "@/data/content";
import { ProjectCard } from "@/components/projects/project-card";
export const metadata: Metadata = { title: "Fiber Optic Services", description: "Fiber cable installation, splicing, testing and consulting from FES." };
export default function FiberPage(){ return <><PageHero eyebrow="Fiber optic services" title="Clean connections. Clear fiber outcomes." accent="fiber" body="FES provides fiber cable installation, splicing, testing and consulting for approved project scopes."/><section className="section-pad"><div className="shell"><SectionHeading eyebrow="Fiber capability" title="From installation through testing."/><div className="mt-12"><ServiceGrid services={fiberServices}/></div></div></section><section className="section-pad bg-ink text-white"><div className="shell grid gap-12 lg:grid-cols-2 lg:items-end"><SectionHeading light eyebrow="Project pathway" title="Infrastructure deserves a closer look." body="Detailed gallery structures are ready for approved fiber project photography and scope information."/><div>{projects.filter(p=>p.category!=="Electrical").slice(0,1).map(p=><ProjectCard key={p.slug} project={p}/>)}</div></div></section><section className="bg-wine py-14 text-white"><div className="shell flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><h2 className="display text-4xl">Plan a fiber requirement.</h2><ButtonLink href="/request-a-quote" variant="light">Request a quote</ButtonLink></div></section></>; }
