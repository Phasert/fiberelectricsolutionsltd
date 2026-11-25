import type { Metadata } from "next";
import { PortfolioGallery } from "@/components/projects/portfolio-gallery";
import { listPublicProjects } from "@/lib/projects/public-repository";
import { siteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse the electrical and fibre optic work portfolio from Fiber & Electric Solutions Ltd. in Trinidad & Tobago.",
  alternates: { canonical: `${siteUrl}/projects` },
};

export default async function ProjectsPage() {
  const publishedProjects=await listPublicProjects();
  return <>
    <section className="hero-grid grain relative overflow-hidden bg-ink text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgb(125_16_40/.48),transparent_31%),linear-gradient(115deg,#141315_25%,#211f21)]"/><div className="shell relative py-20 sm:py-28 lg:py-32"><div className="max-w-4xl"><p className="eyebrow !text-[#ef91a6]">Portfolio · Electrical + Fibre Optic</p><h1 className="display mt-7 text-[clamp(3.6rem,8vw,7rem)]">Work you can<br/><span className="text-[#d83f62]">see for yourself.</span></h1><p className="mt-7 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">Browse approved photographs of completed electrical and fibre optic work across Trinidad &amp; Tobago.</p></div><div className="mt-12 h-px max-w-xl bg-gradient-to-r from-[#d83f62] to-transparent"/></div></section>
    <section className="section-pad"><div className="shell"><div className="mb-10 grid gap-5 border-b border-black/10 pb-8 md:grid-cols-[1fr_auto] md:items-end"><div><p className="eyebrow">Project portfolio</p><h2 className="display mt-4 text-4xl sm:text-5xl">Built to power. Built to connect.</h2></div>{publishedProjects.length > 0 && <p className="max-w-sm text-sm leading-6 text-ink/55">Choose a category, then open any photograph for a full-screen slideshow.</p>}</div>
      <PortfolioGallery projects={publishedProjects}/>
    </div></section>
  </>;
}
