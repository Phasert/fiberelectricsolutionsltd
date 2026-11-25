import Image from "next/image";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

type ServiceHeroProps = {
  kind: "electrical" | "fiber";
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  image: string;
  imageAlt: string;
};

export function ServiceHero({ kind, eyebrow, title, body, points, image, imageAlt }: ServiceHeroProps) {
  const quoteService = kind === "fiber" ? "Fiber Optic" : "Electrical";
  return <section className={`service-hero service-hero-${kind} grain relative overflow-hidden bg-ink text-white`}>
    <div className="shell grid min-h-[min(48rem,calc(100svh-var(--nav-height)))] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
      <div className="relative z-10 max-w-2xl">
        <p className="eyebrow !text-[#ef9bb0]">{eyebrow}</p>
        <h1 className="display mt-6 text-5xl leading-[.94] sm:text-6xl lg:text-7xl">{title}</h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8">{body}</p>
        <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/72">
          {points.map(point => <li key={point} className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-wine"><Check size={12} strokeWidth={3} aria-hidden="true" /></span>{point}</li>)}
        </ul>
        <div className="mt-9 flex flex-wrap gap-3"><ButtonLink href={`/request-a-quote?service=${encodeURIComponent(quoteService)}`}>Request a quote</ButtonLink><ButtonLink href="#services" variant="outline">Explore services</ButtonLink></div>
      </div>
      <div className="hero-visual relative mx-auto w-full max-w-xl">
        <div className="relative aspect-[4/5] overflow-hidden border border-white/12 bg-charcoal shadow-2xl sm:aspect-[5/4] lg:aspect-[4/5]">
          <Image src={image} alt={imageAlt} fill priority unoptimized={image.startsWith("/media/")} className="object-cover" sizes="(max-width: 1024px) 100vw, 46vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          {!image.startsWith("/media/") && <p className="absolute bottom-5 left-5 right-5 text-xs leading-5 text-white/65">Industry illustration · service capability visual</p>}
        </div>
        <div aria-hidden="true" className="absolute -bottom-4 -left-4 h-24 w-24 border-b-2 border-l-2 border-[#d33a5d]" />
      </div>
    </div>
  </section>;
}
