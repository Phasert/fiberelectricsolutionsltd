import type { MetadataRoute } from "next";
import { projects, publishedArticles } from "@/data/content";
import { getPublishedProjects } from "@/lib/projects";
import { siteUrl } from "@/lib/site-config";
export default function sitemap(): MetadataRoute.Sitemap { const paths=["","/electrical","/fiber-optic","/projects","/about","/resources","/request-a-quote",...getPublishedProjects(projects).map(p=>`/projects/${p.slug}`),...publishedArticles.map(a=>`/resources/${a.slug}`)]; return paths.map(url=>({url:`${siteUrl}${url}`,changeFrequency:url===""?"monthly":"yearly",priority:url===""?1:.7})); }
