const LOCAL_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

const vercelProductionUrl = process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;
export const configuredSiteUrl = normalizeSiteUrl(process.env.SITE_URL) ?? normalizeSiteUrl(vercelProductionUrl);
export const siteUrl = configuredSiteUrl ?? LOCAL_SITE_URL;
export const isProductionIndexingEnabled = process.env.NODE_ENV === "production" && configuredSiteUrl !== null && process.env.VERCEL_ENV !== "preview";
