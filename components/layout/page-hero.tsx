export function PageHero({ eyebrow, title, body, accent = "Electrical" }: { eyebrow: string; title: string; body: string; accent?: string }) {
  const parts = title.split(accent);
  return <section className="grain relative overflow-hidden bg-ink text-white"><div className="absolute inset-y-0 right-0 w-2/5 bg-[radial-gradient(circle_at_center,#7d1028_0,transparent_68%)] opacity-70"/><div className="shell relative py-24 sm:py-32"><p className="eyebrow !text-[#db8298]">{eyebrow}</p><h1 className="display mt-6 max-w-5xl text-5xl sm:text-7xl lg:text-8xl">{parts[0]}{parts.length > 1 && <><span className="text-[#c42b4e]">{accent}</span>{parts.slice(1).join(accent)}</>}</h1><p className="mt-8 max-w-2xl text-lg leading-8 text-white/65">{body}</p></div></section>;
}
