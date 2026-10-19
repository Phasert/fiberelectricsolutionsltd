"use client";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
import type { PublicBusinessSettings } from "@/types/content";
export function SiteChrome({children,settings}:{children:React.ReactNode;settings:PublicBusinessSettings|null}){const path=usePathname();if(path.startsWith("/admin"))return <>{children}</>;return <><Header settings={settings}/><main id="main">{children}</main><Footer settings={settings}/></>}
