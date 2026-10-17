import type { MetadataRoute } from "next";
import { isProductionIndexingEnabled, siteUrl } from "@/lib/site-config";
export default function robots(): MetadataRoute.Robots { return isProductionIndexingEnabled ? { rules: { userAgent: "*", allow: "/", disallow: "/admin/" }, sitemap: `${siteUrl}/sitemap.xml`, host: siteUrl } : { rules: { userAgent: "*", disallow: "/" } }; }
