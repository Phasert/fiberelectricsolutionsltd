import type { Metadata } from "next";
import { SiteChrome } from "@/components/layout/site-chrome";
import { isProductionIndexingEnabled, siteUrl } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Fiber & Electric Solutions Ltd.", template: "%s | FES" },
  description: "Professional electrical and fiber optic solutions in Trinidad & Tobago.",
  openGraph: { type: "website", locale: "en_TT", siteName: "Fiber & Electric Solutions Ltd.", title: "Fiber & Electric Solutions Ltd.", description: "Make it good. Make it last." },
  robots: { index: isProductionIndexingEnabled, follow: isProductionIndexingEnabled },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" data-scroll-behavior="smooth"><body><a href="#main" className="sr-only z-[100] bg-white p-3 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to content</a><SiteChrome>{children}</SiteChrome></body></html>; }
