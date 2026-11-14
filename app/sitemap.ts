import type {MetadataRoute}from"next";
import {listPublicProjects}from"@/lib/projects/public-repository";
import {listPublicResources}from"@/lib/resources/public-repository";
import {siteUrl}from"@/lib/site-config";

const staticPaths=["","/electrical","/fiber-optic","/projects","/about","/resources","/contact","/request-a-quote"];
const hasFirebaseProject=()=>Boolean(process.env.FIREBASE_PROJECT_ID||process.env.GCLOUD_PROJECT||process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 let paths=[...staticPaths];
 if(hasFirebaseProject()){
  const[projects,resources]=await Promise.all([listPublicProjects(),listPublicResources()]);
  paths=[...paths,...projects.map(project=>`/projects/${project.slug}`),...resources.articles.map(article=>`/resources/${article.slug}`)];
 }
 return paths.map(url=>({url:`${siteUrl}${url}`,changeFrequency:url===""?"monthly":"yearly",priority:url===""?1:.7}));
}
