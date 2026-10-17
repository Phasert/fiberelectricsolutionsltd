"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Check, Eye, GripVertical, ImagePlus, Info, Star, Trash2, UploadCloud, X } from "lucide-react";
import type { AdminProject, MediaItem, PublishStatus } from "@/types/admin";

type Photo = { id: string; name: string; src: string; temporary: boolean };
type Errors = Partial<Record<"title" | "summary" | "photos", string>>;
const MAX_SIZE = 10 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ProjectForm({ project, media = [] }: { project?: AdminProject; media?: MediaItem[] }) {
  const [status, setStatus] = useState<PublishStatus>(project?.status ?? "Draft");
  const [featured, setFeatured] = useState(Boolean(project?.featured && project.status === "Published"));
  const initialPhotos:Photo[] = media.length ? media.map((item) => ({ id:item.id, name:item.name, src:item.src, temporary:false })) : project ? [{ id: "existing-cover", name: "Current project cover", src: project.image, temporary: false }] : [];
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [coverId, setCoverId] = useState(media.find((item) => item.isCover)?.id ?? initialPhotos[0]?.id ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [fileError, setFileError] = useState("");
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const urls = useRef<Set<string>>(new Set());

  useEffect(() => () => { urls.current.forEach((url) => URL.revokeObjectURL(url)); }, []);

  const addFiles = (list: FileList | File[]) => {
    const files = Array.from(list);
    const valid = files.filter((file) => TYPES.includes(file.type) && file.size <= MAX_SIZE);
    const added = valid.map((file) => { const src = URL.createObjectURL(file); urls.current.add(src); return { id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`, name: file.name, src, temporary: true }; });
    setPhotos((current) => [...current, ...added]);
    if (!coverId && added[0]) setCoverId(added[0].id);
    const rejected = files.length - valid.length;
    setFileError(rejected ? `${rejected} file${rejected === 1 ? " was" : "s were"} skipped. Use JPG, PNG or WEBP files up to 10 MB.` : "");
    if (added.length) setErrors((current) => ({ ...current, photos: undefined }));
    if (input.current) input.current.value = "";
  };
  const remove = (id: string) => {
    const photo = photos.find((item) => item.id === id);
    if (photo?.temporary) { URL.revokeObjectURL(photo.src); urls.current.delete(photo.src); }
    const next = photos.filter((item) => item.id !== id); setPhotos(next);
    if (coverId === id) setCoverId(next[0]?.id ?? "");
  };
  const move = (id: string, by: -1 | 1) => setPhotos((current) => { const from = current.findIndex((item) => item.id === id); const to = from + by; if (from < 0 || to < 0 || to >= current.length) return current; const next = [...current]; [next[from], next[to]] = [next[to], next[from]]; return next; });
  const moveTo = (sourceId: string, targetId: string) => setPhotos((current) => { const from = current.findIndex((item) => item.id === sourceId); const to = current.findIndex((item) => item.id === targetId); if (from < 0 || to < 0 || from === to) return current; const next = [...current]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next; });
  const changeStatus = (next: PublishStatus) => { setStatus(next); if (next === "Draft") setFeatured(false); setMessage(""); };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const next: Errors = {};
    if (!String(data.get("title") ?? "").trim()) next.title = "Enter a project title.";
    if (!String(data.get("summary") ?? "").trim()) next.summary = "Add a short project summary.";
    if (status === "Published" && !photos.length) next.photos = "Add at least one photo before publishing.";
    setErrors(next);
    if (Object.keys(next).length) { setMessage(""); requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-error='true']")?.focus()); return; }
    setMessage(project ? "Preview changes saved locally. Nothing has been published." : "Project preview created locally. Nothing has been published.");
  };
  const cover = photos.find((item) => item.id === coverId) ?? photos[0];

  return <form onSubmit={submit} noValidate className="pb-10">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><Link href="/admin/projects" className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-ink/60 hover:text-wine"><ArrowLeft size={17}/> Back to projects</Link><p className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"><Info size={14}/> Frontend preview only</p></div>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="grid gap-5">
        <Section number="01" title="Project details" description="The core information visitors will use to understand this work.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Project title" name="title" required defaultValue={project?.title} error={errors.title} className="sm:col-span-2" placeholder="e.g. Commercial electrical upgrade"/>
            <Select label="Service category" name="category" defaultValue={project?.category ?? "Electrical"} options={["Electrical", "Fiber", "Combined"]}/>
            <Field label="Project date / period" name="period" defaultValue={project?.period} placeholder="e.g. September 2026"/>
            <Field label="General location" name="location" defaultValue={project?.location} className="sm:col-span-2" hint="Keep this broad—town, parish or service area." placeholder="e.g. Kingston, Jamaica"/>
            <label className="grid gap-2 text-sm font-bold sm:col-span-2">Project summary <Required/><textarea name="summary" defaultValue={project?.summary} rows={5} data-error={Boolean(errors.summary)} aria-invalid={Boolean(errors.summary)} aria-describedby={errors.summary ? "summary-error" : "summary-hint"} className="input min-h-36 rounded-md py-3 leading-6" placeholder="Describe the client need, work completed and outcome."/><span id="summary-hint" className="text-xs font-normal text-ink/45">A concise, plain-language overview works best.</span>{errors.summary && <ErrorText id="summary-error">{errors.summary}</ErrorText>}</label>
          </div>
        </Section>
        <Section number="02" title="Project photos" description="Add, order and choose the cover photo shown in project listings.">
          {project && <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md bg-paper px-4 py-3 text-xs text-ink/55"><span>These associations use the same mock media records as the library.</span><Link href={`/admin/media?project=${project.id}`} className="font-bold text-wine hover:underline">Manage in Media Library →</Link></div>}
          {cover ? <div className="grid gap-4 rounded-lg border border-black/[.08] bg-paper/55 p-3 sm:grid-cols-[minmax(0,1fr)_13rem] sm:p-4"><div className="relative aspect-[16/9] overflow-hidden rounded-md bg-charcoal"><Image src={cover.src} alt="Selected cover preview" fill unoptimized={cover.temporary} className="object-cover"/></div><div className="self-center"><p className="text-xs font-black uppercase tracking-[.12em] text-wine">Cover image</p><p className="mt-2 break-words text-sm font-bold">{cover.name}</p><p className="mt-2 text-xs leading-5 text-ink/50">This image leads the project card and public gallery.</p></div></div> : <div className="rounded-lg border border-dashed border-black/15 bg-paper/40 px-5 py-8 text-center"><ImagePlus className="mx-auto text-wine/60" size={30}/><p className="mt-3 font-bold">No project photos yet</p><p className="mt-1 text-sm text-ink/50">Add photos below. The first valid image becomes the cover.</p></div>}
          <div onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }} onDragOver={(e) => e.preventDefault()} onDragLeave={(e) => { if (e.currentTarget === e.target) setDragActive(false); }} onDrop={(e) => { e.preventDefault(); setDragActive(false); addFiles(e.dataTransfer.files); }} className={`mt-4 rounded-lg border-2 border-dashed p-6 text-center transition sm:p-8 ${dragActive ? "border-wine bg-wine/[.04]" : "border-wine/25 bg-white"}`}><UploadCloud className="mx-auto text-wine" size={28}/><p className="mt-3 text-sm font-bold">Drag and drop project photos here</p><p className="mt-1 text-xs text-ink/45">JPG, PNG or WEBP · up to 10 MB each · select multiple files</p><button type="button" onClick={() => input.current?.click()} className="mt-4 min-h-10 rounded-md border border-wine/25 bg-white px-4 text-sm font-bold text-wine hover:bg-wine hover:text-white">Choose photos</button><input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files && addFiles(e.target.files)}/></div>
          {fileError && <ErrorText id="file-error">{fileError}</ErrorText>}{errors.photos && <ErrorText id="photos-error">{errors.photos}</ErrorText>}
          {photos.length > 0 && <div className="mt-5"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Gallery order</h3><span className="text-xs text-ink/45">{photos.length} {photos.length === 1 ? "photo" : "photos"}</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{photos.map((photo, index) => <div key={photo.id} draggable onDragStart={() => setDraggedId(photo.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (draggedId) moveTo(draggedId, photo.id); setDraggedId(null); }} className="overflow-hidden rounded-lg border border-black/[.1] bg-white"><div className="relative aspect-[4/3] bg-charcoal"><Image src={photo.src} alt={`Gallery preview ${index + 1}`} fill unoptimized={photo.temporary} className="object-cover"/><span className="absolute left-2 top-2 grid size-7 place-items-center rounded bg-black/65 text-xs font-bold text-white">{index + 1}</span>{coverId === photo.id && <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-[.65rem] font-black uppercase tracking-wider text-wine"><Star size={11} fill="currentColor"/> Cover</span>}</div><div className="p-2.5"><p className="truncate text-xs font-semibold">{photo.name}</p><div className="mt-2 flex items-center justify-between"><button type="button" onClick={() => setCoverId(photo.id)} disabled={coverId === photo.id} className="min-h-8 rounded px-2 text-xs font-bold text-wine hover:bg-paper disabled:text-ink/30">Set cover</button><div className="flex"><IconButton label={`Move ${photo.name} earlier`} onClick={() => move(photo.id, -1)} disabled={index === 0}><ArrowUp size={14}/></IconButton><IconButton label={`Move ${photo.name} later`} onClick={() => move(photo.id, 1)} disabled={index === photos.length - 1}><ArrowDown size={14}/></IconButton><span className="hidden size-8 cursor-grab place-items-center text-ink/30 lg:grid"><GripVertical size={15}/></span><IconButton label={`Remove ${photo.name}`} onClick={() => remove(photo.id)} danger><X size={15}/></IconButton></div></div></div></div>)}</div></div>}
        </Section>
      </div>
      <aside className="grid gap-5 xl:sticky xl:top-5">
        <section className="rounded-xl border border-black/[.08] bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[.13em] text-wine">03 · Publishing</p><h2 className="mt-2 text-lg font-bold">Visibility</h2><fieldset className="mt-4 grid gap-2"><legend className="mb-2 text-sm font-bold">Publication status</legend>{(["Draft", "Published"] as PublishStatus[]).map((option) => <label key={option} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${status === option ? "border-wine bg-wine/[.035]" : "border-black/[.08]"}`}><input type="radio" name="status" checked={status === option} onChange={() => changeStatus(option)} className="mt-0.5 accent-wine"/><span><strong className="block text-sm">{option}</strong><span className="mt-0.5 block text-xs leading-5 text-ink/50">{option === "Draft" ? "Only visible in this admin preview." : "Ready to appear on the public website."}</span></span></label>)}</fieldset><div className="my-5 border-t border-black/[.08]"/><label className={`flex items-start justify-between gap-4 ${status === "Draft" ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}><span><strong className="flex items-center gap-2 text-sm"><Star size={16}/> Featured on homepage</strong><span className="mt-1 block text-xs leading-5 text-ink/50">Highlights this published project in the homepage project section.</span></span><input type="checkbox" checked={featured} disabled={status === "Draft"} onChange={(e) => setFeatured(e.target.checked)} className="peer sr-only"/><span aria-hidden="true" className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-black/15 transition peer-checked:bg-wine after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5"/></label>{status === "Draft" && <p className="mt-3 rounded-md bg-paper p-3 text-xs leading-5 text-ink/55">Publish the project before featuring it. Draft projects never appear publicly.</p>}</section>
        <section className="rounded-xl border border-black/[.08] bg-white p-5 shadow-sm"><button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-wine px-5 text-sm font-bold text-white hover:bg-wine-dark"><Check size={18}/>{project ? "Save changes" : "Create project"}</button><button type="button" onClick={() => setMessage("Preview opened locally. Your unsaved changes are not published.")} className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-black/15 text-sm font-bold hover:bg-paper"><Eye size={17}/> Preview project</button><Link href="/admin/projects" className="mt-2 inline-flex min-h-11 w-full items-center justify-center text-sm font-bold text-ink/55 hover:text-wine">Cancel</Link>{message && <p role="status" className="mt-4 rounded-md border-l-4 border-amber-500 bg-amber-50 p-3 text-xs font-medium leading-5 text-amber-900">{message}</p>}</section>
        {project && <section className="rounded-xl border border-red-200 bg-red-50/40 p-5"><h2 className="text-sm font-bold text-red-800">Danger zone</h2><p className="mt-1 text-xs leading-5 text-red-800/70">Deletion is separated from routine editing and requires confirmation.</p><button type="button" onClick={() => document.getElementById("delete-project-dialog")?.showPopover()} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md border border-red-300 bg-white px-4 text-sm font-bold text-red-700 hover:bg-red-700 hover:text-white"><Trash2 size={16}/> Delete project</button></section>}
      </aside>
    </div>
    <div id="delete-project-dialog" popover="auto" className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-xl border border-black/10 p-0 shadow-2xl backdrop:bg-black/45"><div className="p-6"><span className="grid size-11 place-items-center rounded-full bg-red-50 text-red-700"><Trash2 size={20}/></span><h2 className="mt-4 text-xl font-bold">Delete this project?</h2><p className="mt-2 text-sm leading-6 text-ink/55">This frontend demo will only show a confirmation. No project or photo will actually be deleted.</p><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" className="min-h-11 rounded-md border border-black/15 px-5 text-sm font-bold" popoverTarget="delete-project-dialog" popoverTargetAction="hide">Keep project</button><button type="button" className="min-h-11 rounded-md bg-red-700 px-5 text-sm font-bold text-white" onClick={() => { setMessage("Delete confirmed in preview only. No project was deleted."); document.getElementById("delete-project-dialog")?.hidePopover(); }}>Confirm preview deletion</button></div></div></div>
  </form>;
}

function Section({ number, title, description, children }: { number: string; title: string; description: string; children: React.ReactNode }) { return <section className="rounded-xl border border-black/[.08] bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 border-b border-black/[.07] pb-4"><p className="text-xs font-black uppercase tracking-[.13em] text-wine">{number}</p><h2 className="mt-1 text-lg font-bold">{title}</h2><p className="mt-1 text-sm leading-6 text-ink/50">{description}</p></div>{children}</section>; }
function Required() { return <span className="text-wine" aria-label="required">*</span>; }
function ErrorText({ id, children }: { id: string; children: React.ReactNode }) { return <span id={id} role="alert" className="mt-1 block text-xs font-bold text-red-700">{children}</span>; }
function Field({ label, name, defaultValue, required, error, className = "", hint, placeholder }: { label: string; name: string; defaultValue?: string; required?: boolean; error?: string; className?: string; hint?: string; placeholder?: string }) { return <label className={`grid gap-2 text-sm font-bold ${className}`}>{label} {required && <Required/>}<input name={name} defaultValue={defaultValue} data-error={Boolean(error)} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined} className="input rounded-md" placeholder={placeholder}/>{hint && <span id={`${name}-hint`} className="text-xs font-normal text-ink/45">{hint}</span>}{error && <ErrorText id={`${name}-error`}>{error}</ErrorText>}</label>; }
function Select({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: string[] }) { return <label className="grid gap-2 text-sm font-bold">{label}<select name={name} defaultValue={defaultValue} className="input rounded-md">{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) { return <button type="button" onClick={onClick} disabled={disabled} className={`grid size-8 place-items-center rounded disabled:opacity-25 ${danger ? "text-red-600 hover:bg-red-50" : "hover:bg-paper"}`} aria-label={label}>{children}</button>; }
