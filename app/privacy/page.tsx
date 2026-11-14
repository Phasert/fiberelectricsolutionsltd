import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-config";

export const metadata:Metadata={title:"Privacy Notice",description:"How Fiber & Electric Solutions Ltd. handles quotation request information.",alternates:{canonical:`${siteUrl}/privacy`}};

export default function PrivacyPage(){return <>
  <section className="bg-ink text-white"><div className="shell py-14 sm:py-18"><p className="eyebrow !text-[#db8298]">Customer information</p><h1 className="display mt-5 text-5xl sm:text-6xl">Privacy Notice</h1><p className="mt-5 max-w-2xl leading-7 text-white/65">How Fiber &amp; Electric Solutions Ltd. uses information submitted through its contact and quotation forms.</p></div></section>
  <section className="py-12 sm:py-16"><div className="shell max-w-3xl space-y-9 text-sm leading-7 text-ink/70">
    <NoticeSection title="Information we collect"><p>When you contact FES or request a quotation, FES collects the contact details and message you enter. Quotation requests also include the service, location, property and project information you provide. If you choose to attach photographs, FES stores sanitized copies privately; photographs are never included in notification emails. Technical anti-abuse information is converted to protected hashes where it is retained rather than stored as raw network identifiers.</p></NoticeSection>
    <NoticeSection title="Why we collect it"><p>FES uses this information to receive and acknowledge your message, review your requirements, assess requested work, contact you and protect the forms from misuse. Contact and quotation details are processed by the configured email provider to send notifications and acknowledgements. They are not collected through these forms for advertising or resale.</p></NoticeSection>
    <NoticeSection title="Who can access it"><p>Access is restricted to active, authorized FES administrator accounts. Customer photographs remain private and are not part of the public website or editorial Media Library.</p></NoticeSection>
    <NoticeSection title="How long we keep it"><p>The approved retention period for quotation enquiries and associated photographs is 12 months. Automatic production deletion is not active yet; the deletion, backup, recovery and legal-hold procedure must be reviewed and tested before activation.</p></NoticeSection>
    <NoticeSection title="Contact FES"><p>For questions or requests concerning information submitted through these forms, email <a className="font-bold text-wine underline" href="mailto:kylenagee55@gmail.com">kylenagee55@gmail.com</a>.</p></NoticeSection>
    <p className="border-t border-black/10 pt-6 text-xs text-ink/45">Notice version: privacy-notice-2026-10-20-v1. Operational and legal review remains required before live customer submissions are enabled.</p>
  </div></section>
</>;}
function NoticeSection({title,children}:{title:string;children:React.ReactNode}){return <section><h2 className="display text-3xl text-ink">{title}</h2><div className="mt-3">{children}</div></section>;}
