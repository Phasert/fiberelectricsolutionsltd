import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/layout/logo";
import { verifyAdminSession } from "@/lib/auth/session";

export default async function AdminLogin(){
  if (await verifyAdminSession()) redirect("/admin");
  return <div className="grid min-h-screen bg-paper lg:grid-cols-2"><section className="hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between"><Logo light/><div><p className="eyebrow !text-[#db8298]">FES content manager</p><h1 className="display mt-6 max-w-lg text-6xl">Keep the website current, without the technical clutter.</h1></div><p className="text-sm text-white/40">Secure administrator access</p></section><section className="grid place-items-center p-5"><div className="w-full max-w-md bg-white p-7 shadow-xl shadow-black/5 sm:p-10"><p className="text-xs font-black uppercase tracking-[.16em] text-wine">Administrator access</p><h1 className="display mt-3 text-4xl">Welcome back.</h1><p className="mt-4 text-sm leading-6 text-ink/55">Sign in with an approved FES administrator account.</p><LoginForm/></div></section></div>;
}
