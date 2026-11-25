import { formatFibreText } from "@/lib/site-content/spelling";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { ProjectGallery } from "@/components/projects/project-gallery";
import { getPublicProjectBySlug } from "@/lib/projects/public-repository";
import { siteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  if (!project) return { title: "Project not found", robots: { index: false, follow: false } };
  const canonical = `${siteUrl}/projects/${project.slug}`;
  const description = project.summary || `View ${formatFibreText(project.category.toLowerCase())} project work completed by Fiber & Electric Solutions Ltd. in Trinidad & Tobago.`;
  return { title: project.title, description, alternates: { canonical }, openGraph: { type: "article", title: project.title, description, url: canonical, images: [{ url: new URL(project.featuredImage, siteUrl).toString(), alt: project.featuredImageAlt }] } };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  if (!project) notFound();
  const canonical = `${siteUrl}/projects/${project.slug}`;
  const structuredData = { "@context": "https://schema.org", "@type": "CreativeWork", name: project.title, description: project.summary || `${formatFibreText(project.category)} project completed by Fiber & Electric Solutions Ltd.`, url: canonical, image: new URL(project.featuredImage, siteUrl).toString(), ...(project.location ? { contentLocation: { "@type": "Place", name: project.location } } : {}), ...(project.publishedAt ? { datePublished: project.publishedAt } : {}), ...(project.updatedAt ? { dateModified: project.updatedAt } : {}), creator: { "@type": "Organization", "@id": `${siteUrl}/#business`, name: "Fiber & Electric Solutions Ltd." } };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <header className="relative overflow-hidden bg-ink text-white"><div className="absolute inset-0 opacity-25"><Image src={project.featuredImage} alt="" fill priority unoptimized={project.featuredImage.startsWith("/media/")} className="object-cover" sizes="100vw" /></div><div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/95 to-ink/55"/><div className="shell relative py-16 sm:py-24"><Link href="/projects" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft size={17}/> Back to projects</Link><p className="eyebrow mt-10 !text-[#ef91a6]">{project.category} project</p><h1 className="display mt-5 max-w-4xl text-5xl sm:text-7xl">{project.title}</h1>{project.summary&&<p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">{project.summary}</p>}<div className="mt-6 flex flex-wrap gap-5 text-sm font-bold text-white/55">{project.location&&<span className="flex items-center gap-2"><MapPin size={16}/>{project.location}</span>}{project.period&&<span>{project.period}</span>}</div></div></header>
    <section className="section-pad"><div className="shell">{project.description&&<p className="mb-10 max-w-3xl text-base leading-8 text-ink/65">{project.description}</p>}<ProjectGallery images={project.gallery} title={project.title}/></div></section>
  </>;
}
