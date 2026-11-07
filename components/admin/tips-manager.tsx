"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import type { AdminTip } from "@/types/admin";

type DraftTip = Pick<AdminTip, "type" | "title" | "body" | "enabled">;
type EditorState = { mode: "add" } | { mode: "edit"; id: string };
const emptyDraft: DraftTip = { type: "Do", title: "", body: "", enabled: true };

function normalizeOrder(tips: AdminTip[]) {
  return tips.map((tip, index) => ({ ...tip, order: index + 1 }));
}

export function TipsManager({ initial, embedded = false }: { initial: AdminTip[]; embedded?: boolean }) {
  const [tips, setTips] = useState(() => [...initial].sort((a, b) => a.order - b.order));
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [draft, setDraft] = useState<DraftTip>(emptyDraft);
  const [errors, setErrors] = useState<Partial<Record<"title" | "body", string>>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [message, setMessage] = useState("");
  const editorDialog = useRef<HTMLDialogElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const previewDialog = useRef<HTMLDialogElement>(null);
  const activeTips = useMemo(() => tips.filter((tip) => tip.enabled), [tips]);
  const deleteTip = tips.find((tip) => tip.id === deleteId);

  useEffect(() => {
    const dialog = editorDialog.current;
    if (editor && dialog && !dialog.open) dialog.showModal();
    if (!editor && dialog?.open) dialog.close();
  }, [editor]);
  useEffect(() => {
    const dialog = deleteDialog.current;
    if (deleteId && dialog && !dialog.open) dialog.showModal();
    if (!deleteId && dialog?.open) dialog.close();
  }, [deleteId]);
  useEffect(() => {
    const dialog = previewDialog.current;
    if (previewOpen && dialog && !dialog.open) dialog.showModal();
    if (!previewOpen && dialog?.open) dialog.close();
  }, [previewOpen]);

  function openAdd() {
    setDraft(emptyDraft);
    setErrors({});
    setEditor({ mode: "add" });
  }
  function openEdit(tip: AdminTip) {
    setDraft({ type: tip.type, title: tip.title, body: tip.body, enabled: tip.enabled });
    setErrors({});
    setEditor({ mode: "edit", id: tip.id });
  }
  function closeEditor() {
    setEditor(null);
    setErrors({});
  }
  function validate() {
    const nextErrors: typeof errors = {};
    if (!draft.title.trim()) nextErrors.title = "Enter a short title.";
    if (!draft.body.trim()) nextErrors.body = "Enter a short description.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }
  async function saveTip() {
    if (!editor || !validate()) return;
    const cleaned = { ...draft, title: draft.title.trim(), body: draft.body.trim() };
    if (editor.mode === "add") {
      const response=await fetch("/api/admin/tips",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(cleaned)}),result=await response.json();
      if(!response.ok){setMessage(result.error??"Unable to save this tip.");return}
      setTips((current) => normalizeOrder([...current, { id:result.id, order:result.order, ...cleaned }]));
      setMessage(`“${cleaned.title}” was added.`);
    } else {
      const response=await fetch(`/api/admin/tips/${editor.id}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify(cleaned)});
      if(!response.ok){setMessage("Unable to update this tip.");return}
      setTips((current) => current.map((tip) => tip.id === editor.id ? { ...tip, ...cleaned } : tip));
      setMessage(`“${cleaned.title}” was updated.`);
    }
    closeEditor();
  }
  async function toggleTip(tip: AdminTip) {
    if (!tip.enabled && (!tip.title.trim() || !tip.body.trim())) {
      openEdit(tip);
      setErrors({ ...(!tip.title.trim() && { title: "Add a title before enabling this tip." }), ...(!tip.body.trim() && { body: "Add a description before enabling this tip." }) });
      return;
    }
    const response=await fetch(`/api/admin/tips/${tip.id}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({type:tip.type,title:tip.title,body:tip.body,enabled:!tip.enabled})});
    if(!response.ok){setMessage("Unable to change this tip.");return}
    setTips((current) => current.map((item) => item.id === tip.id ? { ...item, enabled: !item.enabled } : item));
    setMessage(`“${tip.title}” is now ${tip.enabled ? "disabled" : "enabled"}.`);
  }
  async function moveTip(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= tips.length) return;
    const next = [...tips];
    [next[index], next[destination]] = [next[destination], next[index]];
    const ordered=normalizeOrder(next),response=await fetch("/api/admin/tips/reorder",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({ids:ordered.map(tip=>tip.id)})});
    if(!response.ok){setMessage("Unable to save the new order.");return}
    setTips(ordered);
    setMessage(`“${tips[index].title}” moved ${direction === -1 ? "up" : "down"}.`);
  }
  async function confirmDelete() {
    if (!deleteTip) return;
    const response=await fetch(`/api/admin/tips/${deleteTip.id}`,{method:"DELETE"});
    if(!response.ok){setMessage("Unable to remove this tip.");return}
    setTips((current) => normalizeOrder(current.filter((tip) => tip.id !== deleteTip.id)));
    setMessage(`“${deleteTip.title}” was removed.`);
    setDeleteId(null);
  }

  return <>
    {embedded ? <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-lg font-bold">Tips</h2><p className="mt-1 text-sm text-ink/50">Short practical guidance displayed in the existing homepage tips area.</p></div><button type="button" onClick={openAdd} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-wine px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-wine-dark"><Plus size={17} /> Add tip</button></div> : <AdminPageHeader title="Tips / Do’s & Don’ts" description="Keep the compact homepage guidance current, useful and easy to scan." actionNode={<button type="button" onClick={openAdd} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-wine px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-wine-dark"><Plus size={17} /> Add tip</button>} />}

    <section aria-labelledby="tips-list-heading" className="mb-5 rounded-lg border border-black/[.075] bg-white shadow-[0_1px_2px_rgba(20,19,21,.025)]">
      <div className="flex flex-col gap-3 border-b border-black/[.07] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div><div className="flex items-center gap-2.5"><h2 id="tips-list-heading" className="font-bold text-ink">Homepage tips</h2><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[.65rem] font-black uppercase tracking-[.08em] text-emerald-700">{activeTips.length} active</span></div><p className="mt-1 text-xs leading-5 text-ink/45">Use the arrows to set the order shown on the homepage.</p></div>
        <button type="button" onClick={() => setPreviewOpen(true)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-black/10 px-3.5 text-xs font-bold text-ink/65 transition-colors hover:border-wine/25 hover:bg-wine/[.035] hover:text-wine"><Eye size={16} /> Preview homepage tips</button>
      </div>
      {tips.length ? <ol className="divide-y divide-black/[.065]">{tips.map((tip, index) => <li key={tip.id} className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[3.25rem_1fr_auto] lg:items-center">
        <div className="flex items-center gap-1 lg:flex-col" aria-label={`Order ${index + 1} of ${tips.length}`}><button type="button" onClick={() => moveTip(index, -1)} disabled={index === 0} className="grid size-8 place-items-center rounded-md border border-black/10 text-ink/50 transition-colors hover:border-wine/25 hover:text-wine disabled:cursor-not-allowed disabled:opacity-25" aria-label={`Move ${tip.title} up`}><ArrowUp size={15} /></button><span className="min-w-6 text-center text-[.68rem] font-bold tabular-nums text-ink/30">{index + 1}</span><button type="button" onClick={() => moveTip(index, 1)} disabled={index === tips.length - 1} className="grid size-8 place-items-center rounded-md border border-black/10 text-ink/50 transition-colors hover:border-wine/25 hover:text-wine disabled:cursor-not-allowed disabled:opacity-25" aria-label={`Move ${tip.title} down`}><ArrowDown size={15} /></button></div>
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[.62rem] font-black uppercase tracking-[.1em] ${tip.type === "Do" ? "border-emerald-200/80 bg-emerald-50 text-emerald-700" : "border-wine/15 bg-wine/[.055] text-wine"}`}>{tip.type}</span>{!tip.enabled && <span className="text-[.65rem] font-bold uppercase tracking-[.08em] text-ink/35">Hidden from homepage</span>}</div><h3 className="mt-2 text-[.95rem] font-bold leading-6 text-ink">{tip.title}</h3><p className="mt-0.5 max-w-3xl text-sm leading-6 text-ink/52">{tip.body}</p></div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end"><button type="button" role="switch" aria-checked={tip.enabled} onClick={() => toggleTip(tip)} className="flex min-h-10 items-center gap-2 rounded-md border border-black/10 px-3 text-xs font-bold text-ink/60 hover:border-black/20" aria-label={`${tip.enabled ? "Disable" : "Enable"} ${tip.title}`}><span>{tip.enabled ? "Enabled" : "Disabled"}</span><span className={`relative h-5 w-9 rounded-full transition-colors ${tip.enabled ? "bg-emerald-600" : "bg-black/20"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-[left] ${tip.enabled ? "left-[1.125rem]" : "left-0.5"}`} /></span></button><button type="button" onClick={() => openEdit(tip)} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-black/10 px-3 text-xs font-bold text-ink/60 hover:border-wine/25 hover:text-wine"><Pencil size={14} /> Edit</button><button type="button" onClick={() => setDeleteId(tip.id)} className="grid size-10 place-items-center rounded-md text-red-700 transition-colors hover:bg-red-50" aria-label={`Delete ${tip.title}`}><Trash2 size={16} /></button></div>
      </li>)}</ol> : <div className="px-5 py-10 text-center"><p className="font-bold">No tips yet</p><p className="mt-1 text-sm text-ink/50">Add the first short homepage tip when you’re ready.</p><button type="button" onClick={openAdd} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md border border-wine px-4 text-sm font-bold text-wine"><Plus size={16} /> Add tip</button></div>}
    </section>
    <p aria-live="polite" className="sr-only">{message}</p>

    <dialog ref={editorDialog} onCancel={(event) => { event.preventDefault(); closeEditor(); }} className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-lg border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-black/55 backdrop:backdrop-blur-[2px]">
      {editor && <div><div className="flex items-start justify-between gap-4 border-b border-black/[.07] px-5 py-4 sm:px-6"><div><h2 className="text-lg font-bold">{editor.mode === "add" ? "Add a homepage tip" : "Edit homepage tip"}</h2><p className="mt-1 text-xs leading-5 text-ink/45">Changes are saved to Firestore; only enabled, eligible tips can appear publicly.</p></div><button type="button" onClick={closeEditor} className="grid size-9 shrink-0 place-items-center rounded-md text-ink/45 hover:bg-black/5" aria-label="Close editor"><X size={19} /></button></div>
        <form onSubmit={(event) => { event.preventDefault(); saveTip(); }} noValidate className="grid gap-5 p-5 sm:p-6">
          <fieldset><legend className="mb-2 text-xs font-bold text-ink/65">Tip type</legend><div className="grid grid-cols-2 gap-2">{(["Do", "Don’t"] as const).map((type) => <label key={type} className={`flex min-h-11 cursor-pointer items-center justify-center rounded-md border text-sm font-bold ${draft.type === type ? "border-wine bg-wine/[.055] text-wine" : "border-black/10 text-ink/55"}`}><input type="radio" name="tip-type" value={type} checked={draft.type === type} onChange={() => setDraft((current) => ({ ...current, type }))} className="sr-only" />{type}</label>)}</div></fieldset>
          <label className="grid gap-2 text-xs font-bold text-ink/65">Title<input autoFocus value={draft.title} onChange={(event) => { setDraft((current) => ({ ...current, title: event.target.value })); setErrors((current) => ({ ...current, title: undefined })); }} maxLength={80} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "tip-title-error" : undefined} className="input rounded-md text-sm font-normal" placeholder="A short, clear heading" />{errors.title && <span id="tip-title-error" className="text-xs font-semibold text-red-700">{errors.title}</span>}</label>
          <label className="grid gap-2 text-xs font-bold text-ink/65">Short description<textarea value={draft.body} onChange={(event) => { setDraft((current) => ({ ...current, body: event.target.value })); setErrors((current) => ({ ...current, body: undefined })); }} maxLength={220} rows={3} aria-invalid={Boolean(errors.body)} aria-describedby={errors.body ? "tip-body-error" : "tip-body-help"} className="min-h-24 w-full resize-y rounded-md border border-black/15 bg-white px-4 py-3 text-sm font-normal leading-6" placeholder="One practical sentence" /><span className="flex justify-between gap-3"><span id={errors.body ? "tip-body-error" : "tip-body-help"} className={errors.body ? "text-red-700" : "font-normal text-ink/35"}>{errors.body ?? "Keep it brief and easy to scan."}</span><span className="font-normal tabular-nums text-ink/35">{draft.body.length}/220</span></span></label>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-black/10 px-4 py-3"><span><span className="block text-sm font-bold">Show on homepage</span><span className="mt-0.5 block text-xs font-normal text-ink/45">You can enable or disable this later.</span></span><input type="checkbox" checked={draft.enabled} onChange={(event) => setDraft((current) => ({ ...current, enabled: event.target.checked }))} className="size-4 accent-wine" /></label>
          <div className="flex flex-col-reverse gap-2 border-t border-black/[.07] pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={closeEditor} className="min-h-11 rounded-md border border-black/10 px-4 text-sm font-bold text-ink/60">Cancel</button><button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-wine px-5 text-sm font-bold text-white hover:bg-wine-dark"><Check size={16} /> Save tip</button></div>
        </form></div>}
    </dialog>

    <dialog ref={deleteDialog} onCancel={(event) => { event.preventDefault(); setDeleteId(null); }} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-black/55 backdrop:backdrop-blur-[2px]">
      {deleteTip && <div className="p-6"><span className="grid size-10 place-items-center rounded-full bg-red-50 text-red-700"><Trash2 size={18} /></span><h2 className="mt-4 text-lg font-bold">Remove this tip?</h2><p className="mt-2 text-sm leading-6 text-ink/55">“{deleteTip.title}” will be removed from Firestore and any active homepage selection.</p><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setDeleteId(null)} className="min-h-11 rounded-md border border-black/10 px-4 text-sm font-bold text-ink/60">Keep tip</button><button type="button" onClick={confirmDelete} className="min-h-11 rounded-md bg-red-700 px-4 text-sm font-bold text-white hover:bg-red-800">Remove tip</button></div></div>}
    </dialog>

    <dialog ref={previewDialog} onCancel={(event) => { event.preventDefault(); setPreviewOpen(false); }} className="m-auto w-[calc(100%-2rem)] max-w-4xl rounded-lg border-0 bg-ink p-0 text-white shadow-2xl backdrop:bg-black/55 backdrop:backdrop-blur-[2px]">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6"><div><h2 className="font-bold">Homepage tips preview</h2><p className="mt-1 text-xs text-white/45">Preview of the saved enabled-tip order.</p></div><button type="button" onClick={() => setPreviewOpen(false)} className="grid size-9 shrink-0 place-items-center rounded-md text-white/55 hover:bg-white/10 hover:text-white" aria-label="Close preview"><X size={19} /></button></div>
      <div className="grid lg:grid-cols-[.75fr_1.25fr]"><div className="bg-wine p-7 sm:p-9"><p className="text-xs font-black uppercase tracking-[.16em] text-white/60">Field notes</p><h3 className="display mt-4 text-4xl">Do&apos;s &amp;<br />don&apos;ts</h3><p className="mt-5 text-sm leading-6 text-white/65">Only enabled tips appear here, in the order you selected.</p></div><div className="divide-y divide-white/10">{activeTips.length ? activeTips.map((tip) => <article key={tip.id} className="grid gap-2 p-6 sm:grid-cols-[6rem_1fr] sm:p-7"><span className={`text-xs font-black uppercase tracking-widest ${tip.type === "Do" ? "text-[#db8298]" : "text-white/40"}`}>{tip.type}</span><div><h4 className="font-bold text-white">{tip.title}</h4><p className="mt-2 text-sm leading-6 text-white/55">{tip.body}</p></div></article>) : <p className="p-8 text-sm leading-6 text-white/55">No tips are currently enabled. Enable a tip to include it in this preview.</p>}</div></div>
    </dialog>
  </>;
}
