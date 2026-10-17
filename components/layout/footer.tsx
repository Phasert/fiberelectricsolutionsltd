import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return <footer className="bg-ink text-white"><div className="h-1 bg-[linear-gradient(90deg,#fff_0_33.33%,#141315_33.33%_66.66%,#b5193d_66.66%)]"/><div className="shell grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
    <div><Logo light/><p className="display mt-7 max-w-xs text-3xl">Make it good.<br/>Make it last.</p><p className="mt-5 max-w-sm text-sm leading-6 text-white/55">Professional electrical and fiber optic solutions serving Trinidad &amp; Tobago.</p></div>
    <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#db8298]">Services</p><div className="mt-5 grid gap-3 text-sm text-white/65"><Link href="/electrical">Electrical</Link><Link href="/fiber-optic">Fiber Optic</Link><Link href="/projects">Projects</Link></div></div>
    <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#db8298]">Company</p><div className="mt-5 grid gap-3 text-sm text-white/65"><Link href="/about">About FES</Link><Link href="/resources">Resources</Link><Link href="/request-a-quote">Request a quote</Link></div></div>
    <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#db8298]">Contact</p><p className="mt-5 text-sm leading-6 text-white/55">Use the quote request form to share your project details with FES.</p><Link href="/request-a-quote" className="mt-4 inline-flex border-b border-[#db8298]/60 pb-1 text-sm font-bold text-white">Start a request →</Link></div>
  </div><div className="border-t border-white/10"><div className="shell flex flex-col gap-2 py-5 text-xs text-white/40 sm:flex-row sm:justify-between"><p>© {new Date().getFullYear()} Fiber &amp; Electric Solutions Ltd.</p><p>Trinidad &amp; Tobago</p></div></div></footer>;
}
