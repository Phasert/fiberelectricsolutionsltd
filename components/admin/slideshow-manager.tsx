"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, MonitorPlay } from "lucide-react";
import { useState } from "react";
import type { MediaItem, SlideshowAssignment, SlideshowPlacement } from "@/types/admin";

const field = "min-h-10 rounded-md border border-black/10 bg-white px-3 text-sm";
const names: Record<SlideshowPlacement, string> = { hero: "Homepage hero", electrical: "Electrical services", fiber: "Fiber optic services" };
const heroDefaults = { headline: "Powering what matters. Connecting what comes next.", description: "Practical electrical and fiber optic solutions for homes, businesses and projects across Trinidad & Tobago.", ctaLabel: "Request a Quote", ctaHref: "/request-a-quote" };

export function SlideshowManager({ items, refresh }: { items: MediaItem[]; refresh: () => Promise<void> }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const placements = Object.keys(names) as SlideshowPlacement[];
  const save = async (id: string, slideshow: SlideshowAssignment | null) => {
    setBusy(true); setMessage("");
    const response = await fetch(`/api/admin/media/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ slideshow }) });
    setBusy(false); setMessage(response.ok ? "Slideshow settings saved." : "Unable to save slideshow settings.");
    if (response.ok) await refresh();
    return response.ok;
  };
  const move = async (group: MediaItem[], index: number, direction: -1 | 1) => {
    const item = group[index], other = group[index + direction];
    if (!item?.slideshow || !other?.slideshow) return;
    setBusy(true);
    const request = (id: string, slideshow: SlideshowAssignment) => fetch(`/api/admin/media/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ slideshow }) });
    const responses = await Promise.all([request(item.id, { ...item.slideshow, order: other.slideshow.order }), request(other.id, { ...other.slideshow, order: item.slideshow.order })]);
    setBusy(false); setMessage(responses.every((response) => response.ok) ? "Slide order saved." : "Unable to reorder slides.");
    await refresh();
  };

  return <section className="overflow-hidden rounded-lg border border-wine/15 bg-white shadow-sm" aria-labelledby="slideshow-heading">
    <header className="border-b border-black/[.06] p-5"><div className="flex items-center gap-2"><MonitorPlay size={18} className="text-wine" /><h2 id="slideshow-heading" className="font-bold">Homepage slideshows</h2></div><p className="mt-1 text-xs leading-5 text-ink/50">Preview, order and edit up to four slides per placement. Hero slides include synchronized headline, description and CTA content.</p>{message && <p role="status" className="mt-2 text-xs font-bold text-wine">{message}</p>}</header>
    <div className="grid gap-5 p-5 xl:grid-cols-3">{placements.map((placement) => {
      const group = items.filter((item) => item.slideshow?.placement === placement).sort((a, b) => (a.slideshow?.order ?? 0) - (b.slideshow?.order ?? 0));
      const available = items.filter((item) => item.status === "Ready" && !item.slideshow);
      return <section key={placement}><h3 className="text-sm font-bold">{names[placement]}</h3><p className="mt-1 text-[.68rem] text-ink/45">{group.length}/4 images</p><select aria-label={`Add image to ${names[placement]}`} value="" disabled={busy || group.length >= 4 || !available.length} onChange={(event) => { const item = items.find((value) => value.id === event.target.value); if (item) void save(item.id, { placement, order: group.length, alt: item.alt, focalPoint: { x: 50, y: 50 }, published: false, ...(placement === "hero" ? heroDefaults : {}) }); }} className={`${field} mt-3 w-full disabled:opacity-50`}><option value="">{group.length >= 4 ? "Maximum of four images" : "Add a library image…"}</option>{available.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><div className="mt-3 space-y-3">{group.length ? group.map((item, index) => <SlideEditor key={item.id} item={item} busy={busy} first={!index} last={index === group.length - 1} save={save} move={(direction) => move(group, index, direction)} />) : <div className="grid min-h-28 place-items-center rounded border border-dashed border-black/15 bg-paper/45 p-4 text-center text-xs leading-5 text-ink/45">The approved local fallback will be used until Media Library slides are published.</div>}</div></section>;
    })}</div>
  </section>;
}

