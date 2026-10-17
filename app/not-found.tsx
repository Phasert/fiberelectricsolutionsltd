import Link from "next/link";

export default function NotFound() {
  return <section className="grain grid min-h-[65svh] place-items-center bg-ink px-5 py-20 text-center text-white"><div className="max-w-2xl"><p className="eyebrow !text-[#ef91a6]">Page not found</p><h1 className="display mt-6 text-5xl sm:text-7xl">That page is not available.</h1><p className="mx-auto mt-6 max-w-xl leading-7 text-white/65">The address may have changed, or the project or resource may no longer be published.</p><div className="mt-9 flex flex-wrap justify-center gap-3"><Link href="/" className="inline-flex min-h-12 items-center bg-white px-5 text-sm font-bold text-ink">Return home</Link><Link href="/projects" className="inline-flex min-h-12 items-center border border-white/25 px-5 text-sm font-bold text-white">Browse projects</Link></div></div></section>;
}
