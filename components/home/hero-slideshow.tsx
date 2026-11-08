"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Cable, MapPin, Pause, Play, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export interface HeroSlide {
  id: string;
  src: string;
  alt: string;
  focalPoint: { x: number; y: number };
  headline: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  sources?: { sm: string; md: string; lg: string };
}

export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const count = slides.length;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const show = useCallback((index: number) => setActive((index + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused || interacting || reducedMotion) return;
    const timer = window.setTimeout(() => show(active + 1), 7000);
    return () => window.clearTimeout(timer);
  }, [active, count, interacting, paused, reducedMotion, show]);

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
  };

  return <section
    className="hero-cinematic relative isolate overflow-hidden bg-ink text-white"
    aria-roledescription="carousel"
    aria-label="Featured FES services"
    onMouseEnter={() => setInteracting(true)}
    onMouseLeave={() => setInteracting(false)}
    onFocusCapture={() => setInteracting(true)}
    onBlurCapture={handleBlur}
  >
    <div className="absolute inset-0 bg-charcoal">
      {slides.map((slide, index) => <HeroImage key={slide.id} slide={slide} active={index === active} priority={index === 0} />)}
    </div>
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,9,10,.96)_0%,rgba(20,8,12,.88)_36%,rgba(10,9,10,.45)_66%,rgba(10,9,10,.2)_100%)] max-lg:bg-[linear-gradient(90deg,rgba(11,9,10,.94)_0%,rgba(12,10,11,.7)_70%,rgba(12,10,11,.45)_100%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,7,8,.48),transparent_38%)]" />
    <div className="shell relative flex min-h-[clamp(31rem,43vw,38.5rem)] items-center py-12 sm:py-14 lg:py-16">
      <div className="w-full max-w-[42rem]" aria-live="polite" aria-atomic="true">
        <p className="eyebrow !text-[#ef91a6]">Electrical + fiber infrastructure</p>
        <div key={slides[active].id} className="hero-copy-enter">
          <h1 className="display mt-5 max-w-[13ch] text-[clamp(2.25rem,4.2vw,3.625rem)] leading-[.98]">{slides[active].headline}</h1>
          <p className="mt-5 max-w-[39rem] text-[clamp(.95rem,1.35vw,1.0625rem)] leading-7 text-white/76">{slides[active].description}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={slides[active].ctaHref} className="inline-flex min-h-12 items-center justify-center gap-2 bg-wine px-5 py-3 text-sm font-bold text-white transition hover:bg-wine-dark">{slides[active].ctaLabel}<ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href="/projects" className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/40 px-5 py-3 text-sm font-bold text-white transition hover:border-white hover:bg-white/10">View our work<ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-white/18 pt-5">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => show(active - 1)} className="grid size-10 place-items-center rounded-full border border-white/30 bg-black/30 transition hover:border-white hover:bg-wine" aria-label="Previous slide"><ArrowLeft size={17} /></button>
            <button type="button" onClick={() => show(active + 1)} className="grid size-10 place-items-center rounded-full border border-white/30 bg-black/30 transition hover:border-white hover:bg-wine" aria-label="Next slide"><ArrowRight size={17} /></button>
            <button type="button" onClick={() => setPaused((value) => !value)} className="grid size-10 place-items-center rounded-full border border-white/30 bg-black/30 transition hover:border-white hover:bg-wine" aria-label={paused ? "Resume automatic slides" : "Pause automatic slides"}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>
          </div>
          <div className="flex items-center gap-2" aria-label={`Slide ${active + 1} of ${count}`}>
            {slides.map((slide, index) => <button key={slide.id} type="button" onClick={() => show(index)} className={`h-1 rounded-full transition-all ${index === active ? "w-10 bg-white" : "w-5 bg-white/35 hover:bg-white/65"}`} aria-label={`Show slide ${index + 1}: ${slide.headline}`} aria-current={index === active ? "true" : undefined} />)}
          </div>
          <p className="ml-auto hidden items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-white/55 sm:flex"><MapPin size={14} className="text-[#ef91a6]" /> Trinidad &amp; Tobago</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[.68rem] font-black uppercase tracking-[.13em] text-white/45">
          <span className="flex items-center gap-2"><Zap size={13} className="text-[#ef91a6]" /> Electrical</span>
          <span className="flex items-center gap-2"><Cable size={13} className="text-[#ef91a6]" /> Fiber optic</span>
        </div>
      </div>
    </div>
    <p className="absolute bottom-4 right-5 hidden text-[.62rem] font-bold uppercase tracking-[.14em] text-white/45 md:block">Illustrative service imagery</p>
  </section>;
}

function HeroImage({ slide, active, priority }: { slide: HeroSlide; active: boolean; priority: boolean }) {
  const style = { objectPosition: `${slide.focalPoint.x}% ${slide.focalPoint.y}%` };
  const classes = `hero-cinematic-image ${active ? "is-active" : ""}`;
  if (slide.sources) return <picture>
    <source media="(max-width: 639px)" srcSet={slide.sources.sm} />
    <source media="(max-width: 1279px)" srcSet={slide.sources.md} />
    <img src={slide.sources.lg} alt={active ? slide.alt : ""} className={classes} style={style} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" />
  </picture>;
  return <Image src={slide.src} alt={active ? slide.alt : ""} fill unoptimized={slide.src.startsWith("/media/")} preload={priority} loading={priority ? undefined : "lazy"} sizes="100vw" className={classes} style={style} aria-hidden={!active} />;
}
