import type { Metadata } from "next";
import { QuoteForm } from "@/components/forms/quote-form";
import { electricalServices, fiberServices } from "@/data/content";
import { getPublicBusinessSettings } from "@/lib/settings/public-repository";
import { formatBusinessHours } from "@/lib/settings/presentation";
export const metadata: Metadata = { title: "Request a Quote", description: "Prepare an electrical or fiber optic quote request for FES." };
export default async function QuotePage({searchParams}:{searchParams:Promise<{service?:string}>}) {
  const {service}=await searchParams;
  const initialService=service==="Electrical"||service==="Fiber Optic"?service:undefined;
  const services=[...electricalServices,...fiberServices].map(({slug,title,kind})=>({id:slug,title,category:kind}));
  const settings=await getPublicBusinessSettings();
  return <>
    <section className="grain relative overflow-hidden bg-ink text-white"><div className="absolute inset-y-0 right-0 w-2/5 bg-[radial-gradient(circle_at_center,#7d1028_0,transparent_68%)] opacity-70"/><div className="shell relative py-14 sm:py-18"><p className="eyebrow !text-[#db8298]">Request a quote</p><h1 className="display mt-5 max-w-4xl text-5xl sm:text-6xl lg:text-7xl">Tell us about your <span className="text-[#c42b4e]">project.</span></h1><p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">Use this guided form to prepare a preview of your electrical or fiber optic requirements. Nothing is submitted yet.</p></div></section>
    <section className="py-12 sm:py-16"><div className="shell grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"><QuoteForm initialService={initialService} services={services}/><aside className="h-fit border border-ink/10 bg-white p-6 shadow-sm" aria-labelledby="approved-contact-heading"><p className="eyebrow">Approved contact</p><h2 id="approved-contact-heading" className="display mt-3 text-3xl">Contact FES</h2>{settings?<div className="mt-5 grid gap-3 text-sm text-ink/70">{settings.phone&&<a className="font-bold text-wine" href={settings.phone.href}>{settings.phone.label}</a>}{settings.email&&<a className="font-bold text-wine" href={settings.email.href}>{settings.email.label}</a>}{settings.whatsapp&&<a className="font-bold text-wine" href={settings.whatsapp.href} target="_blank" rel="noreferrer">WhatsApp</a>}<p>{settings.location}</p><dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">{settings.businessHours.map((entry)=><div key={entry.day} className="contents"><dt>{entry.day}</dt><dd>{formatBusinessHours(entry)}</dd></div>)}</dl></div>:<p className="mt-5 text-sm leading-6 text-ink/60">Approved public contact details are not available yet. You can prepare a quote preview, but it will not be sent.</p>}</aside></div></section>
  </>;
}
