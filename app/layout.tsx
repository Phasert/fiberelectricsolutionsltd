import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.fes.co.tt"),
  title: { default: "Fiber & Electric Solutions Ltd.", template: "%s | FES" },
  description: "Professional electrical and fiber optic solutions in Trinidad & Tobago.",
  openGraph: { type: "website", locale: "en_TT", siteName: "Fiber & Electric Solutions Ltd.", title: "Fiber & Electric Solutions Ltd.", description: "Make it good. Make it last." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><a href="#main" className="sr-only z-[100] bg-white p-3 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to content</a><Header/><main id="main">{children}</main><Footer/></body></html>; }
