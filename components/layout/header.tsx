"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./logo";

const links = [{ href: "/electrical", label: "Electrical" }, { href: "/fiber-optic", label: "Fiber Optic" }, { href: "/projects", label: "Projects" }, { href: "/about", label: "About" }, { href: "/resources", label: "Resources" }];

export function Header() {
  const [open, setOpen] = useState(false); const path = usePathname();
  return <header className="sticky top-0 z-50 border-b border-black/8 bg-paper/95 backdrop-blur-xl">
    <div className="shell flex h-[var(--nav-height)] items-center justify-between">
      <Logo />
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
        {links.map(link => <Link key={link.href} href={link.href} aria-current={path.startsWith(link.href) ? "page" : undefined} className={`text-xs font-bold uppercase tracking-[.09em] transition-colors hover:text-wine ${path.startsWith(link.href) ? "text-wine" : "text-ink/72"}`}>{link.label}</Link>)}
        <Link href="/request-a-quote" className="bg-wine px-5 py-3 text-xs font-black uppercase tracking-[.1em] text-white hover:bg-wine-dark">Request a quote</Link>
      </nav>
      <button onClick={() => setOpen(v => !v)} className="grid size-11 place-items-center border border-ink/15 lg:hidden" aria-expanded={open} aria-controls="mobile-nav"><span className="sr-only">Toggle menu</span><span aria-hidden="true" className="text-xl">{open ? "×" : "≡"}</span></button>
    </div>
    <div id="mobile-nav" className={`${open ? "grid" : "hidden"} border-t border-black/8 bg-ink p-5 lg:hidden`}>
      {links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="border-b border-white/10 py-4 text-lg font-bold text-white">{link.label}</Link>)}
      <Link href="/request-a-quote" onClick={() => setOpen(false)} className="mt-5 bg-wine p-4 text-center text-sm font-black uppercase tracking-widest text-white">Request a quote</Link>
    </div>
  </header>;
}
