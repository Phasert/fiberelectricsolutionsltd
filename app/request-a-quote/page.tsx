import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { QuoteForm } from "@/components/forms/quote-form";
import { electricalServices, fiberServices } from "@/data/content";
import { getPublicBusinessSettings } from "@/lib/settings/public-repository";
import { quoteSubmissionsAreEnabled } from "@/lib/quotes/config";
import { siteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Request an Electrical or Fibre Optic Quote",
  description: "Request a quote from FES for electrical or fibre optic work in Trinidad & Tobago.",
  alternates: { canonical: `${siteUrl}/request-a-quote` },
};

export default async function QuotePage({searchParams}:{searchParams:Promise<{service?:string}>}) {
  const {service}=await searchParams;
  const initialService=service==="Electrical"||service==="Fiber Optic"?service:undefined;
  const services=[...electricalServices,...fiberServices].map(({slug,title,kind})=>({id:slug,title,category:kind}));
  const settings=await getPublicBusinessSettings();
  const submissionsEnabled=quoteSubmissionsAreEnabled();

  return <>
    <section className="grain relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,#7d1028_0,transparent_70%)] opacity-65"/>
      <div className="shell relative py-10 sm:py-12">
        <p className="eyebrow !text-[#db8298]">Request a quote</p>
        <h1 className="display mt-4 max-w-4xl text-4xl sm:text-5xl lg:text-6xl">Let&apos;s discuss your <span className="text-[#c42b4e]">project.</span></h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">Tell us what you need, and our team will review your request and get in touch.</p>
      </div>
    </section>
    <section className="py-9 sm:py-12">
      <div className="shell">
        {!submissionsEnabled&&<div role="status" className="mb-6 rounded-md border border-amber-700/25 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Online submissions are currently unavailable.</strong> You can still review the form.</div>}
        <QuoteForm initialService={initialService} services={services} submissionsEnabled={submissionsEnabled}/>
        {settings&&<aside className="mt-8 rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="contact-help-heading">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="eyebrow">Need assistance?</p><h2 id="contact-help-heading" className="display mt-2 text-3xl">Contact FES</h2></div>
            <div className="flex flex-wrap gap-3 text-sm font-bold text-wine">
              {settings.phone&&<a className="inline-flex min-h-11 items-center gap-2 rounded-md border border-wine/15 px-4 hover:bg-wine hover:text-white" href={settings.phone.href}><Phone size={16}/>{settings.phone.label}</a>}
              {settings.email&&<a className="inline-flex min-h-11 items-center gap-2 rounded-md border border-wine/15 px-4 hover:bg-wine hover:text-white" href={settings.email.href}><Mail size={16}/>Email FES</a>}
              {settings.whatsapp&&<a className="inline-flex min-h-11 items-center gap-2 rounded-md border border-wine/15 px-4 hover:bg-wine hover:text-white" href={settings.whatsapp.href} target="_blank" rel="noreferrer"><MessageCircle size={16}/>WhatsApp</a>}
              {settings.location&&<span className="inline-flex min-h-11 items-center gap-2 px-2 font-normal text-ink/60"><MapPin size={16}/>{settings.location}</span>}
            </div>
          </div>
        </aside>}
      </div>
    </section>
  </>;
}
