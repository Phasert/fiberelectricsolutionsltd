import type { MetadataRoute } from "next";
import { articles, projects } from "@/data/content";
export default function sitemap(): MetadataRoute.Sitemap { const base="https://www.fes.co.tt"; const paths=["","/electrical","/fiber-optic","/projects","/about","/resources","/request-a-quote",...projects.map(p=>`/projects/${p.slug}`),...articles.map(a=>`/resources/${a.slug}`)]; return paths.map(url=>({url:`${base}${url}`,changeFrequency:url===""?"monthly":"yearly",priority:url===""?1:.7})); }
