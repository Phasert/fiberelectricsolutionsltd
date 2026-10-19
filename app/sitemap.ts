import type { MetadataRoute } from "next";
import { publishedArticles } from "@/data/content";
import { listPublicProjects } from "@/lib/projects/public-repository";
import { siteUrl } from "@/lib/site-config";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const projects=await listPublicProjects(); const paths=["","/electrical","/fiber-optic","/projects","/about","/resources","/request-a-quote",...projects.map(p=>`/projects/${p.slug}`),...publishedArticles.map(a=>`/resources/${a.slug}`)]; return paths.map(url=>({url:`${siteUrl}${url}`,changeFrequency:url===""?"monthly":"yearly",priority:url===""?1:.7})); }
