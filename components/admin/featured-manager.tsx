"use client";

import { formatFibreText } from "@/lib/site-content/spelling";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Check, CircleAlert, Eye, ImageOff, RotateCcw, Save } from "lucide-react";
import type { AdminProject, AdminResource, AdminTip, MediaItem } from "@/types/admin";
import type { FeaturedSelection } from "@/lib/featured/schemas";

type Selection = FeaturedSelection;

export function FeaturedManager({ projects, resources, tips, media, initialSelection }: { projects: AdminProject[]; resources: AdminResource[]; tips: AdminTip[]; media: MediaItem[]; initialSelection: Selection }) {
  const [savedSelection, setSavedSelection] = useState(initialSelection);
  const [selection, setSelection] = useState(initialSelection);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [projectFilter, setProjectFilter] = useState<"All" | "Electrical" | "Fiber">("All");
  const [showAllProjects, setShowAllProjects] = useState(false);
  const saveGuard = useRef(false);

  const publishedProjects = projects.filter((project) => project.status === "Published" && project.galleryCount > 0);
  const filteredProjects = publishedProjects.filter((project) => projectFilter === "All" || project.category === projectFilter);
  const initialProjects = filteredProjects.slice(0, 3);
  const selectedFilteredProject = filteredProjects.find((project) => project.id === selection.projectId);
  const visibleProjects = showAllProjects ? filteredProjects : selectedFilteredProject && !initialProjects.some((project) => project.id === selectedFilteredProject.id) ? [...initialProjects.slice(0, 2), selectedFilteredProject] : initialProjects;
  const publishedResources = resources.filter((resource) => resource.status === "Published");
  const orderedTips = [...tips].sort((a, b) => a.order - b.order);
  const selectedProject = projects.find((project) => project.id === selection.projectId);
  const selectedResource = resources.find((resource) => resource.id === selection.resourceId);
  const selectedTips = selection.tipIds.map((id) => tips.find((tip) => tip.id === id)).filter((tip): tip is AdminTip => Boolean(tip));
  const mediaSources = new Set(media.map((item) => item.src));
  const selectedImage=selectedProject?.image;
  const selectedTitle=selectedProject?.title;
  const selectedCategory=selectedProject?.category;
  const selectedSummary=selectedProject?.summary;
  const projectImageExists = Boolean(selectedImage);
  const resourceImageExists = Boolean(selectedResource?.coverImage && mediaSources.has(selectedResource.coverImage));
  const hasChanges = JSON.stringify(selection) !== JSON.stringify(savedSelection);
  const errors = validateSelection(selection, projects, resources, tips);

  function update(next: Selection) { setSelection(next); setNotice(null); }
  function moveTip(id: string, direction: -1 | 1) { const index=selection.tipIds.indexOf(id),destination=index+direction;if(index<0||destination<0||destination>=selection.tipIds.length)return;const ids=[...selection.tipIds];[ids[index],ids[destination]]=[ids[destination],ids[index]];update({...selection,tipIds:ids}); }
  async function save() {
    if (saveGuard.current) return;
    if (errors.length) { setNotice("Resolve the highlighted validation issues before saving."); return; }
    saveGuard.current = true;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/featured", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(selection) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setNotice(result.error ?? "Unable to save featured content."); return; }
      setSavedSelection(selection);
      setNotice("Featured selections saved. Approved selections now update the public homepage.");
    } catch { setNotice("Unable to save featured content. Check your connection and try again."); }
    finally { saveGuard.current = false; setBusy(false); }
  }
  function revert() { setSelection(savedSelection); setNotice("Unsaved changes reverted."); }
  function openPreview() { document.getElementById("homepage-preview")?.scrollIntoView({ behavior: "smooth", block: "start" }); }

  return <div className="space-y-6">
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
      <div className="space-y-6">
        <Section number="01" title="Featured Project" description="Choose a published Electrical or Fibre Optic project collection for the homepage.">
          <SelectionCard checked={!selection.projectId} name="featured-project" value="" onChange={() => update({ ...selection, projectId: "", mediaId: undefined })} title="No featured project" meta="Optional" description="Hide the featured-project section while keeping resources and tips published." />
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2" role="group" aria-label="Filter featured projects">{(["All","Electrical","Fiber"] as const).map((value)=><button key={value} type="button" onClick={()=>{setProjectFilter(value);setShowAllProjects(false)}} aria-pressed={projectFilter===value} className={`min-h-10 rounded-full border px-4 text-xs font-bold ${projectFilter===value?"border-wine bg-wine text-white":"border-black/10 bg-white text-ink/60"}`}>{value==="Fiber"?"Fibre Optic":value}</button>)}</div><p className="text-xs text-ink/45">Showing {visibleProjects.length} of {filteredProjects.length}</p></div>
          <fieldset><legend className="sr-only">Select a published project</legend><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((project) => {const checked=selection.projectId===project.id;return <label key={project.id} className={`group relative cursor-pointer overflow-hidden rounded-lg border bg-white transition ${checked?"border-wine ring-2 ring-wine/10":"border-black/10 hover:border-black/25"}`}><input className="sr-only" type="radio" name="featured-project" value={project.id} checked={checked} onChange={()=>update({...selection,projectId:project.id,mediaId:undefined})}/><div className="relative aspect-[4/3] bg-paper"><Image src={project.image} alt="" fill loading={checked?"eager":"lazy"} className="object-cover" sizes="(max-width: 768px) 50vw, 25vw"/><span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[.6rem] font-black uppercase tracking-wider text-emerald-700 shadow-sm">Published</span><span className={`absolute right-3 top-3 grid size-7 place-items-center rounded-full border ${checked?"border-wine bg-wine text-white":"border-black/15 bg-white text-transparent"}`}><Check size={15} strokeWidth={3}/></span></div><div className="p-3"><p className="text-[.62rem] font-black uppercase tracking-wider text-wine">{project.category==="Fiber"?"Fibre Optic":project.category}</p><p className="mt-1 truncate text-xs font-bold">{project.title}</p><p className="mt-1 text-[.68rem] text-ink/45">{project.galleryCount} photos</p></div></label>})}
          </div></fieldset>
          {filteredProjects.length>3&&<div className="mt-4 text-center"><button type="button" onClick={()=>setShowAllProjects(value=>!value)} className="min-h-11 rounded-md border border-wine/25 px-5 text-sm font-bold text-wine">{showAllProjects?"Show fewer":"View more projects"}</button></div>}
          {publishedProjects.length>0&&!filteredProjects.length&&<p className="mt-4 rounded-md border border-dashed p-5 text-center text-sm text-ink/45">No published projects match this filter.</p>}
          {!publishedProjects.length&&<ValidationWarning>No published project collections are available. Create and publish one from Admin → Projects first.</ValidationWarning>}
        </Section>

        <Section number="02" title="Featured Resource" description="Optionally highlight one published resource in the existing resources section.">
          <fieldset><legend className="sr-only">Select a featured resource</legend><div className="grid gap-3">
            <SelectionCard checked={!selection.resourceId} name="featured-resource" value="" onChange={() => update({ ...selection, resourceId: "" })} title="No featured resource" meta="Optional" description="Keep the homepage resources section in its default state." />
            {publishedResources.map((resource) => <SelectionCard key={resource.id} checked={selection.resourceId === resource.id} name="featured-resource" value={resource.id} onChange={() => update({ ...selection, resourceId: resource.id })} title={resource.title} meta={`${resource.kind} · ${formatFibreText(resource.category)}`} description={resource.summary} image={resource.coverImage && mediaSources.has(resource.coverImage) ? resource.coverImage : undefined} />)}
          </div></fieldset>
          {!publishedResources.length && <p className="mt-3 text-xs text-ink/45">No published resources are currently available. Draft resources are intentionally excluded.</p>}
        </Section>

        <Section number="03" title="Homepage Tips" description="Select from complete, enabled tips. Their order is controlled in Tips management.">
          <div className="flex items-center justify-between gap-4 border-b border-black/8 pb-4"><p className="text-xs text-ink/50">{selectedTips.length} of {orderedTips.filter(isEligibleTip).length} eligible tips selected</p><Link href="/admin/tips" className="inline-flex min-h-10 items-center gap-2 text-xs font-bold text-wine hover:underline">Manage Tips <ArrowRight size={14} /></Link></div>
          {selectedTips.length>0&&<ol className="mt-4 grid gap-2">{selectedTips.map((tip,index)=><li key={tip.id} className="flex items-center justify-between rounded-md border border-wine/15 bg-wine/[.025] px-3 py-2"><span className="text-xs font-bold">{index+1}. {tip.title}</span><span className="flex gap-1"><button type="button" disabled={index===0} onClick={()=>moveTip(tip.id,-1)} aria-label={`Move ${tip.title} up`} className="grid size-8 place-items-center rounded border border-black/10 disabled:opacity-25"><ArrowUp size={14}/></button><button type="button" disabled={index===selectedTips.length-1} onClick={()=>moveTip(tip.id,1)} aria-label={`Move ${tip.title} down`} className="grid size-8 place-items-center rounded border border-black/10 disabled:opacity-25"><ArrowDown size={14}/></button></span></li>)}</ol>}
          <fieldset className="mt-4 grid gap-3 sm:grid-cols-2"><legend className="sr-only">Select homepage tips</legend>{orderedTips.map((tip) => {
            const eligible = isEligibleTip(tip); const checked = selection.tipIds.includes(tip.id);
            return <label key={tip.id} className={`relative rounded-lg border p-4 transition ${!eligible ? "cursor-not-allowed border-black/5 bg-black/[.025] opacity-55" : checked ? "cursor-pointer border-wine bg-wine/[.025] ring-2 ring-wine/10" : "cursor-pointer border-black/10 bg-white hover:border-black/25"}`}>
              <input className="sr-only" type="checkbox" checked={checked} disabled={!eligible} onChange={() => update({ ...selection, tipIds: checked ? selection.tipIds.filter((id) => id !== tip.id) : [...selection.tipIds, tip.id] })} />
              <div className="flex items-start gap-3"><span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded border ${checked ? "border-wine bg-wine text-white" : "border-black/20 bg-white text-transparent"}`}><Check size={13} strokeWidth={3} /></span><span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className={`text-[.62rem] font-black uppercase tracking-[.14em] ${tip.type === "Do" ? "text-emerald-700" : "text-wine"}`}>{tip.type}</span><span className={`rounded-full px-2 py-0.5 text-[.58rem] font-black uppercase tracking-wider ${tip.enabled ? "bg-emerald-50 text-emerald-700" : "bg-black/5 text-ink/45"}`}>{tip.enabled ? "Enabled" : "Disabled"}</span></span><span className="mt-2 block text-sm font-bold text-ink">{tip.title || "Untitled tip"}</span><span className="mt-1 block text-xs leading-5 text-ink/50">{tip.body || "This tip is incomplete and cannot be selected."}</span></span></div>
            </label>;
          })}</fieldset>
        </Section>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24">
        <section className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm"><div className="border-b border-black/8 px-5 py-4"><p className="text-[.62rem] font-black uppercase tracking-[.16em] text-wine">Featured work</p><h2 className="mt-1 font-bold">Homepage project</h2></div><div className="relative aspect-[4/3] bg-paper">{projectImageExists&&selectedImage?<Image src={selectedImage} alt={selectedTitle||""} fill loading="eager" className="object-cover" sizes="22rem"/>:<MissingImage/>}</div><div className="p-5"><p className="text-sm font-bold">{selectedTitle??"No project selected"}</p><p className="mt-2 text-xs leading-5 text-ink/50">The homepage links to this complete project collection and uses its selected cover photograph.</p><Link href="/admin/projects" className="mt-4 inline-flex min-h-10 items-center gap-2 text-xs font-bold text-wine hover:underline">Manage projects <ArrowRight size={14}/></Link></div></section>
        {errors.length > 0 && <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><p className="flex items-center gap-2 font-bold"><CircleAlert size={15} /> Review required</p><ul className="mt-2 list-disc space-y-1 pl-5">{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
      </aside>
    </div>

    <section id="homepage-preview" className="scroll-mt-24 overflow-hidden rounded-lg border border-black/10 bg-ink text-white shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:px-6"><div><p className="text-[.62rem] font-black uppercase tracking-[.16em] text-[#db8298]">Homepage Preview</p><h2 className="mt-1 text-lg font-bold">Current unsaved selection</h2></div><span className="w-fit rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-[.62rem] font-black uppercase tracking-wider text-amber-200">Preview only · Not live</span></div>
      <div className="grid lg:grid-cols-[1.05fr_.95fr]">
        <div className="border-b border-white/10 p-5 sm:p-7 lg:border-b-0 lg:border-r"><p className="text-[.62rem] font-black uppercase tracking-[.16em] text-[#db8298]">Featured work</p><div className="mt-4 overflow-hidden bg-white text-ink"><div className="relative aspect-[16/9] bg-paper">{projectImageExists&&selectedImage?<Image src={selectedImage} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw"/>:<MissingImage/>}</div><div className="p-5"><p className="text-[.62rem] font-black uppercase tracking-wider text-wine">{selectedCategory==="Fiber"?"Fibre Optic":selectedCategory??"No category"}</p><h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">{selectedTitle??"Select a published project"}</h3><p className="mt-2 text-xs leading-5 text-ink/55">{selectedSummary??"The selected project collection will appear here."}</p></div></div></div>
        <div className="grid content-start gap-6 p-5 sm:p-7"><div><p className="text-[.62rem] font-black uppercase tracking-[.16em] text-[#db8298]">Field notes</p><div className="mt-3 divide-y divide-white/10 border border-white/10">{selectedTips.length ? selectedTips.map((tip) => <article key={tip.id} className="p-4"><p className="text-[.6rem] font-black uppercase tracking-widest text-[#db8298]">{tip.type}</p><p className="mt-1 text-sm font-bold">{tip.title}</p><p className="mt-1 text-xs leading-5 text-white/50">{tip.body}</p></article>) : <p className="p-4 text-xs text-white/45">No homepage tips selected.</p>}</div></div><div><p className="text-[.62rem] font-black uppercase tracking-[.16em] text-[#db8298]">Resources &amp; insights</p><div className="mt-3 border border-white/10 p-4"><p className="text-[.6rem] font-black uppercase tracking-widest text-white/40">{selectedResource ? `${selectedResource.kind} · ${formatFibreText(selectedResource.category)}` : "Default homepage section"}</p><p className="mt-2 text-sm font-bold">{selectedResource?.title ?? "No featured resource selected"}</p><p className="mt-1 text-xs leading-5 text-white/50">{selectedResource?.summary ?? "The existing public resources layout remains unchanged."}</p>{selectedResource?.coverImage && !resourceImageExists && <p className="mt-2 text-xs font-bold text-amber-200">Cover image is missing from the Media Library.</p>}</div></div></div>
      </div>
    </section>

    <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-lg border border-black/10 bg-white/95 p-4 shadow-[0_16px_50px_rgba(20,19,21,.16)] backdrop-blur sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold">{hasChanges ? "Unsaved featured changes" : "Featured selection is up to date"}</p><p aria-live="polite" className="mt-1 text-xs text-ink/50">{notice ?? "Published, non-test selections update the public homepage after saving."}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={revert} disabled={!hasChanges||busy} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-black/12 px-4 text-xs font-bold text-ink/70 disabled:cursor-not-allowed disabled:opacity-40"><RotateCcw size={15} /> Cancel / Revert</button><button type="button" onClick={openPreview} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-wine px-4 text-xs font-bold text-wine"><Eye size={15} /> Preview Homepage</button><button type="button" disabled={busy||!hasChanges} onClick={save} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-wine px-5 text-xs font-bold text-white hover:bg-wine-dark disabled:cursor-not-allowed disabled:opacity-50"><Save size={15} /> {busy?"Saving…":"Save Changes"}</button></div></div>
  </div>;
}

function Section({ number, title, description, children }: { number: string; title: string; description: string; children: React.ReactNode }) { return <section className="rounded-lg border border-black/10 bg-white shadow-sm"><div className="flex gap-4 border-b border-black/8 px-5 py-4 sm:px-6"><span className="text-[.65rem] font-black tracking-widest text-wine">{number}</span><div><h2 className="font-bold text-ink">{title}</h2><p className="mt-1 text-xs leading-5 text-ink/50">{description}</p></div></div><div className="p-5 sm:p-6">{children}</div></section>; }
function SelectionCard({ checked, name, value, onChange, title, meta, description, image }: { checked: boolean; name: string; value: string; onChange: () => void; title: string; meta: string; description: string; image?: string }) { return <label className={`relative flex min-h-32 cursor-pointer overflow-hidden rounded-lg border bg-white transition ${checked ? "border-wine ring-2 ring-wine/10" : "border-black/10 hover:border-black/25"}`}><input className="sr-only" type="radio" name={name} value={value} checked={checked} onChange={onChange} />{image && <div className="relative w-28 shrink-0 bg-paper"><Image src={image} alt="" fill className="object-cover" sizes="7rem" /></div>}<div className="flex min-w-0 flex-1 gap-3 p-4"><span className="min-w-0 flex-1"><span className="text-[.6rem] font-black uppercase tracking-[.13em] text-wine">{meta}</span><span className="mt-2 block text-sm font-bold text-ink">{title}</span><span className="mt-1 block text-xs leading-5 text-ink/50">{description}</span></span><span className={`grid size-6 shrink-0 place-items-center rounded-full border ${checked ? "border-wine bg-wine text-white" : "border-black/15 text-transparent"}`}><Check size={13} strokeWidth={3} /></span></div></label>; }
function ValidationWarning({ children }: { children: React.ReactNode }) { return <div className="mb-4 flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><CircleAlert size={17} className="mt-0.5 shrink-0" /><p>{children}</p></div>; }
function MissingImage({ compact = false }: { compact?: boolean }) { return <div className="absolute inset-0 grid place-items-center bg-paper text-center text-ink/35"><div><ImageOff size={compact ? 20 : 28} className="mx-auto" /><p className={`mt-2 font-bold ${compact ? "text-[.6rem]" : "text-xs"}`}>No cover image available</p></div></div>; }
function isEligibleTip(tip: AdminTip) { return tip.enabled && tip.title.trim().length > 0 && tip.body.trim().length > 0; }
function validateSelection(selection: Selection, projects: AdminProject[], resources: AdminResource[], tips: AdminTip[]) { const errors: string[] = []; const project=projects.find(item=>item.id===selection.projectId),resource=resources.find(item=>item.id===selection.resourceId);if(selection.projectId&&(!project||project.status!=="Published"||project.galleryCount<1))errors.push("The featured project must be published and contain at least one photograph.");if(resource&&resource.status!=="Published")errors.push("The featured resource must be published.");if(selection.tipIds.some(id=>!tips.some(tip=>tip.id===id&&isEligibleTip(tip))))errors.push("Featured tips must be enabled and complete.");return errors; }
