import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPublicProjectBySlug } from "@/lib/projects/public-repository";
import { siteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  if (!project) return { title: "Project not found", robots: { index: false, follow: false } };
  return { title: project.title, description: `View approved ${project.category === "Fiber" ? "fiber optic" : "electrical"} project photography from Fiber & Electric Solutions Ltd.`, alternates: { canonical: `${siteUrl}/projects` }, robots: { index: false, follow: true } };
}

export default async function LegacyProjectRoute({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  if (!await getPublicProjectBySlug(slug)) notFound();
  redirect("/projects");
}
