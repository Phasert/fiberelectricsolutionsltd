import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { ArticleCard } from "@/components/resources/resources-hub";
import { RichText } from "@/components/resources/rich-text";
import { getPublicArticleBySlug, listPublicResources } from "@/lib/resources/public-repository";
import { formatResourceDate } from "@/lib/resources/format-date";
import { siteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export async function generateMetadata({params}:PageProps<"/resources/[slug]">):Promise<Metadata>{const {slug}=await params;const article=await getPublicArticleBySlug(slug);if(!article)return {title:"Resource not found",robots:{index:false,follow:false}};const canonical=`${siteUrl}/resources/${article.slug}`;return {title:article.title,description:article.summary,alternates:{canonical},openGraph:{type:"article",title:article.title,description:article.summary,url:canonical,publishedTime:article.publishedAt,images:[{url:new URL(article.featuredImage,siteUrl).toString(),alt:article.featuredImageAlt}]}};}

export default async function ArticlePage({params}:PageProps<"/resources/[slug]">){
  const {slug}=await params;const article=await getPublicArticleBySlug(slug);if(!article)notFound();
  const related=(await listPublicResources()).articles.filter(item=>item.slug!==article.slug).sort((a,b)=>Number(b.category===article.category)-Number(a.category===article.category)).slice(0,3);
  const canonical=`${siteUrl}/resources/${article.slug}`;
  const structuredData={"@context":"https://schema.org","@type":"Article",headline:article.title,description:article.summary,datePublished:article.publishedAt,image:new URL(article.featuredImage,siteUrl).toString(),publisher:{"@type":"Organization",name:"Fiber & Electric Solutions Ltd."},mainEntityOfPage:canonical};
  return <>
    {structuredData&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,"\\u003c")}}/>}
    <article><header className="bg-ink text-white"><div className="shell max-w-5xl py-16 sm:py-24"><Link href="/resources" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white/65 hover:text-white"><ArrowLeft size={17}/> Back to Resources</Link><div className="mt-10 max-w-4xl"><p className="text-xs font-black uppercase tracking-[.16em] text-[#db8298]">{article.category}</p><h1 className="display mt-5 text-5xl sm:text-7xl">{article.title}</h1><p className="mt-7 max-w-3xl text-lg leading-8 text-white/65">{article.summary}</p><div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-white/45">{article.publishedAt&&<time dateTime={article.publishedAt}>{formatResourceDate(article.publishedAt)}</time>}<span>{article.readingTime}</span></div></div></div></header>
      <div className="shell relative -mt-px aspect-[16/7] max-h-[38rem] min-h-64 overflow-hidden bg-charcoal"><Image src={article.featuredImage} alt={article.featuredImageAlt} fill priority unoptimized={article.featuredImage.startsWith("/media/")} sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover"/></div>
      <div className="shell max-w-3xl py-16 sm:py-24"><RichText document={article.content}/><div className="mt-14 border-t border-black/10 pt-8"><ButtonLink href="/request-a-quote">Request a quote</ButtonLink></div></div>
    </article>
    {related.length>0&&<section className="border-t border-black/10 bg-white py-16 sm:py-24"><div className="shell"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Continue reading</p><h2 className="display mt-4 text-4xl sm:text-5xl">Related articles.</h2></div><Link href="/resources" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-wine">View all resources <ArrowRight size={17}/></Link></div><div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{related.map(item=><ArticleCard key={item.slug} article={item}/>)}</div></div></section>}
  </>;
}
