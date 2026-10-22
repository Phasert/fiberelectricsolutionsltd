import Link from "next/link";
import { Logo } from "./logo";
import { formatBusinessHours } from "@/lib/settings/presentation";
import type { PublicBusinessSettings, PublicContactLink } from "@/types/content";

export function Footer({ settings }: { settings: PublicBusinessSettings | null }) {
  return <footer className="bg-ink text-white"><div className="h-1 bg-[linear-gradient(90deg,#fff_0_33.33%,#141315_33.33%_66.66%,#b5193d_66.66%)]"/><div className="shell grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
    <div><Logo light/><p className="display mt-7 max-w-xs text-3xl">Make it good.<br/>Make it last.</p><p className="mt-5 max-w-sm text-sm leading-6 text-white/55">Professional electrical and fiber optic solutions serving Trinidad &amp; Tobago.</p></div>
    <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#db8298]">Services</p><div className="mt-5 grid gap-3 text-sm text-white/65"><Link href="/electrical">Electrical</Link><Link href="/fiber-optic">Fiber Optic</Link><Link href="/projects">Projects</Link></div></div>
    <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#db8298]">Company</p><div className="mt-5 grid gap-3 text-sm text-white/65"><Link href="/about">About FES</Link><Link href="/resources">Resources</Link><Link href="/contact">Contact FES</Link><Link href="/request-a-quote">Request a quote</Link><Link href="/privacy">Privacy Notice</Link></div></div>
    <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#db8298]">Contact</p>{settings ? <div className="mt-5 grid gap-3 text-sm text-white/65">
      {settings.phone && <PublicLink link={settings.phone}/>} {settings.email && <PublicLink link={settings.email}/>} {settings.whatsapp && <PublicLink link={{...settings.whatsapp,label:"WhatsApp"}} external/>}
      {settings.maps ? <PublicLink link={{...settings.maps,label:settings.location}} external/> : <p>{settings.location}</p>}
      {(settings.googleBusiness || settings.socialLinks.length > 0) && <div className="flex flex-wrap gap-x-4 gap-y-2">{settings.googleBusiness && <PublicLink link={settings.googleBusiness} external/>}{settings.socialLinks.map((link)=><PublicLink key={link.href} link={link} external/>)}</div>}
      <details className="pt-1"><summary className="cursor-pointer font-bold text-white">Opening hours</summary><dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">{settings.businessHours.map((entry)=><div key={entry.day} className="contents"><dt>{entry.day}</dt><dd>{formatBusinessHours(entry)}</dd></div>)}</dl></details>
    </div> : <p className="mt-5 text-sm leading-6 text-white/55">Approved contact details are being prepared. The quote form can still be used to prepare a local preview.</p>}<Link href="/request-a-quote" className="mt-4 inline-flex border-b border-[#db8298]/60 pb-1 text-sm font-bold text-white">Prepare a request →</Link></div>
  </div><div className="border-t border-white/10"><div className="shell flex flex-col gap-2 py-5 text-xs text-white/40 sm:flex-row sm:justify-between"><p>© {new Date().getFullYear()} {settings?.businessName ?? "Fiber & Electric Solutions Ltd."}</p><p>{settings?.location ?? "Trinidad & Tobago"}</p></div></div></footer>;
}

function PublicLink({link,external=false}:{link:PublicContactLink;external?:boolean}) { return <a href={link.href} target={external?"_blank":undefined} rel={external?"noreferrer":undefined} className="transition hover:text-white">{link.label}</a>; }
