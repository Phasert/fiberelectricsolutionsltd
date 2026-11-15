"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Enquiry, EnquiryStatus } from "@/types/admin";
import { EmptyState, StatusBadge } from "./admin-ui";

const statuses: ("All" | EnquiryStatus)[] = ["All", "New", "In Review", "Contacted", "Quoted", "Closed"];
const tone = (status: EnquiryStatus) => status === "New" ? "info" : status === "In Review" ? "warn" : status === "Contacted" || status === "Quoted" ? "good" : "neutral";
const time = (value?: string) => value ? new Date(value).getTime() : 0;

export function EnquiryList({ items,nextCursor }: { items: Enquiry[];nextCursor?:string|null }) {
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const counts = useMemo(() => Object.fromEntries(statuses.slice(1).map(value => [value, items.filter(item => item.status === value).length])), [items]);
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter(item => (status === "All" || item.status === status) && (!normalized || [item.name, item.email, item.phone, item.id].some(value => value?.toLowerCase().includes(normalized))))
      .sort((a, b) => sort === "oldest" ? time(a.submittedAtIso) - time(b.submittedAtIso) : sort === "updated" ? time(b.updatedAt) - time(a.updatedAt) : time(b.submittedAtIso) - time(a.submittedAtIso));
  }, [items, query, sort, status]);

  return <div className="space-y-6">
    <section aria-label="Enquiry summary" className="grid grid-cols-2 gap-3 lg:grid-cols-6">
      <Summary label="Total enquiries" value={items.length} featured />
      {statuses.slice(1).map(value => <Summary key={value} label={value} value={counts[value] ?? 0} />)}
    </section>
    <section className="rounded-lg border border-black/[.075] bg-white shadow-[0_1px_2px_rgba(20,19,21,.025)]">
      <div className="grid gap-4 border-b border-black/[.07] p-4 lg:grid-cols-[minmax(16rem,1fr)_auto_auto] lg:items-end lg:p-5">
        <label className="grid gap-2 text-xs font-bold text-ink/55"><span>Search quote requests</span><span className="relative"><Search aria-hidden="true" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"/><input value={query} onChange={event => setQuery(event.target.value)} className="input rounded-md pl-10" placeholder="Name, email or reference" /></span></label>
        <label className="grid gap-2 text-xs font-bold text-ink/55"><span>Sort by</span><select value={sort} onChange={event => setSort(event.target.value)} className="input min-w-48 rounded-md"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="updated">Recently updated</option></select></label>
        {(query || status !== "All") && <button type="button" onClick={() => { setQuery(""); setStatus("All"); }} className="min-h-12 rounded-md px-3 text-sm font-bold text-wine hover:bg-wine/[.06]">Clear filters</button>}
      </div>
      <div className="flex gap-2 overflow-x-auto border-b border-black/[.07] px-4 py-3 lg:px-5" role="group" aria-label="Filter by status">
        {statuses.map(value => <button key={value} type="button" onClick={() => setStatus(value)} aria-pressed={status === value} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${status === value ? "border-wine bg-wine text-white" : "border-black/10 bg-white text-ink/55 hover:border-wine/30 hover:text-wine"}`}>{value}{value !== "All" && <span className="ml-1.5 opacity-65">{counts[value] ?? 0}</span>}</button>)}
      </div>
      {visible.length ? <div>
        <div className="hidden grid-cols-[minmax(12rem,1.3fr)_.7fr_.8fr_.65fr_auto] gap-4 border-b border-black/[.07] bg-paper/65 px-5 py-3 text-[.65rem] font-black uppercase tracking-[.12em] text-ink/40 md:grid"><span>Customer</span><span>Service</span><span>Submitted</span><span>Status</span><span>Action</span></div>
        {visible.map(item => <article key={item.id} className="grid gap-4 border-b border-black/[.07] p-4 last:border-0 md:grid-cols-[minmax(12rem,1.3fr)_.7fr_.8fr_.65fr_auto] md:items-center md:px-5">
          <div className="min-w-0"><p className="truncate font-bold text-ink">{item.name}</p><p className="mt-1 truncate text-xs text-ink/45">{item.email ?? item.contact ?? "No contact information"}</p><p className="mt-1 text-[.65rem] font-bold uppercase tracking-wider text-ink/35">{item.id}</p></div>
          <Field label="Service">{item.service}</Field><Field label="Submitted">{item.submittedAt}</Field><div><span className="mb-1.5 block text-[.62rem] font-black uppercase tracking-wider text-ink/35 md:hidden">Status</span><StatusBadge tone={tone(item.status)}>{item.status}</StatusBadge></div>
          <Link href={`/admin/enquiries/${item.id}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-wine/20 px-3 text-xs font-bold text-wine transition-colors hover:bg-wine hover:text-white">View details <ArrowRight size={14}/></Link>
        </article>)}
        {nextCursor&&<nav aria-label="Enquiry pages" className="flex justify-end border-t border-black/[.07] p-4"><Link href={`/admin/enquiries?after=${encodeURIComponent(nextCursor)}`} className="inline-flex min-h-10 items-center rounded-md border border-black/10 px-4 text-sm font-bold">Next 25 enquiries</Link></nav>}
      </div> : <div className="p-5 sm:p-8"><EmptyState title={items.length ? "No quote requests found" : "No quote requests yet"} body={items.length ? "Try changing the search term or status filter." : "No customer quotation requests are currently stored in Firebase."}/></div>}
    </section>
  </div>;
}

function Summary({ label, value, featured = false }: { label: string; value: number; featured?: boolean }) { return <div className={`rounded-lg border p-4 ${featured ? "border-wine bg-wine text-white" : "border-black/[.075] bg-white"}`}><p className={`text-[.65rem] font-black uppercase tracking-[.12em] ${featured ? "text-white/65" : "text-ink/40"}`}>{label}</p><p className="mt-2 text-2xl font-bold tracking-tight">{value}</p></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><span className="mb-1 block text-[.62rem] font-black uppercase tracking-wider text-ink/35 md:hidden">{label}</span><p className="text-sm text-ink/65">{children}</p></div>; }
