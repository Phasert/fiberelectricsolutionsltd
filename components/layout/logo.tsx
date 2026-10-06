import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return <Link href="/" className="flex items-center gap-3" aria-label="Fiber and Electric Solutions home">
    <span className="relative grid size-10 place-items-center bg-wine text-sm font-black text-white after:absolute after:inset-1 after:border after:border-white/35">FES</span>
    <span className={`hidden text-[.68rem] font-black uppercase leading-[1.05] tracking-[.12em] sm:block ${light ? "text-white" : "text-ink"}`}>Fiber &amp; Electric<br/><span className="font-semibold tracking-[.21em] opacity-65">Solutions Ltd.</span></span>
  </Link>;
}
