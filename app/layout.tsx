import type { Metadata } from "next";
import { SiteChrome } from "@/components/layout/site-chrome";
import { isProductionIndexingEnabled, siteUrl } from "@/lib/site-config";
import { getPublicBusinessSettings } from "@/lib/settings/public-repository";
import { getPublicSeoDefaults } from "@/lib/settings/presentation";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> { const settings=await getPublicBusinessSettings(); const seo=getPublicSeoDefaults(settings); return {metadataBase:new URL(siteUrl),title:{default:seo.title,template:"%s | FES"},description:seo.description,openGraph:{type:"website",locale:"en_TT",siteName:settings?.businessName??"Fiber & Electric Solutions Ltd.",title:seo.title,description:seo.description},robots:{index:isProductionIndexingEnabled,follow:isProductionIndexingEnabled}}; }

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { const settings=await getPublicBusinessSettings(); const structured=settings?{"@context":"https://schema.org","@type":"Organization",name:settings.businessName,url:siteUrl,...(settings.phone?{telephone:settings.phone.label}:{}),...(settings.email?{email:settings.email.label}:{}),...(settings.socialLinks.length||settings.googleBusiness?{sameAs:[...settings.socialLinks.map((link)=>link.href),...(settings.googleBusiness?[settings.googleBusiness.href]:[])]}:{})}:null; return <html lang="en" data-scroll-behavior="smooth"><body><a href="#main" className="sr-only z-[100] bg-white p-3 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to content</a>{structured&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured).replace(/</g,"\\u003c")}}/>}<SiteChrome settings={settings}>{children}</SiteChrome></body></html>; }
