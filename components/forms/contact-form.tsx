"use client";
import { Check, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Fields = { name: string; email: string; phone: string; subject: string; message: string };
type Errors = Partial<Record<keyof Fields | "form", string>>;
const initial: Fields = { name: "", email: "", phone: "", subject: "", message: "" };

export function ContactForm() {
  const [fields, setFields] = useState(initial), [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false), [sent, setSent] = useState(false), [companyWebsite, setCompanyWebsite] = useState("");
  const startedAt = useRef(0), submissionKey = useRef("");
  useEffect(() => { startedAt.current = Date.now(); submissionKey.current = crypto.randomUUID(); }, []);
  const update = (key: keyof Fields, value: string) => { setFields(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined, form: undefined })); };
  function validate() {
    const next: Errors = {};
    if (fields.name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) next.email = "Enter a valid email address.";
    if (fields.phone && fields.phone.replace(/\D/g, "").length < 7) next.phone = "Enter a valid phone number.";
    if (fields.subject.trim().length < 3) next.subject = "Enter a subject.";
    if (fields.message.trim().length < 10) next.message = "Enter at least 10 characters.";
    setErrors(next); return Object.keys(next).length === 0;
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!validate()) return; setBusy(true);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ schemaVersion: 1, submissionKey: submissionKey.current, startedAt: startedAt.current, companyWebsite, ...fields }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setErrors(current => ({ ...current, form: result.error ?? "Your message could not be sent." })); return; }
      setSent(true);
    } catch { setErrors(current => ({ ...current, form: "Your message could not be sent. Check your connection and try again." })); }
    finally { setBusy(false); }
  }
  if (sent) return <div role="status" className="rounded-lg border border-emerald-700/20 bg-white p-8 shadow-sm"><Check size={32} className="text-emerald-700"/><h2 className="display mt-5 text-4xl">Message received.</h2><p className="mt-4 leading-7 text-ink/65">FES accepted your message and confirmation email for processing. Please check your inbox and spam folder.</p></div>;
  return <form noValidate onSubmit={submit} className="rounded-lg border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(20,19,21,.08)] sm:p-8">
    <label className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={companyWebsite} onChange={event => setCompanyWebsite(event.target.value)}/></label>
    <div className="grid gap-5 sm:grid-cols-2"><Field label="Full name" error={errors.name}><input className="quote-input" autoComplete="name" value={fields.name} onChange={event => update("name", event.target.value)} maxLength={120}/></Field><Field label="Email address" error={errors.email}><input className="quote-input" type="email" autoComplete="email" value={fields.email} onChange={event => update("email", event.target.value)} maxLength={254}/></Field></div>
    <div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Phone number (optional)" error={errors.phone}><input className="quote-input" type="tel" autoComplete="tel" value={fields.phone} onChange={event => update("phone", event.target.value)} maxLength={40}/></Field><Field label="Subject" error={errors.subject}><input className="quote-input" value={fields.subject} onChange={event => update("subject", event.target.value)} maxLength={160}/></Field></div>
    <div className="mt-5"><Field label="Message" error={errors.message}><textarea className="quote-input resize-y px-4 py-3" rows={7} value={fields.message} onChange={event => update("message", event.target.value)} maxLength={3000}/><span className="text-right text-xs text-ink/35">{fields.message.length}/3000</span></Field></div>
    {errors.form && <p role="alert" className="mt-5 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-800">{errors.form}</p>}
    <button disabled={busy} aria-busy={busy} className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-wine px-6 text-sm font-black uppercase tracking-[.08em] text-white hover:bg-wine-dark disabled:opacity-55">{busy ? "Sending…" : "Send message"}<Send size={16}/></button>
  </form>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="grid gap-2"><span className="label">{label}</span>{children}{error && <span role="alert" className="text-xs font-semibold text-red-700">{error}</span>}</label>; }
