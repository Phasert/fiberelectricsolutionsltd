export function SectionHeading({ eyebrow, title, body, light = false }: { eyebrow: string; title: string; body?: string; light?: boolean }) {
  return <div className="max-w-3xl">
    <p className={`eyebrow ${light ? "!text-[#db8298]" : ""}`}>{eyebrow}</p>
    <h2 className="display mt-5 text-4xl sm:text-5xl lg:text-6xl">{title}</h2>
    {body && <p className={`mt-6 max-w-2xl text-base leading-7 ${light ? "text-white/65" : "text-ink/65"}`}>{body}</p>}
  </div>;
}
