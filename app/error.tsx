"use client";

import Link from "next/link";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section className="grain grid min-h-[65svh] place-items-center bg-ink px-5 py-20 text-center text-white"><div className="max-w-2xl"><p className="eyebrow !text-[#ef91a6]">Something went wrong</p><h1 className="display mt-6 text-5xl sm:text-7xl">We could not load this page.</h1><p className="mx-auto mt-6 max-w-xl leading-7 text-white/65">Try the request again. If the problem continues, return to the homepage.</p><div className="mt-9 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => retry()} className="min-h-12 bg-white px-5 text-sm font-bold text-ink">Try again</button><Link href="/" className="inline-flex min-h-12 items-center border border-white/25 px-5 text-sm font-bold text-white">Return home</Link></div></div></section>;
}
