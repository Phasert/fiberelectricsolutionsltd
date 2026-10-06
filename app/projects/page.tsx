import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { ProjectFilter } from "@/components/projects/project-filter";
import { projects } from "@/data/content";
export const metadata: Metadata = { title: "Projects", description: "Explore the FES electrical and fiber project portfolio." };
export default function ProjectsPage(){ return <><PageHero eyebrow="Projects / gallery" title="The work, organised by project." accent="work" body="This portfolio is designed for meaningful project stories—not a loose strip of images. Current entries are clearly marked placeholders until FES approves final content."/><section className="section-pad"><div className="shell"><div className="mb-10 max-w-3xl border-l-4 border-wine bg-white p-5 text-sm leading-6 text-ink/60"><strong className="text-ink">Content note:</strong> Titles, locations, summaries and artwork shown here are structural placeholders. No client or project claims are being made.</div><ProjectFilter projects={projects}/></div></section></>; }
