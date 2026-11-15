"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, Check, ExternalLink, RotateCcw, Share2 } from "lucide-react";
import type { BusinessSettings } from "@/types/admin";
import type { BusinessSettingsState } from "@/lib/settings/schema";

type SectionId = "business" | "social";
type Errors = Record<string, string>;

const sections = [
  { id: "business" as const, label: "Business information", short: "Business", icon: Building2 },
  { id: "social" as const, label: "Social media & links", short: "Social", icon: Share2 },
];

const isSafeUrl = (value: string) => {
  if (!value.trim()) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
};
const isPhone = (value: string) => !value.trim() || (/^[+()\-\s\d]{7,24}$/.test(value) && value.replace(/\D/g, "").length >= 7);

export function SettingsForm({ initialState }: { initialState: BusinessSettingsState }) {
  const [activeSection, setActiveSection] = useState<SectionId>("business");
  const [settings, setSettings] = useState<BusinessSettings>(() => structuredClone(initialState.settings));
  const [baseline, setBaseline] = useState<BusinessSettings>(() => structuredClone(initialState.settings));
  const [approvalStatus, setApprovalStatus] = useState(initialState.approvalStatus);
  const [baselineApprovalStatus, setBaselineApprovalStatus] = useState(initialState.approvalStatus);
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState<"" | "saved" | "reverted">("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const saveGuard = useRef(false);
  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(baseline) || approvalStatus !== baselineApprovalStatus, [settings, baseline, approvalStatus, baselineApprovalStatus]);

  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);

  const update = <K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) => {
    setSettings(current => ({ ...current, [key]: value }));
    setNotice("");
    setSaveError("");
  };
  const updateSocial = (key: keyof BusinessSettings["socialLinks"], value: string) => update("socialLinks", { ...settings.socialLinks, [key]: value });

  function validate() {
    const next: Errors = {};
    if (!settings.businessName.trim()) next.businessName = "Enter the public business name.";
    if (settings.publicEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.publicEmail)) next.publicEmail = "Enter a valid email address.";
    if (!isPhone(settings.publicPhone)) next.publicPhone = "Enter a valid telephone number (at least 7 digits).";
    if (!isPhone(settings.whatsappNumber)) next.whatsappNumber = "Enter a valid WhatsApp number (at least 7 digits).";
    if (!isSafeUrl(settings.googleMapsUrl)) next.googleMapsUrl = "Use a complete http:// or https:// link.";
    Object.entries(settings.socialLinks).forEach(([key, value]) => { if (!isSafeUrl(value)) next[`social-${key}`] = "Use a complete http:// or https:// link."; });
    settings.businessHours.forEach((entry, index) => {
      if (entry.open && (!entry.opensAt || !entry.closesAt)) next[`hours-${index}`] = "Add both opening and closing times.";
      if (entry.open && entry.opensAt >= entry.closesAt) next[`hours-${index}`] = "Closing time must be after opening time.";
    });
    if (approvalStatus === "Approved" && !settings.publicEmail && !settings.publicPhone) next.publicEmail = "Approved settings require a public email or telephone number.";
    if (approvalStatus === "Approved" && !settings.publicLocation.trim()) next.publicLocation = "Approved settings require a confirmed public location.";
    setErrors(next);
    return next;
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (saveGuard.current) return;
    setSaveError("");
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      const firstKey = Object.keys(nextErrors)[0];
      setActiveSection(firstKey.startsWith("social-") ? "social" : "business");
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-error-key="${firstKey}"]`)?.focus());
      return;
    }
    saveGuard.current = true; setSaving(true); setSaveError("");
    try {
      const response = await fetch("/api/admin/settings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ approvalStatus, settings }) });
      if (!response.ok) throw new Error((await response.json()).error ?? "Unable to save business settings.");
      setBaseline(structuredClone(settings)); setBaselineApprovalStatus(approvalStatus); setNotice("saved");
    } catch (cause) { setSaveError(cause instanceof Error ? cause.message : "Unable to save business settings."); }
    finally { saveGuard.current = false; setSaving(false); }
  }

  function revertAll() {
    setSettings(structuredClone(baseline));
    setApprovalStatus(baselineApprovalStatus);
    setErrors({}); setSaveError(""); setNotice("reverted");
  }
  function handleTabKey(event: React.KeyboardEvent, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? sections.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + sections.length) % sections.length;
    setActiveSection(sections[nextIndex].id); tabRefs.current[nextIndex]?.focus();
  }

  return <form onSubmit={save} noValidate className="pb-28">
    <div className="sticky top-16 z-20 -mx-4 border-y border-black/[.07] bg-[#f6f5f3]/95 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div role="tablist" aria-label="Settings sections" className="grid grid-cols-2 gap-1 rounded-lg border border-black/[.07] bg-white p-1 shadow-sm">
        {sections.map(({ id, label, short, icon: Icon }, index) => <button key={id} ref={node => { tabRefs.current[index] = node; }} type="button" role="tab" id={`tab-${id}`} aria-controls={`panel-${id}`} aria-selected={activeSection === id} tabIndex={activeSection === id ? 0 : -1} onKeyDown={event => handleTabKey(event, index)} onClick={() => setActiveSection(id)} className={`flex min-h-11 items-center justify-center gap-2 rounded-md px-2 text-xs font-bold transition-colors ${activeSection === id ? "bg-wine text-white shadow-sm" : "text-ink/50 hover:bg-black/[.035] hover:text-ink"}`}><Icon size={16}/><span className="hidden md:inline">{label}</span><span className="md:hidden">{short}</span></button>)}
      </div>
    </div>

    <div className="mt-6">
      <SectionPanel id="business" active={activeSection} title="Business information" intro="These details are intended for public display on the FES website. Optional fields can stay empty until they are confirmed.">
        <div className="grid gap-5 md:grid-cols-2">
          <Field id="businessName" label="Business / site name" value={settings.businessName} onChange={value => update("businessName", value)} required error={errors.businessName}/>
          <Field id="publicEmail" label="Public contact email" type="email" inputMode="email" autoComplete="email" value={settings.publicEmail} onChange={value => update("publicEmail", value)} placeholder="Awaiting confirmation" error={errors.publicEmail}/>
          <Field id="publicPhone" label="Public telephone number" type="tel" inputMode="tel" autoComplete="tel" value={settings.publicPhone} onChange={value => update("publicPhone", value)} placeholder="Awaiting confirmation" error={errors.publicPhone}/>
          <Field id="whatsappNumber" label="WhatsApp number" hint="Optional. Include the country code." type="tel" inputMode="tel" value={settings.whatsappNumber} onChange={value => update("whatsappNumber", value)} placeholder="e.g. +1 868 …" error={errors.whatsappNumber}/>
          <Field id="publicLocation" label="Business address or general location" value={settings.publicLocation} onChange={value => update("publicLocation", value)} placeholder="Awaiting confirmation" error={errors.publicLocation}/>
          <Field id="googleMapsUrl" label="Google Maps location link" hint="Optional public map or directions link." type="url" inputMode="url" value={settings.googleMapsUrl} onChange={value => update("googleMapsUrl", value)} placeholder="https://maps.google.com/…" error={errors.googleMapsUrl}/>
        </div>
        <fieldset className="mt-8 border-t border-black/[.07] pt-7"><legend className="font-bold text-ink">Opening hours</legend><p className="mt-1 text-sm leading-6 text-ink/45">Switch off days when the business is closed. Approved hours are available to the public business-settings repository.</p>
          <div className="mt-5 divide-y divide-black/[.06] rounded-lg border border-black/[.08]">
            {settings.businessHours.map((entry, index) => <div key={entry.day} className="grid gap-3 p-4 sm:grid-cols-[8rem_1fr] sm:items-center"><label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={entry.open} onChange={event => update("businessHours", settings.businessHours.map((item, itemIndex) => itemIndex === index ? { ...item, open: event.target.checked } : item))} className="size-4 accent-wine"/><span>{entry.day}</span></label><div className="flex min-w-0 flex-wrap items-center gap-2">{entry.open ? <><TimeInput label={`${entry.day} opening time`} value={entry.opensAt} onChange={value => update("businessHours", settings.businessHours.map((item, itemIndex) => itemIndex === index ? { ...item, opensAt: value } : item))}/><span className="text-xs text-ink/35">to</span><TimeInput label={`${entry.day} closing time`} value={entry.closesAt} onChange={value => update("businessHours", settings.businessHours.map((item, itemIndex) => itemIndex === index ? { ...item, closesAt: value } : item))}/>{errors[`hours-${index}`] && <p role="alert" tabIndex={-1} data-error-key={`hours-${index}`} className="w-full text-xs font-semibold text-red-700">{errors[`hours-${index}`]}</p>}</> : <span className="text-sm text-ink/38">Closed</span>}</div></div>)}
          </div>
        </fieldset>
      </SectionPanel>

      <SectionPanel id="social" active={activeSection} title="Social media & links" intro="Only complete public profile URLs should be added. Empty links will be omitted when this interface is connected to the website.">
        <div className="grid gap-5 md:grid-cols-2">
          <UrlField id="facebook" label="Facebook" value={settings.socialLinks.facebook} onChange={value => updateSocial("facebook", value)} error={errors["social-facebook"]} placeholder="https://facebook.com/…"/>
          <UrlField id="instagram" label="Instagram" value={settings.socialLinks.instagram} onChange={value => updateSocial("instagram", value)} error={errors["social-instagram"]} placeholder="https://instagram.com/…"/>
          <UrlField id="linkedin" label="LinkedIn" value={settings.socialLinks.linkedin} onChange={value => updateSocial("linkedin", value)} error={errors["social-linkedin"]} placeholder="https://linkedin.com/company/…"/>
          <UrlField id="googleBusiness" label="Google Business Profile" value={settings.socialLinks.googleBusiness} onChange={value => updateSocial("googleBusiness", value)} error={errors["social-googleBusiness"]} placeholder="https://g.page/…"/>
          <UrlField id="whatsapp" label="WhatsApp contact link" value={settings.socialLinks.whatsapp} onChange={value => updateSocial("whatsapp", value)} error={errors["social-whatsapp"]} placeholder="https://wa.me/…"/>
        </div>
      </SectionPanel>

    </div>

    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white/95 px-4 py-3 shadow-[0_-12px_35px_rgba(20,19,21,.08)] backdrop-blur-xl lg:left-[17.5rem] sm:px-6 lg:px-8"><div className="mx-auto flex max-w-[84rem] flex-wrap items-center justify-between gap-3"><div aria-live="polite" className="min-h-6 text-xs font-bold">{saveError ? <span className="text-red-700">{saveError}</span> : dirty ? <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-amber-500"/>Unsaved changes</span> : notice === "saved" ? <span className="flex items-center gap-2"><Check size={16} className="text-emerald-600"/>Settings saved securely</span> : notice === "reverted" ? <span className="flex items-center gap-2"><RotateCcw size={15}/>Changes reverted</span> : <span className="text-ink/40">No unsaved changes</span>}</div><div className="flex flex-wrap gap-2"><label className="grid gap-1 text-[.62rem] font-black uppercase tracking-wider text-ink/45">Approval state<select aria-label="Approval state" value={approvalStatus} onChange={event=>{setApprovalStatus(event.target.value as "Draft"|"Approved");setNotice("");setSaveError("")}} className="min-h-11 rounded-md border border-black/10 bg-white px-3 text-sm font-bold normal-case tracking-normal text-ink"><option>Draft</option><option>Approved</option></select></label><button type="button" onClick={revertAll} disabled={!dirty||saving} className="min-h-11 self-end rounded-md border border-black/10 px-4 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-40">Cancel / Revert</button><button type="submit" disabled={!dirty||saving} className="min-h-11 self-end rounded-md bg-wine px-5 text-sm font-bold text-white shadow-sm hover:bg-wine-dark disabled:cursor-not-allowed disabled:opacity-40">{saving?"Saving…":"Save changes"}</button></div></div></div>
  </form>;
}

function SectionPanel({ id, active, title, intro, children }: { id: SectionId; active: SectionId; title: string; intro: string; children: React.ReactNode }) {
  return <section id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={active !== id} className="rounded-xl border border-black/[.075] bg-white p-5 shadow-[0_1px_2px_rgba(20,19,21,.025)] sm:p-7"><div className="mb-7 border-b border-black/[.07] pb-6"><h2 className="text-xl font-bold tracking-[-.02em]">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-ink/48">{intro}</p></div>{children}</section>;
}

function Field({ id, label, value, onChange, hint, error, type = "text", ...props }: { id: string; label: string; value: string; onChange: (value: string) => void; hint?: string; error?: string; type?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "onChange" | "type">) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return <label htmlFor={id} className="grid content-start gap-2 text-sm font-bold"><span>{label}{props.required && <span className="ml-1 text-wine" aria-hidden="true">*</span>}</span>{hint && <span id={`${id}-hint`} className="text-xs font-normal leading-5 text-ink/42">{hint}</span>}<input id={id} data-error-key={id} type={type} value={value} onChange={event => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={`input rounded-md ${error ? "border-red-400 bg-red-50/25" : ""}`} {...props}/>{error && <span id={`${id}-error`} role="alert" className="text-xs font-semibold text-red-700">{error}</span>}</label>;
}

function UrlField({ id, label, value, onChange, error, placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; placeholder: string }) {
  return <div><Field id={`social-${id}`} label={label} type="url" inputMode="url" value={value} onChange={onChange} placeholder={placeholder} error={error}/>{value && isSafeUrl(value) && <a href={value} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-wine hover:underline"><ExternalLink size={13}/>Open link preview</a>}</div>;
}

function TimeInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label><span className="sr-only">{label}</span><input type="time" aria-label={label} value={value} onChange={event => onChange(event.target.value)} className="min-h-10 min-w-0 rounded-md border border-black/15 bg-white px-2 text-sm sm:px-3"/></label>; }
