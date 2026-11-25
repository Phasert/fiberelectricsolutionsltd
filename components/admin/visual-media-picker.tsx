"use client";

import Image from "next/image";
import { Check, Eye, Film, ImageIcon, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { MediaItem } from "@/types/admin";
import type { ProjectCategory } from "@/types/content";

type Kind = "all" | "image" | "video";
type Category = "all" | ProjectCategory;

export function VisualMediaPicker({
  items,
  value,
  onConfirm,
  title,
  description = "Choose a saved file or upload from your device.",
  multiple = false,
  max = 1,
  kind = "all",
  disabled = false,
  compactTrigger = false,
  forceOpen = title.startsWith("Add to ") || title.startsWith("Choose image for slide"),
  onDismiss,
  onClose,
}: {
  items: MediaItem[];
  value: string[];
  onConfirm: (ids: string[]) => void;
  title: string;
  description?: string;
  multiple?: boolean;
  max?: number;
  kind?: Kind;
  disabled?: boolean;
  compactTrigger?: boolean;
  forceOpen?: boolean;
  onDismiss?: () => void;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(forceOpen);
  const [draft, setDraft] = useState(value);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [type, setType] = useState<Kind>(kind);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedId, setUploadedId] = useState("");
  const waitingForUpload = uploading || refreshing;
  const imageTypes = "image/jpeg,image/png,image/webp,.heic,.heif";
  const videoTypes = "video/mp4,video/quicktime,.mp4,.mov";
  const accept = kind === "image" ? imageTypes : kind === "video" ? videoTypes : `${imageTypes},${videoTypes}`;
  const ready = useMemo(
    () =>
      items.filter(
        (item) =>
          item.status === "Ready" &&
          (kind === "all" || item.kind === kind) &&
          (type === "all" || item.kind === type) &&
          (category === "all" || item.category === category) &&
          item.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, kind, type, category, query],
  );
  const selected = value.map((id) => items.find((item) => item.id === id)).filter(Boolean) as MediaItem[];
  const show = () => { setDraft(value); setOpen(true); };
  const close = () => { if (waitingForUpload) return; setOpen(false); onDismiss?.(); onClose?.(); };
  async function upload(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("kind", kind);
      const response = await fetch("/api/admin/media", { method: "POST", body });
      const result = await response.json().catch(() => null);
      if (!response.ok || typeof result?.id !== "string") {
        throw new Error(result?.error ?? "The upload could not be completed.");
      }
      setQuery("");
      setCategory("all");
      setType(kind);
      setUploadedId(result.id);
      toggle(result.id);
      startTransition(() => router.refresh());
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "The upload could not be completed.");
    } finally {
      setUploading(false);
    }
  }
  const toggle = (id: string) => setDraft((current) => {
    if (current.includes(id)) return current.filter((value) => value !== id);
    if (!multiple) return [id];
    return current.length < max ? [...current, id] : current;
  });
  return <>
    <div className={compactTrigger?"shrink-0":""}>
      {compactTrigger ? <button type="button" disabled={disabled} onClick={show} className="min-h-11 rounded-md bg-wine px-4 text-sm font-bold text-white disabled:opacity-40">Choose media</button> : <>
      <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-ink/45">{description}</p></div><button type="button" disabled={disabled} onClick={show} className="min-h-10 shrink-0 rounded-md border border-wine/25 px-3 text-xs font-bold text-wine disabled:opacity-40">Choose media</button></div>
      {selected.length ? <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{selected.map((item) => <MediaThumb key={item.id} item={item} compact />)}</div> : <button type="button" disabled={disabled} onClick={show} className="mt-3 grid min-h-32 w-full place-items-center rounded-lg border border-dashed border-black/15 bg-paper/45 text-center text-xs text-ink/45"><span><ImageIcon className="mx-auto mb-2"/>No media selected</span></button>}
      </>}
    </div>
    {open && <div className="fixed inset-0 z-[120] grid place-items-center bg-black/70 p-3 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="visual-media-title" className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-paper shadow-2xl"><header className="flex items-start justify-between border-b bg-white p-5"><div><h2 id="visual-media-title" className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-ink/50">Select {multiple ? `up to ${max} items` : "one item"} by thumbnail.</p></div><button type="button" onClick={close} className="grid size-10 place-items-center" aria-label="Close media picker"><X/></button></header>
      <div className="border-b bg-white px-4 py-3">
        <label className="block text-sm font-bold">Upload from device
          <input type="file" accept={accept} disabled={waitingForUpload || (multiple && draft.length >= max)} className="mt-2 block w-full text-sm" onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file) void upload(file);
          }} />
        </label>
        {waitingForUpload && <p role="status" className="mt-2 text-sm">Uploading and refreshing saved files…</p>}
        {uploadError && <p role="alert" className="mt-2 text-sm text-red-700">{uploadError}</p>}
        {uploadedId && !waitingForUpload && !items.some((item) => item.id === uploadedId) && <p role="status" className="mt-2 text-sm">File uploaded. Reopen the editor if it does not appear in saved files.</p>}
      </div>
      <div className="grid gap-3 border-b bg-white p-4 md:grid-cols-[1fr_12rem_10rem]"><label className="relative"><span className="sr-only">Search saved files</span><Search size={16} className="absolute left-3 top-3.5 text-ink/35"/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search filenames…" className="min-h-11 w-full rounded-md border border-black/10 pl-9 pr-3 text-sm"/></label><select aria-label="Media category" value={category} onChange={(event)=>setCategory(event.target.value as Category)} className="min-h-11 rounded-md border border-black/10 bg-white px-3 text-sm"><option value="all">All categories</option><option>Electrical</option><option>Fiber</option><option>Combined</option></select><select aria-label="Media type" value={type} disabled={kind!=="all"} onChange={(event)=>setType(event.target.value as Kind)} className="min-h-11 rounded-md border border-black/10 bg-white px-3 text-sm disabled:opacity-50"><option value="all">Photos & videos</option><option value="image">Photos</option><option value="video">Videos</option></select></div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">{ready.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{ready.map((item)=>{const checked=draft.includes(item.id);return <article key={item.id} className={`overflow-hidden rounded-lg border bg-white ${checked?"border-wine ring-2 ring-wine/15":"border-black/10"}`}><button type="button" disabled={waitingForUpload} aria-pressed={checked} onClick={()=>toggle(item.id)} className="relative block aspect-[4/3] w-full bg-charcoal text-left"><MediaPreview item={item}/><span className={`absolute right-2 top-2 grid size-8 place-items-center rounded-full border ${checked?"border-wine bg-wine text-white":"border-white/70 bg-black/45 text-transparent"}`}><Check size={16}/></span><span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-[.6rem] font-black uppercase text-white">{item.kind==="video"?<Film size={12}/>:<ImageIcon size={12}/>} {item.kind}</span></button><div className="p-3"><p className="truncate text-xs font-bold">{item.name}</p><div className="mt-2 flex items-center justify-between gap-2"><span className="rounded-full bg-paper px-2 py-1 text-[.58rem] font-black uppercase text-ink/55">{item.category}</span><button type="button" onClick={()=>setPreview(item)} className="inline-flex items-center gap-1 text-[.65rem] font-bold text-wine"><Eye size={13}/>Preview</button></div></div></article>})}</div> : <div className="grid min-h-64 place-items-center text-center"><div><ImageIcon className="mx-auto text-ink/20"/><p className="mt-3 font-bold">No matching media</p><p className="mt-1 text-sm text-ink/45">Try another search or filter.</p></div></div>}</div>
      <footer className="flex flex-col-reverse gap-2 border-t bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs font-bold text-ink/50">{draft.length} of {max} selected</p><div className="flex gap-2"><button type="button" onClick={close} className="min-h-11 rounded-md border px-4 text-sm font-bold">Cancel</button><button type="button" disabled={waitingForUpload || draft.some((id) => !items.some((item) => item.id === id))} onClick={()=>{onConfirm(draft);close()}} className="min-h-11 rounded-md bg-wine px-5 text-sm font-bold text-white disabled:opacity-50">Use selected media</button></div></footer>
    </section></div>}
    {preview && <div role="dialog" aria-modal="true" aria-label={`Preview ${preview.name}`} className="fixed inset-0 z-[140] grid bg-black/95 p-4"><button type="button" onClick={()=>setPreview(null)} className="absolute right-4 top-4 z-10 grid size-12 place-items-center rounded-full bg-white/10 text-white" aria-label="Close preview"><X/></button><div className="relative m-auto h-[82vh] w-full max-w-6xl">{preview.kind==="video"?<video src={preview.src} poster={preview.posterSrc??undefined} controls playsInline preload="metadata" className="h-full w-full object-contain"/>:<Image src={preview.src} alt={preview.alt||preview.name} fill unoptimized className="object-contain"/>}</div></div>}
  </>;
}

function MediaPreview({item}:{item:MediaItem}){return item.kind==="video"?<video src={item.src} poster={item.posterSrc??undefined} muted playsInline preload="metadata" className="h-full w-full object-cover"/>:<Image src={item.src} alt={item.alt||""} fill unoptimized className="object-cover"/>}
function MediaThumb({item,compact=false}:{item:MediaItem;compact?:boolean}){return <div className="overflow-hidden rounded-md border bg-white"><div className={`relative bg-charcoal ${compact?"aspect-[4/3]":"aspect-video"}`}><MediaPreview item={item}/></div><p className="truncate p-2 text-[.65rem] font-bold">{item.name}</p></div>}
