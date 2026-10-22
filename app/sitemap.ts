import type { MetadataRoute } from "next";
import { listPublicProjects } from "@/lib/projects/public-repository";
import { listPublicResources } from "@/lib/resources/public-repository";
import { siteUrl } from "@/lib/site-config";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const [projects,resources]=await Promise.all([listPublicProjects(),listPublicResources()]); const paths=["","/electrical","/fiber-optic","/projects","/about","/resources","/contact","/request-a-quote",...projects.map(p=>`/projects/${p.slug}`),...resources.articles.map(a=>`/resources/${a.slug}`)]; return paths.map(url=>({url:`${siteUrl}${url}`,changeFrequency:url===""?"monthly":"yearly",priority:url===""?1:.7})); }
