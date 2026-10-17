import type { Metadata } from "next";
import { QuoteForm } from "@/components/forms/quote-form";
import { electricalServices, fiberServices } from "@/data/content";
export const metadata: Metadata = { title: "Request a Quote", description: "Prepare an electrical or fiber optic quote request for FES." };
export default async function QuotePage({searchParams}:{searchParams:Promise<{service?:string}>}) {
  const {service}=await searchParams;
  const initialService=service==="Electrical"||service==="Fiber Optic"?service:undefined;
  const services=[...electricalServices,...fiberServices].map(({slug,title,kind})=>({id:slug,title,category:kind}));
  return <>
    <section className="grain relative overflow-hidden bg-ink text-white"><div className="absolute inset-y-0 right-0 w-2/5 bg-[radial-gradient(circle_at_center,#7d1028_0,transparent_68%)] opacity-70"/><div className="shell relative py-14 sm:py-18"><p className="eyebrow !text-[#db8298]">Request a quote</p><h1 className="display mt-5 max-w-4xl text-5xl sm:text-6xl lg:text-7xl">Tell us about your <span className="text-[#c42b4e]">project.</span></h1><p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">Need electrical or fiber optic services? Share your project requirements and our team can review the details and follow up with you.</p></div></section>
    <section className="py-12 sm:py-16"><div className="shell"><QuoteForm initialService={initialService} services={services}/></div></section>
  </>;
}
