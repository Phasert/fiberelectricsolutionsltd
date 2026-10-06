import { tips } from "@/data/content";

export function TipsPanel() {
  return <div className="grid border border-white/10 lg:grid-cols-[.75fr_1.25fr]"><div className="bg-wine p-8 text-white sm:p-12"><p className="text-xs font-black uppercase tracking-[.16em] text-white/60">Field notes</p><h2 className="display mt-4 text-4xl">Do&apos;s &amp;<br/>don&apos;ts</h2><p className="mt-5 text-sm leading-6 text-white/65">Compact practical guidance, prepared to become client-editable in Phase 2.</p></div><div className="divide-y divide-white/10">{tips.map(tip => <article key={tip.id} className="grid gap-3 p-7 sm:grid-cols-[7rem_1fr] sm:p-9"><span className={`text-xs font-black uppercase tracking-widest ${tip.type === "do" ? "text-[#db8298]" : "text-white/40"}`}>{tip.type === "do" ? "Do" : "Don’t"}</span><div><h3 className="font-bold text-white">{tip.title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{tip.body}</p></div></article>)}</div></div>;
}
