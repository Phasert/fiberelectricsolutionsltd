"use client";

import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { getFirebaseClient } from "@/lib/firebase/client";

export function LoginForm() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const operation = useRef(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(new FormData(event.currentTarget));
  }

  function handlePasswordReset() {
    const form = document.getElementById("admin-login-form");
    if (!(form instanceof HTMLFormElement)) return;
    void resetPassword(new FormData(form));
  }

  async function submit(formData: FormData) {
    if (operation.current) return;
    operation.current = true;
    setLoading(true); setMessage("");
    try {
      const { auth } = getFirebaseClient();
      const credential = await signInWithEmailAndPassword(auth, String(formData.get("email")), String(formData.get("password")));
      const response = await fetch("/api/auth/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken: await credential.user.getIdToken() }) });
      const result = await response.json();
      await signOut(auth);
      if (!response.ok) throw new Error(result.error || "Sign-in failed.");
      router.replace("/admin"); router.refresh();
    } catch (error) {
      setMessage(error instanceof Error && error.message.includes("approved") ? error.message : "Email or password was not accepted.");
    } finally { operation.current = false; setLoading(false); }
  }

  async function resetPassword(formData: FormData) {
    if (operation.current) return;
    const email = String(formData.get("email") || "").trim();
    if (!email) { setMessage("Enter your email address first."); return; }
    operation.current = true; setLoading(true); setMessage("");
    try {
      await sendPasswordResetEmail(getFirebaseClient().auth, email);
      setMessage("If this address has an account, Firebase has sent reset instructions.");
    } catch { setMessage("Password reset is unavailable. Check the address or try again later."); }
    finally { operation.current = false; setLoading(false); }
  }

  return <form id="admin-login-form" onSubmit={handleSubmit} className="mt-8 grid min-w-0 gap-5">
    <label className="grid min-w-0 gap-2 text-sm font-bold">Email address<input name="email" type="email" required autoComplete="email" className="min-h-12 min-w-0 w-full border border-black/15 px-4 font-normal" /></label>
    <label className="grid min-w-0 gap-2 text-sm font-bold">Password<span className="flex min-w-0"><input name="password" type={show ? "text" : "password"} required autoComplete="current-password" className="min-h-12 min-w-0 flex-1 border border-black/15 px-4 font-normal" /><button type="button" onClick={() => setShow((value) => !value)} className="shrink-0 border border-l-0 border-black/15 px-4 text-xs font-bold">{show ? "Hide" : "Show"}</button></span></label>
    <div className="flex justify-end text-sm"><button type="button" onClick={handlePasswordReset} disabled={loading} className="font-bold text-wine">Forgot password?</button></div>
    {message && <p role="status" aria-live="polite" className="bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
    <button type="submit" disabled={loading} className="min-h-12 bg-wine px-5 font-bold text-white disabled:opacity-60">{loading ? "Signing in…" : "Sign in"}</button>
  </form>;
}
