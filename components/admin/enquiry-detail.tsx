"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clipboard, Mail, Phone, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Enquiry, EnquiryStatus } from "@/types/admin";
import { useEnquiryState } from "./enquiry-state";

const statuses: EnquiryStatus[] = ["New", "Reviewing", "Contacted", "Closed"];
const emailIsValid = (value?: string) => Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
const phoneIsValid = (value?: string) => Boolean(value && value.replace(/\D/g, "").length >= 7);

export function EnquiryDetail({ item }: { item: Enquiry }) {
  const { updates, saveUpdate } = useEnquiryState();
  const saved = { status: updates[item.id]?.status ?? item.status, note: updates[item.id]?.note ?? item.note ?? "" };
  const [status, setStatus] = useState(saved.status);
  const [note, setNote] = useState(saved.note);
  const [savedMessage, setSavedMessage] = useState(false);
  const [copied, setCopied] = useState<"email" | "phone" | null>(null);
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isDirty = status !== saved.status || note !== saved.note;
  const noteError = note.length > 2000 ? "Keep internal notes under 2,000 characters." : "";

  useEffect(() => {
    if (activeImage === null) return;
    const previousOverflow = document.body.style.overflow;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveImage(null);
      if (event.key === "ArrowRight") setActiveImage(value => value === null ? null : (value + 1) % item.attachments.length);
      if (event.key === "ArrowLeft") setActiveImage(value => value === null ? null : (value - 1 + item.attachments.length) % item.attachments.length);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); };
  }, [activeImage, item.attachments.length]);

  const copy = async (kind: "email" | "phone", value: string) => { try { await navigator.clipboard.writeText(value); setCopied(kind); window.setTimeout(() => setCopied(null), 1800); } catch { setCopied(null); } };
  const revert = () => { setStatus(saved.status); setNote(saved.note); setSavedMessage(false); };
  const save = () => { if (noteError || !isDirty) return; saveUpdate(item.id, { status, note: note.trim() }); setNote(note.trim()); setSavedMessage(true); };

  return <>
    <Link href="/admin/enquiries" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-wine hover:underline"><ArrowLeft size={16}/> Back to Quote Requests</Link>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="grid gap-5">
        <Section title="Customer information" description="Contact details supplied with this mock request.">
          <Row label="Customer name" value={item.name}/><Row label="Email address" value={item.email}/><Row label="Phone number" value={item.phone}/><Row label="Preferred contact" value={item.preferredContact}/>
          {(emailIsValid(item.email) || phoneIsValid(item.phone)) && <div className="mt-5 flex flex-wrap gap-2 border-t border-black/[.07] pt-5">
            {emailIsValid(item.email) && <><a href={`mailto:${item.email}`} className="contact-button bg-wine text-white"><Mail size={16}/> Email customer</a><button type="button" onClick={() => copy("email", item.email!)} className="contact-button border border-black/10 bg-white text-ink"><Clipboard size={16}/> {copied === "email" ? "Email copied" : "Copy email"}</button></>}
            {phoneIsValid(item.phone) && <><a href={`tel:${item.phone}`} className="contact-button bg-ink text-white"><Phone size={16}/> Call customer</a><button type="button" onClick={() => copy("phone", item.phone!)} className="contact-button border border-black/10 bg-white text-ink"><Clipboard size={16}/> {copied === "phone" ? "Phone copied" : "Copy phone"}</button></>}
          </div>}
        </Section>
        <Section title="Job information">
          <div className="grid sm:grid-cols-2"><Row label="Requested service" value={item.service}/><Row label="Property type" value={item.propertyType}/><Row label="General location" value={item.location}/><Row label="Submitted" value={item.submittedAt}/><Row label="Enquiry reference" value={item.id}/></div>
          <div className="mt-5 rounded-md bg-paper p-4 sm:p-5"><p className="text-[.65rem] font-black uppercase tracking-[.12em] text-ink/40">Work description</p><p className="mt-2 text-sm leading-6 text-ink/75">{item.description}</p></div>
        </Section>
        <Section title="Attached photographs" description={`${item.attachments.length} ${item.attachments.length === 1 ? "image" : "images"}`}>
          {item.attachments.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{item.attachments.map((src, index) => <button type="button" key={`${src}-${index}`} onClick={() => setActiveImage(index)} className="group relative aspect-[4/3] overflow-hidden rounded-md border border-black/10 bg-ink focus-visible:outline-wine" aria-label={`Open photograph ${index + 1} of ${item.attachments.length}`}><Image src={src} alt={`Mock enquiry photograph ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 30vw" className="object-cover transition-transform group-hover:scale-[1.03]"/><span className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2 text-left text-xs font-bold text-white">Photo {index + 1}</span></button>)}</div> : <div className="rounded-md border border-dashed border-black/15 bg-paper/60 px-5 py-8 text-center"><p className="font-bold">No photographs attached</p><p className="mt-2 text-sm text-ink/50">This customer did not include images with the request.</p></div>}
        </Section>
      </div>
      <aside className="rounded-lg border border-black/[.08] bg-white p-5 shadow-[0_10px_35px_rgba(20,19,21,.055)] xl:sticky xl:top-24">
        <div className="flex items-center justify-between gap-3"><div><p className="font-bold">Internal management</p><p className="mt-1 text-xs text-ink/45">Private admin information</p></div>{isDirty && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[.62rem] font-black uppercase tracking-wider text-amber-700">Unsaved</span>}</div>
        <label className="mt-5 grid gap-2 text-xs font-bold text-ink/60">Enquiry status<select value={status} onChange={event => { setStatus(event.target.value as EnquiryStatus); setSavedMessage(false); }} className="input rounded-md text-sm text-ink">{statuses.map(value => <option key={value}>{value}</option>)}</select></label>
        <label className="mt-5 grid gap-2 text-xs font-bold text-ink/60"><span className="flex justify-between"><span>Internal notes</span><span className={note.length > 2000 ? "text-red-600" : "font-normal text-ink/35"}>{note.length}/2000</span></span><textarea value={note} onChange={event => { setNote(event.target.value); setSavedMessage(false); }} rows={8} className="input rounded-md px-3 py-3 text-sm leading-6 text-ink" placeholder="Add a private note for the FES team." aria-describedby={noteError ? "note-error" : "note-help"}/></label>
        {noteError ? <p id="note-error" className="mt-2 text-xs font-semibold text-red-700">{noteError}</p> : <p id="note-help" className="mt-2 text-xs leading-5 text-ink/40">Notes remain in this browser preview only.</p>}
        <div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={revert} disabled={!isDirty} className="min-h-11 rounded-md border border-black/10 px-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40">Cancel / Revert</button><button type="button" onClick={save} disabled={!isDirty || Boolean(noteError)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-wine px-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><Save size={16}/> Save changes</button></div>
        {savedMessage && <p className="mt-4 flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-xs leading-5 text-emerald-800"><Check size={15} className="mt-0.5 shrink-0"/> Saved in this browser preview. Nothing was sent to a server.</p>}
        <div className="mt-5 border-t border-black/[.07] pt-4"><p className="text-[.65rem] font-black uppercase tracking-[.12em] text-ink/35">Activity</p><p className="mt-2 text-xs leading-5 text-ink/50">Request received {item.submittedAt}.</p>{updates[item.id]?.updatedAt && <p className="mt-1 text-xs leading-5 text-ink/50">Preview updated {new Date(updates[item.id]!.updatedAt!).toLocaleString()}.</p>}</div>
      </aside>
    </div>
    {activeImage !== null && <div role="dialog" aria-modal="true" aria-label={`Photograph ${activeImage + 1} of ${item.attachments.length}`} className="fixed inset-0 z-[70] grid place-items-center bg-black/90 p-4 sm:p-8"><button ref={closeRef} type="button" onClick={() => setActiveImage(null)} className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white text-ink" aria-label="Close image preview"><X size={21}/></button><div className="relative h-[min(75vh,48rem)] w-[min(90vw,72rem)]"><Image src={item.attachments[activeImage]} alt={`Full-size mock enquiry photograph ${activeImage + 1}`} fill sizes="90vw" className="object-contain"/></div>{item.attachments.length > 1 && <><button type="button" onClick={() => setActiveImage((activeImage - 1 + item.attachments.length) % item.attachments.length)} className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-ink sm:left-6" aria-label="Previous image"><ChevronLeft/></button><button type="button" onClick={() => setActiveImage((activeImage + 1) % item.attachments.length)} className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-ink sm:right-6" aria-label="Next image"><ChevronRight/></button></>}<p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white">{activeImage + 1} / {item.attachments.length}</p></div>}
  </>;
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) { return <section className="rounded-lg border border-black/[.075] bg-white p-5 shadow-[0_1px_2px_rgba(20,19,21,.025)] sm:p-7"><div className="flex items-baseline justify-between gap-4"><h2 className="text-lg font-bold tracking-tight">{title}</h2>{description && <p className="text-xs text-ink/40">{description}</p>}</div><div className="mt-5">{children}</div></section>; }
function Row({ label, value }: { label: string; value?: string }) { return <div className="border-t border-black/[.07] py-3 first:border-0 sm:pr-5"><p className="text-[.65rem] font-black uppercase tracking-[.1em] text-ink/35">{label}</p><p className={`mt-1 text-sm ${value ? "text-ink/75" : "italic text-ink/35"}`}>{value || "Not provided"}</p></div>; }
