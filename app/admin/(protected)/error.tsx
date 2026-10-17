"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return <section className="rounded-lg border border-red-200 bg-white p-8"><h1 className="display text-3xl">Admin data is unavailable.</h1><p className="mt-3 text-sm text-ink/60">Your session or Firebase connection may have expired. Retry, then sign in again if the problem continues.</p><button onClick={reset} className="mt-5 bg-wine px-5 py-3 text-sm font-bold text-white">Retry</button></section>;
}
