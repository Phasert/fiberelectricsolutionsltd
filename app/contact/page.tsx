import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { getPublicBusinessSettings } from "@/lib/settings/public-repository";
import { formatBusinessHours } from "@/lib/settings/presentation";
import { siteUrl } from "@/lib/site-config";

export const metadata: Metadata = { title: "Contact FES", description: "Contact Fiber & Electric Solutions Ltd. about electrical and fiber-optic services in Trinidad and Tobago.", alternates: { canonical: `${siteUrl}/contact` } };

export default async function ContactPage() {
  const settings = await getPublicBusinessSettings();
  return <><header className="grain bg-ink text-white"><div className="shell py-20 sm:py-28"><p className="eyebrow !text-[#ef91a6]">Contact FES</p><h1 className="display mt-5 text-5xl sm:text-7xl">Start a conversation.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">Send the team a general message. For project pricing and detailed work requests, use the quotation form.</p></div></header><section className="section-pad"><div className="shell grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"><ContactForm/><aside className="h-fit rounded-lg bg-ink p-6 text-white"><p className="eyebrow !text-[#ef91a6]">Direct contact</p>{settings?<div className="mt-5 grid gap-3 text-sm text-white/70">{settings.phone&&<a className="font-bold text-[#ef91a6]" href={settings.phone.href}>{settings.phone.label}</a>}{settings.email&&<a className="font-bold text-[#ef91a6]" href={settings.email.href}>{settings.email.label}</a>}<p>{settings.location}</p><dl className="mt-3 grid gap-2">{settings.businessHours.map(entry=><div key={entry.day} className="flex justify-between gap-4"><dt>{entry.day}</dt><dd>{formatBusinessHours(entry)}</dd></div>)}</dl></div>:<p className="mt-5 text-sm leading-6 text-white/60">Public contact details are being prepared.</p>}</aside></div></section></>;
}
