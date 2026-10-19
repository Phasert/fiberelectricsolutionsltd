"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Mail, Menu, MessageCircle, Phone, X } from "lucide-react";
import { Logo } from "./logo";
import type { PublicBusinessSettings } from "@/types/content";

const mainLinks = [{ href: "/", label: "Home" }, { href: "/projects", label: "Projects" }, { href: "/about", label: "About" }, { href: "/resources", label: "Resources" }];
const serviceLinks = [{ href: "/electrical", label: "Electrical", note: "Power, wiring and installation" }, { href: "/fiber-optic", label: "Fiber Optic", note: "Installation, splicing and testing" }];

export function Header({ settings }: { settings: PublicBusinessSettings | null }) {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const path = usePathname();
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeMenus(event: MouseEvent) { if (!servicesRef.current?.contains(event.target as Node)) setServicesOpen(false); }
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") { setOpen(false); setServicesOpen(false); } }
    document.addEventListener("mousedown", closeMenus); document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeMenus); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  const active = (href: string) => href === "/" ? path === "/" : path.startsWith(href);
  const servicesActive = serviceLinks.some((link) => active(link.href));

  return <header className="sticky top-0 z-50 border-b border-black/8 bg-paper/95 shadow-[0_8px_30px_rgb(20_19_21/.04)] backdrop-blur-xl">
    <div className="shell flex h-[var(--nav-height)] items-center justify-between gap-6">
      <Logo />
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
        <NavLink {...mainLinks[0]} current={active("/")} />
        <div ref={servicesRef} className="relative">
          <button type="button" onClick={() => setServicesOpen((value) => !value)} aria-expanded={servicesOpen} aria-haspopup="true" className={`nav-link gap-1 ${servicesActive ? "nav-link-active" : ""}`}>
            Services <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
          </button>
          {servicesOpen && <div className="absolute left-0 top-[calc(100%+.75rem)] w-72 border border-black/10 bg-white p-2 shadow-2xl">
            {serviceLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setServicesOpen(false)} aria-current={active(link.href) ? "page" : undefined} className="group block p-4 hover:bg-paper focus-visible:bg-paper"><span className="block text-sm font-black text-ink group-hover:text-wine">{link.label}</span><span className="mt-1 block text-xs text-ink/50">{link.note}</span></Link>)}
          </div>}
        </div>
        {mainLinks.slice(1).map((link) => <NavLink key={link.href} {...link} current={active(link.href)} />)}
        {settings?.phone && <ContactIcon href={settings.phone.href} label={`Call ${settings.phone.label}`}><Phone size={16}/></ContactIcon>}
        {settings?.email && <ContactIcon href={settings.email.href} label={`Email ${settings.email.label}`}><Mail size={16}/></ContactIcon>}
        {settings?.whatsapp && <ContactIcon href={settings.whatsapp.href} label={`WhatsApp ${settings.whatsapp.label}`} external><MessageCircle size={16}/></ContactIcon>}
        <Link href="/request-a-quote" aria-current={active("/request-a-quote") ? "page" : undefined} className="ml-2 bg-wine px-5 py-3 text-xs font-black uppercase tracking-[.1em] text-white transition hover:-translate-y-0.5 hover:bg-wine-dark">Request a quote</Link>
      </nav>
      <button type="button" onClick={() => setOpen((value) => !value)} className="grid size-11 place-items-center border border-ink/15 bg-white lg:hidden" aria-expanded={open} aria-controls="mobile-nav"><span className="sr-only">{open ? "Close menu" : "Open menu"}</span>{open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}</button>
    </div>
    <nav id="mobile-nav" aria-label="Mobile navigation" className={`${open ? "grid" : "hidden"} max-h-[calc(100svh-var(--nav-height))] overflow-y-auto border-t border-white/10 bg-ink px-4 pb-6 lg:hidden`}>
      <MobileLink {...mainLinks[0]} current={active("/")} close={() => setOpen(false)} />
      <p className="px-2 pb-2 pt-5 text-[.65rem] font-black uppercase tracking-[.2em] text-white/35">Services</p>
      {serviceLinks.map((link) => <MobileLink key={link.href} {...link} current={active(link.href)} close={() => setOpen(false)} />)}
      {mainLinks.slice(1).map((link) => <MobileLink key={link.href} {...link} current={active(link.href)} close={() => setOpen(false)} />)}
      <Link href="/request-a-quote" className="mt-5 bg-wine p-4 text-center text-sm font-black uppercase tracking-widest text-white">Request a quote</Link>
      {settings && <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 text-sm text-white/70">
        {settings.phone && <a href={settings.phone.href}>Call {settings.phone.label}</a>}
        {settings.email && <a href={settings.email.href}>Email {settings.email.label}</a>}
        {settings.whatsapp && <a href={settings.whatsapp.href} target="_blank" rel="noreferrer">WhatsApp {settings.whatsapp.label}</a>}
      </div>}
    </nav>
  </header>;
}

function NavLink({ href, label, current }: { href: string; label: string; current: boolean }) { return <Link href={href} aria-current={current ? "page" : undefined} className={`nav-link ${current ? "nav-link-active" : ""}`}>{label}</Link>; }
function MobileLink({ href, label, current, close }: { href: string; label: string; current: boolean; close: () => void }) { return <Link href={href} onClick={close} aria-current={current ? "page" : undefined} className={`border-b border-white/10 px-2 py-4 text-lg font-bold ${current ? "text-[#f096aa]" : "text-white"}`}>{label}</Link>; }
function ContactIcon({href,label,external=false,children}:{href:string;label:string;external?:boolean;children:React.ReactNode}) { return <a href={href} aria-label={label} title={label} target={external?"_blank":undefined} rel={external?"noreferrer":undefined} className="grid size-9 place-items-center text-ink/55 transition hover:text-wine focus-visible:text-wine">{children}</a>; }
