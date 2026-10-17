import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { publishedArticles } from "@/data/content";
import { ButtonLink } from "@/components/ui/button-link";
import { ArticleCard, formatDate } from "@/components/resources/resources-hub";

export function generateStaticParams(){ return publishedArticles.map(article=>({slug:article.slug})); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const article=publishedArticles.find(item=>item.slug===slug);if(!article)return {title:"Resource not found",robots:{index:false,follow:false}};return {title:article.title,description:article.summary,openGraph:{type:"article",title:article.title,description:article.summary,publishedTime:article.publishedAt,images:article.featuredImage?[{url:article.featuredImage,alt:article.featuredImageAlt||article.title}]:undefined}};}

export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const article=publishedArticles.find(item=>item.slug===slug);if(!article)notFound();
  const related=publishedArticles.filter(item=>item.slug!==article.slug).sort((a,b)=>Number(b.category===article.category)-Number(a.category===article.category)).slice(0,3);
  const structuredData=article.publishedAt?{"@context":"https://schema.org","@type":"Article",headline:article.title,description:article.summary,datePublished:article.publishedAt,image:article.featuredImage?`https://www.fes.co.tt${article.featuredImage}`:undefined,author:article.author?{"@type":"Person",name:article.author}:undefined,publisher:{"@type":"Organization",name:"Fiber & Electric Solutions Ltd."},mainEntityOfPage:`https://www.fes.co.tt/resources/${article.slug}`}:null;
  return <>
    {structuredData&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,"\\u003c")}}/>}
    <article><header className="bg-ink text-white"><div className="shell max-w-5xl py-16 sm:py-24"><Link href="/resources" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white/65 hover:text-white"><ArrowLeft size={17}/> Back to Resources</Link><div className="mt-10 max-w-4xl"><p className="text-xs font-black uppercase tracking-[.16em] text-[#db8298]">{article.category}</p><h1 className="display mt-5 text-5xl sm:text-7xl">{article.title}</h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/65">{article.summary}</p><div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-white/45">{article.publishedAt&&<time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>}{article.author&&<span>By {article.author}</span>}{article.readingTime&&<span>{article.readingTime}</span>}</div></div></div></header>
      {article.featuredImage&&<div className="shell relative -mt-px aspect-[16/7] max-h-[38rem] min-h-64 overflow-hidden bg-charcoal"><Image src={article.featuredImage} alt={article.featuredImageAlt||""} fill priority sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover"/></div>}
      <div className="shell max-w-3xl py-16 sm:py-24"><div className="resource-prose">{article.content.map((section,index)=><section key={`${section.heading||"section"}-${index}`}>{section.heading&&<h2>{section.heading}</h2>}{section.paragraphs?.map(paragraph=><p key={paragraph}>{paragraph}</p>)}{section.list&&<ul>{section.list.map(item=><li key={item}>{item}</li>)}</ul>}{section.quote&&<blockquote>{section.quote}</blockquote>}</section>)}</div><div className="mt-14 border-t border-black/10 pt-8"><ButtonLink href="/request-a-quote">Request a quote</ButtonLink></div></div>
    </article>
    {related.length>0&&<section className="border-t border-black/10 bg-white py-16 sm:py-24"><div className="shell"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Continue reading</p><h2 className="display mt-4 text-4xl sm:text-5xl">Related articles.</h2></div><Link href="/resources" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-wine">View all resources <ArrowRight size={17}/></Link></div><div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{related.map(item=><ArticleCard key={item.slug} article={item}/>)}</div></div></section>}
  </>;
}
