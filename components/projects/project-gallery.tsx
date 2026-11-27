"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { ProjectImage } from "@/types/content";

export function ProjectGallery({ images, title }: { images: ProjectImage[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const close = useCallback(() => { video.current?.pause(); setActive(null); queueMicrotask(() => opener.current?.focus()); }, []);
  const previous = useCallback(() => { video.current?.pause(); setActive(current => current === null ? null : (current - 1 + images.length) % images.length); }, [images.length]);
  const next = useCallback(() => { video.current?.pause(); setActive(current => current === null ? null : (current + 1) % images.length); }, [images.length]);

  useEffect(() => {
    if (active === null) return;
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); if (event.key === "ArrowLeft" && images.length > 1) previous(); if (event.key === "ArrowRight" && images.length > 1) next(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, close, images.length, next, previous]);

  if (!images.length) return null;
  return <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={`${title} media gallery`}>{images.map((media, index) => <figure key={`${media.src}-${index}`} className={index === 0 ? "sm:col-span-2 lg:row-span-2" : ""}><button type="button" onClick={event => { opener.current=event.currentTarget; setActive(index); }} className={`group relative block w-full overflow-hidden bg-charcoal text-left ${index === 0 ? "aspect-[16/9] lg:h-full lg:min-h-[28rem]" : "aspect-[4/3]"}`} aria-label={`Open ${media.type === "video" ? "video" : "image"} ${index + 1} of ${images.length}: ${media.alt}`}>{media.type === "video" ? <video src={media.src} poster={media.poster} muted playsInline preload="metadata" className="h-full w-full object-contain" aria-hidden="true"/> : <Image src={media.src} alt={media.alt || ""} fill unoptimized={media.src.startsWith("/media/")} sizes={index === 0 ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 640px) 100vw, 33vw"} className="object-contain"/>}<span className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-black/65 text-white backdrop-blur transition group-hover:bg-wine"><Expand size={18} aria-hidden="true"/></span></button>{media.caption && <figcaption className="mt-2 text-sm leading-6 text-ink/55">{media.caption}</figcaption>}</figure>)}</div>
    {active !== null && <div role="dialog" aria-modal="true" aria-label={`${title} media viewer`} onTouchStart={event=>{touchStartX.current=event.changedTouches[0]?.clientX??null}} onTouchEnd={event=>{if(touchStartX.current===null||images.length<2)return;const distance=(event.changedTouches[0]?.clientX??touchStartX.current)-touchStartX.current;touchStartX.current=null;if(Math.abs(distance)>50)(distance>0?previous:next)()}} className="fixed inset-0 z-[100] grid touch-pan-y bg-black/95 p-3 sm:p-6"><button ref={closeButton} type="button" onClick={close} aria-label="Close media viewer" className="absolute right-4 top-4 z-10 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-wine sm:right-6 sm:top-6"><X size={24}/></button><div className="relative m-auto h-[min(78vh,52rem)] w-full max-w-6xl">{images[active].type === "video" ? <video ref={video} src={images[active].src} poster={images[active].poster} controls playsInline preload="metadata" className="h-full w-full object-contain" aria-label={images[active].alt || `${title} video ${active + 1}`}/> : <Image src={images[active].src} alt={images[active].alt || ""} fill priority unoptimized={images[active].src.startsWith("/media/")} sizes="100vw" className="object-contain"/>}</div>{images.length > 1 && <><button type="button" onClick={previous} aria-label="View previous media" className="absolute left-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-wine sm:left-6"><ChevronLeft size={26}/></button><button type="button" onClick={next} aria-label="View next media" className="absolute right-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-wine sm:right-6"><ChevronRight size={26}/></button></>}<div className="absolute inset-x-4 bottom-4 text-center text-white sm:bottom-6"><p className="text-xs font-bold uppercase tracking-[.14em] text-white/60">{active + 1} / {images.length}</p>{images[active].caption && <p className="mx-auto mt-2 max-w-2xl text-sm text-white/80">{images[active].caption}</p>}</div></div>}</>;
}
