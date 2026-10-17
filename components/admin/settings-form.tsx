"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, Check, ExternalLink, ImageIcon, Info, RotateCcw, Search, Share2, Upload, X } from "lucide-react";
import Image from "next/image";
import { businessSettings } from "@/data/admin-mock";
import type { BusinessSettings } from "@/types/admin";

type SectionId = "business" | "social" | "branding" | "search";
type Errors = Record<string, string>;
type PreviewFile = { file: File; url: string } | null;

const sections = [
  { id: "business" as const, label: "Business information", short: "Business", icon: Building2 },
  { id: "social" as const, label: "Social media & links", short: "Social", icon: Share2 },
  { id: "branding" as const, label: "Branding", short: "Branding", icon: ImageIcon },
  { id: "search" as const, label: "Search appearance", short: "Search", icon: Search },
];

const cloneSettings = (): BusinessSettings => structuredClone(businessSettings);
const isSafeUrl = (value: string) => {
  if (!value.trim()) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
};
const isPhone = (value: string) => !value.trim() || (/^[+()\-\s\d]{7,24}$/.test(value) && value.replace(/\D/g, "").length >= 7);

export function SettingsForm() {
  const [activeSection, setActiveSection] = useState<SectionId>("business");
  const [settings, setSettings] = useState<BusinessSettings>(cloneSettings);
  const [baseline, setBaseline] = useState<BusinessSettings>(cloneSettings);
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState<"" | "saved" | "reverted">("");
  const [logoPreview, setLogoPreview] = useState<PreviewFile>(null);
  const [faviconPreview, setFaviconPreview] = useState<PreviewFile>(null);
  const [baselineBrandingKey, setBaselineBrandingKey] = useState(":|:");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const brandingKey = `${logoPreview?.file.name ?? ""}:${logoPreview?.file.size ?? ""}|${faviconPreview?.file.name ?? ""}:${faviconPreview?.file.size ?? ""}`;
  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(baseline) || brandingKey !== baselineBrandingKey, [settings, baseline, brandingKey, baselineBrandingKey]);

  useEffect(() => () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview.url);
    if (faviconPreview) URL.revokeObjectURL(faviconPreview.url);
  }, [logoPreview, faviconPreview]);

  const update = <K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) => {
    setSettings(current => ({ ...current, [key]: value }));
    setNotice("");
  };
  const updateSocial = (key: keyof BusinessSettings["socialLinks"], value: string) => update("socialLinks", { ...settings.socialLinks, [key]: value });
  const updateSeo = (key: keyof BusinessSettings["seo"], value: string) => update("seo", { ...settings.seo, [key]: value });

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
    if (!settings.seo.title.trim()) next.seoTitle = "Enter a website title.";
    else if (settings.seo.title.length > 60) next.seoTitle = "Keep the website title to 60 characters or fewer.";
    if (!settings.seo.description.trim()) next.seoDescription = "Enter a default meta description.";
    else if (settings.seo.description.length > 160) next.seoDescription = "Keep the description to 160 characters or fewer.";
    setErrors(next);
    return next;
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      const firstKey = Object.keys(nextErrors)[0];
      setActiveSection(firstKey.startsWith("social-") ? "social" : firstKey.startsWith("seo") ? "search" : "business");
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-error-key="${firstKey}"]`)?.focus());
      return;
    }
    setBaseline(structuredClone(settings));
    setBaselineBrandingKey(brandingKey);
    setNotice("saved");
  }

  function clearPreview(kind: "logo" | "favicon") {
    const preview = kind === "logo" ? logoPreview : faviconPreview;
    if (preview) URL.revokeObjectURL(preview.url);
    if (kind === "logo") setLogoPreview(null); else setFaviconPreview(null);
  }
  function revertAll() {
    setSettings(structuredClone(baseline));
    clearPreview("logo"); clearPreview("favicon");
    setBaselineBrandingKey(":|:");
    setErrors({}); setNotice("reverted");
  }
  function chooseImage(kind: "logo" | "favicon", file?: File) {
    if (!file) return;
    const allowed = kind === "logo" ? ["image/png", "image/jpeg", "image/webp"] : ["image/png", "image/x-icon", "image/vnd.microsoft.icon"];
    const limit = kind === "logo" ? 2 * 1024 * 1024 : 1024 * 1024;
    const key = `${kind}File`;
    if (!allowed.includes(file.type) || file.size > limit) {
      setErrors(current => ({ ...current, [key]: kind === "logo" ? "Choose a PNG, JPG or WebP file under 2 MB." : "Choose a PNG or ICO file under 1 MB." }));
      return;
    }
    clearPreview(kind);
    const next = { file, url: URL.createObjectURL(file) };
    if (kind === "logo") setLogoPreview(next); else setFaviconPreview(next);
    setErrors(current => { const copy = { ...current }; delete copy[key]; return copy; });
    setNotice("");
  }
  function handleTabKey(event: React.KeyboardEvent, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? sections.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + sections.length) % sections.length;
    setActiveSection(sections[nextIndex].id); tabRefs.current[nextIndex]?.focus();
  }

  return <form onSubmit={save} noValidate className="pb-28">
    <div className="sticky top-16 z-20 -mx-4 border-y border-black/[.07] bg-[#f6f5f3]/95 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div role="tablist" aria-label="Settings sections" className="grid grid-cols-4 gap-1 rounded-lg border border-black/[.07] bg-white p-1 shadow-sm">
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
          <Field id="publicLocation" label="Business address or general location" value={settings.publicLocation} onChange={value => update("publicLocation", value)} placeholder="Awaiting confirmation"/>
          <Field id="googleMapsUrl" label="Google Maps location link" hint="Optional public map or directions link." type="url" inputMode="url" value={settings.googleMapsUrl} onChange={value => update("googleMapsUrl", value)} placeholder="https://maps.google.com/…" error={errors.googleMapsUrl}/>
        </div>
        <fieldset className="mt-8 border-t border-black/[.07] pt-7"><legend className="font-bold text-ink">Opening hours</legend><p className="mt-1 text-sm leading-6 text-ink/45">Switch off days when the business is closed. These hours are preview data only.</p>
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

      <SectionPanel id="branding" active={activeSection} title="Branding" intro="Preview replacement artwork locally. Files are not uploaded and the public logo or browser icon will not change.">
        <div className="grid gap-6 lg:grid-cols-2">
          <ImagePicker kind="logo" title="Company logo" description="PNG, JPG or WebP · maximum 2 MB · transparent PNG recommended" preview={logoPreview} error={errors.logoFile} onChoose={file => chooseImage("logo", file)} onRevert={() => clearPreview("logo")}/>
          <ImagePicker kind="favicon" title="Browser icon" description="PNG or ICO · maximum 1 MB · square image recommended" preview={faviconPreview} error={errors.faviconFile} onChoose={file => chooseImage("favicon", file)} onRevert={() => clearPreview("favicon")}/>
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-xs leading-5 text-blue-900"><Info size={16} className="mt-0.5 shrink-0"/><p>The current brand mark is rendered by the website rather than loaded from an image file. No file-based favicon is currently configured, so the FES tile shown here is a representative preview.</p></div>
      </SectionPanel>

      <SectionPanel id="search" active={activeSection} title="Search appearance" intro="Set the default title and description used when a page does not provide its own. Existing page-specific metadata remains unchanged.">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,.8fr)]">
          <div className="grid content-start gap-5">
            <Field id="seoTitle" label="Website title" value={settings.seo.title} onChange={value => updateSeo("title", value)} required maxLength={61} error={errors.seoTitle} hint={`${settings.seo.title.length}/60 characters`}/>
            <TextArea id="seoDescription" label="Default meta description" value={settings.seo.description} onChange={value => updateSeo("description", value)} maxLength={161} error={errors.seoDescription} hint={`${settings.seo.description.length}/160 characters`}/>
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 text-xs leading-5 text-amber-900"><Info size={16} className="mt-0.5 shrink-0"/><p>This is an illustrative preview. Search engines may rewrite titles and descriptions, and these temporary changes are not published.</p></div>
          </div>
          <div><p className="mb-2 text-xs font-black uppercase tracking-[.12em] text-ink/40">Search result preview</p><div className="rounded-xl border border-black/[.08] bg-white p-5 shadow-sm sm:p-6"><p className="flex items-center gap-2 text-xs text-ink/55"><span className="grid size-7 place-items-center rounded-full bg-wine text-[.58rem] font-black text-white">FES</span>fes.co.tt</p><p className="mt-3 break-words text-xl leading-7 text-[#1a0dab]">{settings.seo.title || "Website title"}</p><p className="mt-2 break-words text-sm leading-6 text-[#4d5156]">{settings.seo.description || "Your website description will appear here."}</p></div><div className="mt-4 rounded-xl border border-dashed border-black/15 p-5"><p className="text-sm font-bold">Social sharing image</p><p className="mt-2 text-xs leading-5 text-ink/45">No Open Graph image is currently configured. This field can be enabled when an approved social image exists.</p></div></div>
        </div>
      </SectionPanel>
    </div>

    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white/95 px-4 py-3 shadow-[0_-12px_35px_rgba(20,19,21,.08)] backdrop-blur-xl lg:left-[17.5rem] sm:px-6 lg:px-8"><div className="mx-auto flex max-w-[84rem] flex-wrap items-center justify-between gap-3"><div aria-live="polite" className="flex min-h-6 items-center gap-2 text-xs font-bold">{dirty ? <><span className="size-2 rounded-full bg-amber-500"/>Unsaved preview changes</> : notice === "saved" ? <><Check size={16} className="text-emerald-600"/>Preview updated locally — nothing was published</> : notice === "reverted" ? <><RotateCcw size={15}/>Changes reverted</> : <span className="text-ink/40">No unsaved changes</span>}</div><div className="flex gap-2"><button type="button" onClick={revertAll} disabled={!dirty} className="min-h-11 rounded-md border border-black/10 px-4 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-40">Cancel / Revert</button><button type="submit" disabled={!dirty} className="min-h-11 rounded-md bg-wine px-5 text-sm font-bold text-white shadow-sm hover:bg-wine-dark disabled:cursor-not-allowed disabled:opacity-40">Save changes</button></div></div></div>
  </form>;
}

function SectionPanel({ id, active, title, intro, children }: { id: SectionId; active: SectionId; title: string; intro: string; children: React.ReactNode }) {
  return <section id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={active !== id} className="rounded-xl border border-black/[.075] bg-white p-5 shadow-[0_1px_2px_rgba(20,19,21,.025)] sm:p-7"><div className="mb-7 border-b border-black/[.07] pb-6"><h2 className="text-xl font-bold tracking-[-.02em]">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-ink/48">{intro}</p></div>{children}</section>;
}

function Field({ id, label, value, onChange, hint, error, type = "text", ...props }: { id: string; label: string; value: string; onChange: (value: string) => void; hint?: string; error?: string; type?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "onChange" | "type">) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return <label htmlFor={id} className="grid content-start gap-2 text-sm font-bold"><span>{label}{props.required && <span className="ml-1 text-wine" aria-hidden="true">*</span>}</span>{hint && <span id={`${id}-hint`} className="text-xs font-normal leading-5 text-ink/42">{hint}</span>}<input id={id} data-error-key={id} type={type} value={value} onChange={event => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={`input rounded-md ${error ? "border-red-400 bg-red-50/25" : ""}`} {...props}/>{error && <span id={`${id}-error`} role="alert" className="text-xs font-semibold text-red-700">{error}</span>}</label>;
}

function TextArea({ id, label, value, onChange, hint, error, maxLength }: { id: string; label: string; value: string; onChange: (value: string) => void; hint?: string; error?: string; maxLength?: number }) {
  return <label htmlFor={id} className="grid gap-2 text-sm font-bold"><span>{label}<span className="ml-1 text-wine" aria-hidden="true">*</span></span>{hint && <span id={`${id}-hint`} className="text-xs font-normal text-ink/42">{hint}</span>}<textarea id={id} data-error-key={id} rows={5} value={value} maxLength={maxLength} onChange={event => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined} className={`w-full resize-y rounded-md border bg-white px-4 py-3 font-normal leading-6 outline-offset-2 ${error ? "border-red-400" : "border-black/15"}`}/>{error && <span id={`${id}-error`} role="alert" className="text-xs font-semibold text-red-700">{error}</span>}</label>;
}

function UrlField({ id, label, value, onChange, error, placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; placeholder: string }) {
  return <div><Field id={`social-${id}`} label={label} type="url" inputMode="url" value={value} onChange={onChange} placeholder={placeholder} error={error}/>{value && isSafeUrl(value) && <a href={value} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-wine hover:underline"><ExternalLink size={13}/>Open link preview</a>}</div>;
}

function TimeInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label><span className="sr-only">{label}</span><input type="time" aria-label={label} value={value} onChange={event => onChange(event.target.value)} className="min-h-10 min-w-0 rounded-md border border-black/15 bg-white px-2 text-sm sm:px-3"/></label>; }

function ImagePicker({ kind, title, description, preview, error, onChoose, onRevert }: { kind: "logo" | "favicon"; title: string; description: string; preview: PreviewFile; error?: string; onChoose: (file?: File) => void; onRevert: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const accept = kind === "logo" ? ".png,.jpg,.jpeg,.webp" : ".png,.ico";
  return <article className="overflow-hidden rounded-xl border border-black/[.08]"><div className="flex min-h-44 items-center justify-center bg-[#f2efeb] p-6">{preview ? <Image unoptimized width={kind === "favicon" ? 80 : 360} height={kind === "favicon" ? 80 : 96} src={preview.url} alt={`Local ${title.toLowerCase()} preview`} className={kind === "favicon" ? "size-20 object-contain" : "max-h-24 max-w-full object-contain"}/> : kind === "logo" ? <div className="flex items-center gap-3"><span className="relative grid size-14 place-items-center bg-wine text-lg font-black text-white after:absolute after:inset-1.5 after:border after:border-white/35">FES</span><span className="text-xs font-black uppercase leading-tight tracking-[.12em] text-ink">Fiber &amp; Electric<br/><span className="font-semibold tracking-[.21em] opacity-60">Solutions Ltd.</span></span></div> : <span className="relative grid size-20 place-items-center rounded-xl bg-wine text-2xl font-black text-white shadow-lg after:absolute after:inset-2 after:rounded-md after:border after:border-white/35">FES</span>}</div><div className="p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-xs leading-5 text-ink/45">{description}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[.6rem] font-black uppercase tracking-wider ${preview ? "bg-amber-50 text-amber-700" : "bg-black/[.04] text-ink/45"}`}>{preview ? "Local preview" : "Current"}</span></div>{preview && <p className="mt-3 truncate text-xs font-semibold text-ink/55">{preview.file.name}</p>}<div className="mt-4 flex flex-wrap gap-2"><input ref={inputRef} type="file" accept={accept} onChange={event => { onChoose(event.target.files?.[0]); event.currentTarget.value = ""; }} className="sr-only" aria-label={`Select replacement ${title.toLowerCase()}`}/><button type="button" onClick={() => inputRef.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-ink px-3 text-xs font-bold text-white"><Upload size={14}/>{preview ? "Choose another" : "Choose file"}</button>{preview && <button type="button" onClick={onRevert} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-black/10 px-3 text-xs font-bold"><X size={14}/>Revert to current</button>}</div>{error && <p role="alert" className="mt-3 text-xs font-semibold text-red-700">{error}</p>}</div></article>;
}