function SlideEditor({ item, busy, first, last, save, move }: { item: MediaItem; busy: boolean; first: boolean; last: boolean; save: (id: string, value: SlideshowAssignment | null) => Promise<boolean>; move: (direction: -1 | 1) => Promise<void> }) {
  const [draft, setDraft] = useState(item.slideshow!);
  const isHero = item.slideshow!.placement === "hero";
  const persist = () => save(item.id, { ...draft, placement: item.slideshow!.placement, order: item.slideshow!.order, published: item.slideshow!.published });
  const validHero = !isHero || Boolean(draft.headline?.trim() && draft.description?.trim() && draft.ctaLabel?.trim() && draft.ctaHref?.trim());

  return <article className="overflow-hidden rounded border border-black/10">
    <div className="relative aspect-[16/9] bg-charcoal"><Image src={item.src} alt={draft.alt} fill unoptimized className="object-cover" style={{ objectPosition: `${draft.focalPoint.x}% ${draft.focalPoint.y}%` }} /><span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[.58rem] font-black uppercase ${item.slideshow?.published ? "bg-emerald-700 text-white" : "bg-amber-200 text-amber-950"}`}>{item.slideshow?.published ? "Published" : "Draft"}</span><div className="absolute right-2 top-2 flex gap-1"><button type="button" disabled={busy || first} onClick={() => void move(-1)} className="grid size-8 place-items-center rounded bg-black/65 text-white disabled:opacity-30" aria-label={`Move ${item.name} earlier`}><ArrowUp size={14} /></button><button type="button" disabled={busy || last} onClick={() => void move(1)} className="grid size-8 place-items-center rounded bg-black/65 text-white disabled:opacity-30" aria-label={`Move ${item.name} later`}><ArrowDown size={14} /></button></div></div>
    <div className="space-y-3 p-3">
      <label className="block text-[.68rem] font-bold">Alt text<input value={draft.alt} maxLength={180} onChange={(event) => setDraft((value) => ({ ...value, alt: event.target.value }))} className={`${field} mt-1 w-full`} /></label>
      {isHero && <div className="space-y-3 rounded-md bg-paper/70 p-3"><p className="text-[.65rem] font-black uppercase tracking-[.12em] text-wine">Hero content</p><label className="block text-[.68rem] font-bold">Headline<input value={draft.headline ?? ""} maxLength={120} onChange={(event) => setDraft((value) => ({ ...value, headline: event.target.value }))} className={`${field} mt-1 w-full`} /></label><label className="block text-[.68rem] font-bold">Description<textarea value={draft.description ?? ""} maxLength={300} rows={3} onChange={(event) => setDraft((value) => ({ ...value, description: event.target.value }))} className={`${field} mt-1 w-full py-2`} /></label><div className="grid gap-2 sm:grid-cols-2"><label className="text-[.68rem] font-bold">CTA label<input value={draft.ctaLabel ?? ""} maxLength={60} onChange={(event) => setDraft((value) => ({ ...value, ctaLabel: event.target.value }))} className={`${field} mt-1 w-full`} /></label><label className="text-[.68rem] font-bold">CTA link<input value={draft.ctaHref ?? ""} maxLength={500} onChange={(event) => setDraft((value) => ({ ...value, ctaHref: event.target.value }))} className={`${field} mt-1 w-full`} /></label></div></div>}
      <div className="grid grid-cols-2 gap-2"><label className="text-[.68rem] font-bold">Focal point X<input type="range" min="0" max="100" value={draft.focalPoint.x} onChange={(event) => setDraft((value) => ({ ...value, focalPoint: { ...value.focalPoint, x: Number(event.target.value) } }))} className="mt-2 w-full accent-wine" /></label><label className="text-[.68rem] font-bold">Focal point Y<input type="range" min="0" max="100" value={draft.focalPoint.y} onChange={(event) => setDraft((value) => ({ ...value, focalPoint: { ...value.focalPoint, y: Number(event.target.value) } }))} className="mt-2 w-full accent-wine" /></label></div>
      <div className="flex flex-wrap gap-2"><button type="button" disabled={busy || !draft.alt.trim() || !validHero} onClick={() => void persist()} className="min-h-9 rounded bg-wine px-3 text-xs font-bold text-white disabled:opacity-40">Save details</button><button type="button" disabled={busy || !validHero} onClick={() => void save(item.id, { ...draft, published: !item.slideshow!.published })} className="min-h-9 rounded border border-emerald-200 px-3 text-xs font-bold text-emerald-800 disabled:opacity-40">{item.slideshow?.published ? "Unpublish" : "Publish"}</button><button type="button" disabled={busy} onClick={() => void save(item.id, null)} className="min-h-9 px-2 text-xs font-bold text-red-700">Remove slide</button></div>
    </div>
  </article>;
}
