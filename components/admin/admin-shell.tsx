"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookOpenText, BriefcaseBusiness, ChevronsUpDown, CircleUserRound,
  FileText, FolderKanban, Images, LayoutDashboard, Menu,
  MessageSquareText, PanelLeftClose, Settings, Sparkles,
  SquareArrowOutUpRight, X,
} from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";
import type { Administrator } from "@/types/firebase";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/media", label: "Gallery / Media", icon: Images },
  { href: "/admin/resources", label: "Articles / Resources", icon: BookOpenText },
  { href: "/admin/tips", label: "Tips / Do’s & Don’ts", icon: Sparkles },
  { href: "/admin/featured", label: "Featured Content", icon: BriefcaseBusiness },
  { href: "/admin/enquiries", label: "Quote Requests", icon: MessageSquareText },
  { href: "/admin/content", label: "Site Content", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children, administrator }: { children: React.ReactNode; administrator: Administrator }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [desktopSidebar, setDesktopSidebar] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 64rem)");
    const syncSidebar = () => setDesktopSidebar(media.matches);
    syncSidebar();
    media.addEventListener("change", syncSidebar);
    return () => media.removeEventListener("change", syncSidebar);
  }, []);

  useEffect(() => {
    if (!open || desktopSidebar) return;
    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      menuButton?.focus();
    };
  }, [open, desktopSidebar]);

  if (path === "/admin/login") return <main id="main">{children}</main>;

  const sidebarInactive = !desktopSidebar && !open;

  return <div className="min-h-screen bg-[#f6f5f3] lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)]">
    <aside id="admin-sidebar" aria-hidden={sidebarInactive || undefined} inert={sidebarInactive || undefined} className={`fixed inset-y-0 left-0 z-50 w-[17.5rem] border-r border-white/8 bg-[#171517] text-white shadow-2xl shadow-black/20 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-[5.25rem] shrink-0 items-center justify-between border-b border-white/8 px-5">
          <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3" aria-label="FES admin dashboard">
            <span className="grid size-10 place-items-center border border-white/15 bg-wine text-sm font-black shadow-[inset_0_0_0_3px_rgba(255,255,255,.06)]">FES</span>
            <span><span className="block text-[.7rem] font-black uppercase leading-tight tracking-[.14em]">Fiber &amp; Electric</span><span className="mt-1 block text-[.58rem] font-bold uppercase tracking-[.24em] text-white/38">Content manager</span></span>
          </Link>
          <button ref={closeButtonRef} onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-md text-white/55 hover:bg-white/8 hover:text-white lg:hidden" aria-label="Close admin menu"><X size={20} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 text-[.62rem] font-black uppercase tracking-[.18em] text-white/28">Workspace</p>
          <nav className="mt-3 space-y-1" aria-label="Admin navigation">
            {navigation.map(({ href, label, icon: Icon }) => { const active = href === "/admin" ? path === href : path.startsWith(href); return <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={`group relative flex min-h-11 items-center gap-3 rounded-md px-3.5 text-[.83rem] font-semibold transition-colors focus-visible:outline-white ${active ? "bg-white/[.09] text-white" : "text-white/52 hover:bg-white/[.055] hover:text-white/88"}`}>{active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#c72d50]" />}<Icon size={18} strokeWidth={active ? 2.2 : 1.8} className={active ? "text-[#e25775]" : "text-white/35 group-hover:text-white/65"} /><span>{label}</span></Link>; })}
          </nav>
        </div>
        <div className="shrink-0 border-t border-white/8 bg-black/10 p-3">
          <Link href="/" className="group flex min-h-11 items-center justify-between rounded-md border border-white/10 px-3.5 text-xs font-bold text-white/65 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"><span className="flex items-center gap-2.5"><SquareArrowOutUpRight size={16} /> View public website</span><span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span></Link>
          <div className="mt-2 flex w-full items-center gap-3 rounded-md p-2.5"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-wine/80 text-xs font-black">{administrator.displayName.charAt(0).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">{administrator.displayName}</span><LogoutButton /></span><ChevronsUpDown size={15} className="text-white/25" /></div>
        </div>
      </div>
    </aside>
    {open && <button aria-label="Close admin menu" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden" />}
    <div className="min-w-0">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/[.07] bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex items-center gap-3"><button ref={menuButtonRef} onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-md border border-black/10 bg-white text-ink/65 shadow-sm lg:hidden" aria-label="Open admin menu" aria-controls="admin-sidebar" aria-expanded={open}><Menu size={20} /></button><div className="hidden items-center gap-2 text-xs font-semibold text-ink/40 sm:flex"><PanelLeftClose size={15} /><span>FES content manager</span></div></div>
        <div className="flex items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1.5 text-[.7rem] font-bold text-emerald-800"><span className="size-1.5 rounded-full bg-emerald-500" /> Authenticated</span><CircleUserRound size={20} className="hidden text-ink/35 sm:block" /></div>
      </header>
      <main id="main" className="mx-auto w-full max-w-[90rem] p-4 sm:p-6 lg:p-8 xl:p-10">{children}</main>
    </div>
  </div>;
}
