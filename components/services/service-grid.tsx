import type { Service } from "@/types/content";

export function ServiceGrid({ services, dark = false }: { services: Service[]; dark?: boolean }) {
  return <div className="grid gap-px overflow-hidden border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-3">{services.map((service, index) => <article key={service.slug} className={`group min-h-64 p-7 sm:p-9 ${dark ? "bg-charcoal text-white" : "bg-[#faf8f5]"}`}>
    <div className="flex items-center justify-between"><span className={`grid size-11 place-items-center border text-lg font-black ${dark ? "border-white/15 text-[#db8298]" : "border-wine/20 text-wine"}`}>{String(index + 1).padStart(2, "0")}</span><span aria-hidden="true" className="text-2xl opacity-25 transition-transform group-hover:translate-x-1">↗</span></div>
    <h3 className="display mt-10 text-2xl">{service.title}</h3><p className={`mt-4 text-sm leading-6 ${dark ? "text-white/55" : "text-ink/60"}`}>{service.description}</p>
  </article>)}</div>;
}
