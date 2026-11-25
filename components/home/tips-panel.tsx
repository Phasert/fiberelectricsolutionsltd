"use client";

import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { PublicTip } from "@/types/content";

export function TipsPanel({ tips }: { tips: PublicTip[] }) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const tipsPerSlide = 4;
  const slideCount = Math.ceil(tips.length / tipsPerSlide);
  const currentSlide = Math.min(slide, Math.max(0, slideCount - 1));
  const start = currentSlide * tipsPerSlide;
  const visibleTips = tips.slice(start, start + tipsPerSlide);

  useEffect(() => {
    if (slideCount < 2 || paused) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setTimeout(() => {
      if (!motion.matches) setSlide((currentSlide + 1) % slideCount);
    }, 7000);
    return () => window.clearTimeout(timer);
  }, [currentSlide, paused, slideCount]);

  return <div className="grid overflow-hidden border border-white/10 lg:grid-cols-[.72fr_1.28fr]"><div className="relative overflow-hidden bg-wine p-8 text-white sm:p-12"><div className="absolute -bottom-20 -right-20 size-64 rounded-full border-[42px] border-white/5"/><p className="text-xs font-black uppercase tracking-[.16em] text-white/60">Practical guidance</p><h2 className="display mt-4 text-5xl">Do&apos;s &amp;<br/>don&apos;ts</h2><p className="mt-6 max-w-sm text-sm leading-6 text-white/68">Approved practical guidance from FES before work begins.</p>{slideCount > 1 && (
      <div className="relative mt-8 flex items-center gap-3">
        <button type="button" aria-label="Previous tips" onClick={() => setSlide((currentSlide - 1 + slideCount) % slideCount)} className="grid size-11 place-items-center rounded-full border border-white/40 hover:bg-white/15"><ChevronLeft size={20} aria-hidden="true"/></button>
        <span role="status" className="text-sm tabular-nums">Slide {currentSlide + 1} of {slideCount}</span>
        <button type="button" aria-label="Next tips" onClick={() => setSlide((currentSlide + 1) % slideCount)} className="grid size-11 place-items-center rounded-full border border-white/40 hover:bg-white/15"><ChevronRight size={20} aria-hidden="true"/></button>
        <button type="button" onClick={() => setPaused(value => !value)} className="min-h-11 px-2 text-sm underline">{paused ? "Resume" : "Pause"}</button>
      </div>
    )}</div><div className="grid content-start divide-y divide-white/10">{tips.length ? visibleTips.map((tip) => <article key={tip.id} className="grid gap-5 p-7 transition-colors hover:bg-white/[.035] sm:grid-cols-[3rem_1fr] sm:p-9"><span className={`grid size-11 place-items-center rounded-full border ${tip.type === "do" ? "border-[#ef91a6]/45 bg-[#ef91a6]/10 text-[#ef91a6]" : "border-white/15 bg-white/5 text-white/45"}`}>{tip.type === "do" ? <Check size={19} aria-hidden="true"/> : <X size={19} aria-hidden="true"/>}</span><div><p className={`text-[.65rem] font-black uppercase tracking-[.18em] ${tip.type === "do" ? "text-[#ef91a6]" : "text-white/38"}`}>{tip.type === "do" ? "Do" : "Don’t"}</p><h3 className="mt-2 text-lg font-bold text-white">{tip.title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{tip.body}</p></div></article>) : <div className="grid min-h-64 place-items-center p-8 text-center"><div><h3 className="display text-3xl text-white">Guidance is being prepared.</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55">Approved tips will appear here when they are enabled for the homepage.</p></div></div>}</div></div>;
}
