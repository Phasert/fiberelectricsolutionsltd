"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return <button type="button" disabled={loading} onClick={async () => {
    setLoading(true);
    try { await fetch("/api/auth/logout", { method: "POST" }); }
    finally { router.replace("/admin/login"); router.refresh(); }
  }} className="text-[.68rem] font-bold text-white/45 hover:text-white disabled:opacity-60">{loading ? "Signing out…" : "Sign out"}</button>;
}
