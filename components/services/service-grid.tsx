import Link from "next/link";
import { Cable, Cpu, Flame, Gauge, Network, PlugZap, RadioTower, ShieldCheck, Sparkles, Zap } from "lucide-react";
import type { Service } from "@/types/content";

const serviceIcons = {
  bolt: Zap,
  network: Network,
  shield: ShieldCheck,
  transformer: Cpu,
  generator: PlugZap,
  cable: Cable,
  splice: Sparkles,
  test: Gauge,
  consult: RadioTower,
  fire: Flame,
};

export function ServiceGrid({ services, dark = false }: { services: Service[]; dark?: boolean }) {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">{services.map((service, index) => {
    const Icon = serviceIcons[service.icon as keyof typeof serviceIcons] ?? Zap;
    const category = service.kind === "fiber" ? "Fiber Optic" : "Electrical";
    return <article key={service.slug} className={`service-card group flex min-h-72 flex-col overflow-hidden border p-7 sm:p-8 ${services.length % 3 === 2 && index >= services.length - 2 ? "lg:col-span-3" : "lg:col-span-2"} ${dark ? "border-white/10 bg-charcoal text-white" : "border-black/10 bg-white"}`}>
      <div className="flex items-start justify-between gap-5">
        <span className={`grid size-12 place-items-center rounded-full ${dark ? "bg-white/8 text-[#ec9bb0]" : "bg-wine/8 text-wine"}`}><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
        <span className={`text-[.65rem] font-black tracking-[.18em] ${dark ? "text-white/30" : "text-ink/30"}`}>{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className="display mt-8 text-2xl leading-tight sm:text-[1.7rem]">{service.title}</h3>
      <p className={`mt-4 text-sm leading-6 ${dark ? "text-white/60" : "text-ink/60"}`}>{service.description}</p>
      <Link href={`/request-a-quote?service=${encodeURIComponent(category)}`} className={`mt-auto inline-flex items-center gap-2 pt-8 text-sm font-black ${dark ? "text-[#ec9bb0]" : "text-wine"}`} aria-label={`Request a quote for ${service.title}`}>Request a quote <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span></Link>
    </article>;
  })}</div>;
}
