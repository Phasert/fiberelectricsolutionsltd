"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Article, ExternalResource } from "@/types/content";

const categories = ["All", "Electrical", "Fiber Optic", "Company Updates", "External Resources"] as const;
type Filter = (typeof categories)[number];

export function ResourcesHub({ articles, externalResources }: { articles: Article[]; externalResources: ExternalResource[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Filter>("All");
  const featured = articles.find(article => article.featured);
  const remaining = featured ? articles.filter(article => article.slug !== featured.slug) : articles;
  const normalized = query.trim().toLowerCase();
  const filteredArticles = useMemo(() => remaining.filter(article => (!normalized || `${article.title} ${article.summary}`.toLowerCase().includes(normalized)) && (category === "All" || (category !== "External Resources" && article.category === category))), [remaining, normalized, category]);
  const filteredExternal = useMemo(() => externalResources.filter(resource => (!normalized || `${resource.title} ${resource.summary}`.toLowerCase().includes(normalized)) && (category === "All" || category === "External Resources" || resource.category === category)), [externalResources, normalized, category]);
  const hasFilters = Boolean(query) || category !== "All";
  const total = filteredArticles.length + filteredExternal.length;
  const visibleTotal = total + (featured && !hasFilters ? 1 : 0);
  const reset = () => { setQuery(""); setCategory("All"); };

  return <>
    {featured && !hasFilters && <FeaturedArticle article={featured} />}
    <section className="section-pad bg-white" aria-labelledby="resource-library-title"><div className="shell">
      <div className="max-w-2xl"><p className="eyebrow">Browse the library</p><h2 id="resource-library-title" className="display mt-5 text-4xl sm:text-5xl">Find the information you need.</h2></div>
      <div className="mt-10 rounded-2xl border border-black/10 bg-paper p-4 sm:p-5" role="search" aria-label="Filter resources">
        <label className="relative block"><span className="sr-only">Search article titles and summaries</span><Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={20}/><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search articles and resources" className="min-h-14 w-full rounded-lg border border-black/10 bg-white pl-12 pr-4 text-base"/></label>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Resource categories">{categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-bold transition-colors ${category === item ? "bg-wine text-white" : "border border-black/10 bg-white text-ink/65 hover:border-wine/40 hover:text-wine"}`}>{item}</button>)}</div>
        <div className="mt-4 flex min-h-7 items-center justify-between gap-4"><p className="text-sm text-ink/50" aria-live="polite">{total} {total === 1 ? "result" : "results"}</p>{hasFilters && <button type="button" onClick={reset} className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-wine"><X size={16}/> Reset filters</button>}</div>
      </div>
      {visibleTotal === 0 ? <div className="mt-10 rounded-2xl border border-dashed border-wine/25 bg-paper/60 px-6 py-16 text-center"><h3 className="display text-3xl">{hasFilters ? "No resources found." : "Resources are being prepared."}</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/55">{hasFilters ? "Try a different search or clear the filters to browse all currently published resources." : "FES will publish approved electrical and fiber-optic guidance here as it becomes available."}</p>{hasFilters && <button type="button" onClick={reset} className="mt-6 min-h-11 rounded-md bg-wine px-5 text-sm font-bold text-white">Clear all filters</button>}</div> : <>
        {filteredArticles.length > 0 && <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filteredArticles.map(article => <ArticleCard key={article.slug} article={article}/>)}</div>}
        {filteredExternal.length > 0 && <section className="mt-16 border-t border-black/10 pt-12" aria-labelledby="external-title"><div className="grid gap-4 md:grid-cols-[.7fr_1fr]"><div><p className="eyebrow">Trusted destinations</p><h3 id="external-title" className="display mt-4 text-4xl">External resources.</h3></div><p className="max-w-xl text-sm leading-7 text-ink/55">Selected links from clearly identified third-party publishers. Each link takes you to the original source.</p></div><div className="mt-8 grid gap-4">{filteredExternal.map(resource => <a key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer" className="group grid gap-5 rounded-xl border border-black/10 bg-paper p-6 transition hover:border-wine/30 md:grid-cols-[1fr_1.2fr_auto] md:items-center"><div><p className="text-xs font-black uppercase tracking-[.14em] text-wine">{resource.category}</p><h4 className="mt-2 text-xl font-bold">{resource.title}</h4><p className="mt-2 text-xs font-bold text-ink/45">Published by {resource.source}</p></div><p className="text-sm leading-6 text-ink/55">{resource.summary}</p><span className="inline-flex items-center gap-2 text-sm font-bold text-wine">Visit source <ArrowUpRight size={17}/></span></a>)}</div></section>}
      </>}
    </div></section>
  </>;
}

function FeaturedArticle({ article }: { article: Article }) { return <section className="bg-paper py-14 sm:py-20"><div className="shell"><div className="overflow-hidden rounded-2xl bg-ink text-white lg:grid lg:grid-cols-2">{article.featuredImage && <div className="relative min-h-72 lg:min-h-[28rem]"><Image src={article.featuredImage} alt={article.featuredImageAlt || ""} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority/></div>}<div className="flex flex-col justify-center p-7 sm:p-12"><p className="text-xs font-black uppercase tracking-[.16em] text-[#db8298]">Featured · {article.category}</p><h2 className="display mt-5 text-4xl sm:text-5xl">{article.title}</h2><p className="mt-5 max-w-xl text-base leading-7 text-white/65">{article.summary}</p><div className="mt-8"><Link href={`/resources/${article.slug}`} className="inline-flex min-h-12 items-center gap-2 bg-white px-5 text-sm font-bold text-ink">Read article <ArrowUpRight size={17}/></Link></div></div></div></div></section> }

export function ArticleCard({ article }: { article: Article }) { return <article className="group overflow-hidden rounded-xl border border-black/10 bg-paper transition duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:transform-none">{article.featuredImage ? <Link href={`/resources/${article.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-ink"><Image src={article.featuredImage} alt={article.featuredImageAlt || ""} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transform-none"/></Link> : <div className="resource-art resource-art-1"><span aria-hidden="true">FES</span></div>}<div className="p-6"><p className="text-xs font-black uppercase tracking-[.14em] text-wine">{article.category}</p><h3 className="mt-4 text-2xl font-bold leading-tight"><Link href={`/resources/${article.slug}`}>{article.title}</Link></h3><p className="mt-3 text-sm leading-6 text-ink/55">{article.summary}</p><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4"><p className="text-xs font-bold text-ink/40">{article.publishedAt && <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>}{article.publishedAt && article.readingTime && " · "}{article.readingTime}</p><Link href={`/resources/${article.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-wine">Read article <ArrowUpRight size={16}/></Link></div></div></article> }

export function formatDate(value: string) { return new Intl.DateTimeFormat("en-TT", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
