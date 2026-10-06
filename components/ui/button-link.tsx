import Link from "next/link";

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "light" | "outline" }) {
  const styles = { primary: "bg-wine text-white hover:bg-wine-dark", light: "bg-white text-ink hover:bg-paper", outline: "border border-current text-current hover:bg-white/10" };
  return <Link href={href} className={`inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3 text-sm font-bold transition-colors ${styles[variant]}`}>{children}<span aria-hidden="true">↗</span></Link>;
}
