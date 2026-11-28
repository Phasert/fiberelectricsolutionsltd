"use client";
import { formatFibreText } from "@/lib/site-content/spelling";
/* eslint-disable @next/next/no-img-element -- authenticated private images cannot use the server-side Next optimizer */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clipboard, Mail, Phone, Save, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Enquiry, EnquiryNote, EnquiryStatus } from "@/types/admin";
import { formatQuoteServices } from "@/lib/quotes/service-names";
import { useMutationGuard } from "@/components/ui/use-mutation-guard";

const statuses: EnquiryStatus[] = ["New", "In Review", "Contacted", "Quoted", "Closed"];
const emailIsValid = (value?: string) => Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
const phoneIsValid = (value?: string) => Boolean(value && value.replace(/\D/g, "").length >= 7);

export function EnquiryDetail({ item }: { item: Enquiry }) {
  const router = useRouter();
  const deletion = useMutationGuard();
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [savedStatus,setSavedStatus]=useState(item.status);
  const [status, setStatus] = useState(item.status);
  const [note, setNote] = useState("");
  const [notes,setNotes]=useState<EnquiryNote[]>(item.notes??[]);
  const [busy,setBusy]=useState(false);
  const [saveError,setSaveError]=useState("");
  const [savedMessage, setSavedMessage] = useState(false);
  const [copied, setCopied] = useState<"email" | "phone" | null>(null);
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isDirty = status !== savedStatus || Boolean(note.trim());
  const noteError = note.length > 2000 ? "Keep internal notes under 2,000 characters." : "";

  useEffect(() => {
    if (activeImage === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveImage(null);
      if (event.key === "ArrowRight") setActiveImage(value => value === null ? null : (value + 1) % item.attachments.length);
      if (event.key === "ArrowLeft") setActiveImage(value => value === null ? null : (value - 1 + item.attachments.length) % item.attachments.length);
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [activeImage, item.attachments.length]);

  const copy = async (kind: "email" | "phone", value: string) => { try { await navigator.clipboard.writeText(value); setCopied(kind); window.setTimeout(() => setCopied(null), 1800); } catch { setCopied(null); } };
  const revert = () => { setStatus(savedStatus); setNote(""); setSavedMessage(false);setSaveError(""); };
  const save = async () => {if(noteError||!isDirty||busy)return;setBusy(true);setSaveError("");setSavedMessage(false);try{if(status!==savedStatus){const response=await fetch(`/api/admin/enquiries/${encodeURIComponent(item.id)}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status})});if(!response.ok)throw new Error((await response.json().catch(()=>({}))).error??"Status could not be saved.");setSavedStatus(status);}if(note.trim()){const response=await fetch(`/api/admin/enquiries/${encodeURIComponent(item.id)}/notes`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({body:note.trim()})}),result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error??"Note could not be saved.");setNotes(current=>[...current,result.note]);setNote("");}setSavedMessage(true);}catch(error){setSaveError(error instanceof Error?error.message:"Changes could not be saved.");}finally{setBusy(false);}};

  async function remove() {
    await deletion.run("delete", async () => {
      setDeleting(true);
      setDeleteError("");
      try {
        const response = await fetch(`/api/admin/enquiries/${encodeURIComponent(item.id)}`, { method: "DELETE" });
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error ?? "Could not delete the quote request. Please try again.");
        }
        router.replace("/admin/enquiries");
        router.refresh();
      } catch (error) {
        setDeleteError(error instanceof Error ? error.message : "Could not delete the quote request. Please try again.");
        setDeleting(false);
      }
    });
  }

  return <>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <Link href="/admin/enquiries" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-wine hover:underline"><ArrowLeft size={16}/> Back to Quote Requests</Link>
      <button type="button" disabled={busy || deleting} onClick={() => { setDeleteError(""); deleteDialog.current?.showModal(); }} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-40">
        <Trash2 size={16} aria-hidden="true"/> Delete request
      </button>
    </div>
    <dialog
      ref={deleteDialog}
      role="alertdialog"
      aria-labelledby="delete-request-title"
      aria-describedby="delete-request-description"
      onCancel={event => { if (deleting || deletion.isActive("delete")) event.preventDefault(); }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-black/55 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-6">
        <span className="grid size-10 place-items-center rounded-full bg-red-50 text-red-700"><Trash2 size={18} aria-hidden="true"/></span>
        <h2 id="delete-request-title" className="mt-4 text-lg font-bold">Delete this quote request?</h2>
        <p id="delete-request-description" className="mt-2 text-sm leading-6 text-ink/65">
          Are you sure you want to delete the request from <strong>{item.name}</strong>? This permanently deletes the request, internal notes and attached photos. It cannot be undone.
        </p>
        {deleteError && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{deleteError}</p>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" autoFocus disabled={deleting} onClick={() => deleteDialog.current?.close()} className="min-h-11 rounded-md border border-black/10 px-4 text-sm font-bold text-ink/70 disabled:opacity-40">Keep request</button>
          <button type="button" disabled={deleting} aria-busy={deleting} onClick={() => void remove()} className="min-h-11 rounded-md bg-red-700 px-4 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-60">{deleting ? "Deleting…" : "Permanently delete"}</button>
        </div>
      </div>
    </dialog>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="grid gap-5">
        <Section title="Customer information" description="Contact details supplied with this request.">
          <Row label="Customer name" value={item.name}/><Row label="Email address" value={item.email}/><Row label="Phone number" value={item.phone}/><Row label="Preferred contact" value={item.preferredContact}/>
          {(emailIsValid(item.email) || phoneIsValid(item.phone)) && <div className="mt-5 flex flex-wrap gap-2 border-t border-black/[.07] pt-5">
            {emailIsValid(item.email) && <><a href={`mailto:${item.email}`} className="contact-button bg-wine text-white"><Mail size={16}/> Email customer</a><button type="button" onClick={() => copy("email", item.email!)} className="contact-button border border-black/10 bg-white text-ink"><Clipboard size={16}/> {copied === "email" ? "Email copied" : "Copy email"}</button></>}
            {phoneIsValid(item.phone) && <><a href={`tel:${item.phone}`} className="contact-button bg-ink text-white"><Phone size={16}/> Call customer</a><button type="button" onClick={() => copy("phone", item.phone!)} className="contact-button border border-black/10 bg-white text-ink"><Clipboard size={16}/> {copied === "phone" ? "Phone copied" : "Copy phone"}</button></>}
          </div>}
        </Section>
        <Section title="Job information">
          <div className="grid sm:grid-cols-2"><Row label="Requested service" value={formatFibreText(item.service)}/><Row label="Specific services" value={formatQuoteServices(item.selectedServiceIds)}/><Row label="Property type" value={item.propertyType}/><Row label="General location" value={item.location}/><Row label="Submitted" value={item.submittedAt}/><Row label="Enquiry reference" value={item.id}/></div>
          <div className="mt-5 rounded-md bg-paper p-4 sm:p-5"><p className="text-[.65rem] font-black uppercase tracking-[.12em] text-ink/40">Work description</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/75">{item.description}</p></div>
          {item.additionalNotes&&<div className="mt-3 rounded-md border border-black/[.07] p-4 sm:p-5"><p className="text-[.65rem] font-black uppercase tracking-[.12em] text-ink/40">Customer notes</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/75">{item.additionalNotes}</p></div>}
        </Section>
        <Section title="Attached photographs" description={`${item.attachments.length} ${item.attachments.length === 1 ? "image" : "images"}`}>
          {item.attachments.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{(item.attachmentDetails??item.attachments.map((url,index)=>({id:String(index),url,mimeType:"",sizeBytes:0,width:0,height:0,status:""}))).map((attachment, index) => <article key={attachment.id}><button type="button" onClick={() => setActiveImage(index)} className="group relative aspect-[4/3] w-full overflow-hidden rounded-md border border-black/10 bg-ink focus-visible:outline-wine" aria-label={`Open photograph ${index + 1} of ${item.attachments.length}`}><img src={attachment.url} alt={`Customer photograph ${index + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"/><span className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2 text-left text-xs font-bold text-white">Photo {index + 1}</span></button><p className="mt-2 text-[.68rem] leading-5 text-ink/45">{attachment.mimeType || "Image"} · {attachment.width}×{attachment.height} · {Math.max(1,Math.round(attachment.sizeBytes/1024))} KB · {attachment.status || "Stored"}</p></article>)}</div> : <div className="rounded-md border border-dashed border-black/15 bg-paper/60 px-5 py-8 text-center"><p className="font-bold">No photographs attached</p><p className="mt-2 text-sm text-ink/50">This customer did not include images with the request.</p></div>}
        </Section>
        <Section title="Privacy and retention" description="Recorded with this request">
          <div className="grid sm:grid-cols-2"><Row label="Privacy acknowledgement" value={item.consentAcknowledged?"Acknowledged":"Not recorded"}/><Row label="Consent wording version" value={item.consentVersion}/><Row label="Photograph acknowledgement" value={item.photoConsentAcknowledged?"Acknowledged":item.attachments.length?"Not recorded":"Not applicable"}/><Row label="Acknowledged at" value={item.consentAcknowledgedAt?new Date(item.consentAcknowledgedAt).toLocaleString():undefined}/><Row label="Retention deadline" value={item.retentionUntil?new Date(item.retentionUntil).toLocaleString():undefined}/></div>
        </Section>
      </div>
      <aside className="rounded-lg border border-black/[.08] bg-white p-5 shadow-[0_10px_35px_rgba(20,19,21,.055)] xl:sticky xl:top-24">
        <div className="flex items-center justify-between gap-3"><div><p className="font-bold">Internal management</p><p className="mt-1 text-xs text-ink/45">Private admin information</p></div>{isDirty && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[.62rem] font-black uppercase tracking-wider text-amber-700">Unsaved</span>}</div>
        <label className="mt-5 grid gap-2 text-xs font-bold text-ink/60">Enquiry status<select value={status} onChange={event => { setStatus(event.target.value as EnquiryStatus); setSavedMessage(false); }} className="input rounded-md text-sm text-ink">{statuses.map(value => <option key={value}>{value}</option>)}</select></label>
        <label className="mt-5 grid gap-2 text-xs font-bold text-ink/60"><span className="flex justify-between"><span>Internal notes</span><span className={note.length > 2000 ? "text-red-600" : "font-normal text-ink/35"}>{note.length}/2000</span></span><textarea value={note} onChange={event => { setNote(event.target.value); setSavedMessage(false); }} rows={8} className="input rounded-md px-3 py-3 text-sm leading-6 text-ink" placeholder="Add a private note for the FES team." aria-describedby={noteError ? "note-error" : "note-help"}/></label>
        {noteError ? <p id="note-error" className="mt-2 text-xs font-semibold text-red-700">{noteError}</p> : <p id="note-help" className="mt-2 text-xs leading-5 text-ink/40">Notes are private and record the administrator and time.</p>}
        <div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={revert} disabled={!isDirty||busy} className="min-h-11 rounded-md border border-black/10 px-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40">Cancel / Revert</button><button type="button" onClick={()=>void save()} disabled={!isDirty || Boolean(noteError)||busy} aria-busy={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-wine px-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><Save size={16}/> {busy?"Saving…":"Save changes"}</button></div>
        {saveError&&<p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-xs leading-5 text-red-800">{saveError}</p>}
        {savedMessage && <p className="mt-4 flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-xs leading-5 text-emerald-800"><Check size={15} className="mt-0.5 shrink-0"/> Changes saved securely.</p>}
        <div className="mt-5 border-t border-black/[.07] pt-4"><p className="text-[.65rem] font-black uppercase tracking-[.12em] text-ink/35">Activity</p><p className="mt-2 text-xs leading-5 text-ink/50">Request received {item.submittedAt}.</p>{notes.map(entry=><div key={entry.id} className="mt-3 rounded-md bg-paper p-3"><p className="whitespace-pre-wrap text-xs leading-5 text-ink/70">{entry.body}</p><p className="mt-2 text-[.65rem] text-ink/40">{entry.authorEmail} · {new Date(entry.createdAt).toLocaleString()}</p></div>)}</div>
      </aside>
    </div>
    {activeImage !== null && <div role="dialog" aria-modal="true" aria-label={`Photograph ${activeImage + 1} of ${item.attachments.length}`} className="fixed inset-0 z-[70] grid place-items-center bg-black/90 p-4 sm:p-8"><button ref={closeRef} type="button" onClick={() => setActiveImage(null)} className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white text-ink" aria-label="Close image preview"><X size={21}/></button><div className="h-[min(75vh,48rem)] w-[min(90vw,72rem)]"><img src={item.attachments[activeImage]} alt={`Full-size customer photograph ${activeImage + 1}`} className="h-full w-full object-contain"/></div>{item.attachments.length > 1 && <><button type="button" onClick={() => setActiveImage((activeImage - 1 + item.attachments.length) % item.attachments.length)} className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-ink sm:left-6" aria-label="Previous image"><ChevronLeft/></button><button type="button" onClick={() => setActiveImage((activeImage + 1) % item.attachments.length)} className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-ink sm:right-6" aria-label="Next image"><ChevronRight/></button></>}<p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white">{activeImage + 1} / {item.attachments.length}</p></div>}
  </>;
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) { return <section className="rounded-lg border border-black/[.075] bg-white p-5 shadow-[0_1px_2px_rgba(20,19,21,.025)] sm:p-7"><div className="flex items-baseline justify-between gap-4"><h2 className="text-lg font-bold tracking-tight">{title}</h2>{description && <p className="text-xs text-ink/40">{description}</p>}</div><div className="mt-5">{children}</div></section>; }
function Row({ label, value }: { label: string; value?: string }) { return <div className="border-t border-black/[.07] py-3 first:border-0 sm:pr-5"><p className="text-[.65rem] font-black uppercase tracking-[.1em] text-ink/35">{label}</p><p className={`mt-1 text-sm ${value ? "text-ink/75" : "italic text-ink/35"}`}>{value || "Not provided"}</p></div>; }
