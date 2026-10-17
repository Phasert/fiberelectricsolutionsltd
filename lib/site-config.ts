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

export const configuredSiteUrl = normalizeSiteUrl(process.env.SITE_URL);
export const siteUrl = configuredSiteUrl ?? LOCAL_SITE_URL;
export const isProductionIndexingEnabled = process.env.NODE_ENV === "production" && configuredSiteUrl !== null;
