import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FIREBASE_CACHE_NAMESPACE } from "@/lib/firebase/cache-namespace";
import { publicBusinessSettingsSchema } from "@/lib/settings/schema";
import { PUBLIC_BUSINESS_SETTINGS_TAG } from "@/lib/settings/public-cache";
import type { PublicBusinessSettings, PublicContactLink } from "@/types/content";

const storedSchema = z.object({
  schemaVersion: z.literal(1),
  approvalStatus: z.literal("Approved"),
  public: publicBusinessSettingsSchema,
});
const fixturePattern = /\bphase\s+[a-z]\d+\b|\bstaging(?:[- ]only)?\b|\bbrowser\s+(?:test|verification)\b|\bemulator\b|\bacceptance\s+test\b/i;
const testEmailPattern = /@(example\.(?:com|org|net)|[^@]+\.test)$/i;
const whatsappHosts = new Set(["wa.me", "api.whatsapp.com", "whatsapp.com", "www.whatsapp.com"]);

function externalLink(label: string, value: string): PublicContactLink | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return { label, href: url.toString() };
  } catch {
    return null;
  }
}

function phoneLink(value: string): PublicContactLink | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7) return null;
  return { label: value, href: `tel:${value.trim().startsWith("+") ? "+" : ""}${digits}` };
}

function whatsappLink(explicitUrl: string, number: string): PublicContactLink | null {
  if (explicitUrl) {
    try {
      const url = new URL(explicitUrl);
      if (url.protocol === "https:" && whatsappHosts.has(url.hostname.toLowerCase())) return { label: number || "WhatsApp", href: url.toString() };
    } catch {}
  }
  const digits = number.replace(/\D/g, "");
  return digits.length >= 7 ? { label: number, href: `https://wa.me/${digits}` } : null;
}

export async function getPublicBusinessSettingsUncached(): Promise<PublicBusinessSettings | null> {
  const snapshot = await getAdminFirestore().collection("businessSettings").doc("public-v1").get();
  if (!snapshot.exists) return null;
  const parsed = storedSchema.safeParse(snapshot.data());
  if (!parsed.success) return null;
  const settings = parsed.data.public;
  if (fixturePattern.test(`${settings.businessName} ${settings.publicLocation} ${settings.seo.title} ${settings.seo.description}`) || testEmailPattern.test(settings.publicEmail)) return null;

  const email = settings.publicEmail ? { label: settings.publicEmail, href: `mailto:${settings.publicEmail}` } : null;
  const phone = phoneLink(settings.publicPhone);
  const whatsapp = whatsappLink(settings.socialLinks.whatsapp, settings.whatsappNumber);
  const socialLinks = [
    externalLink("Facebook", settings.socialLinks.facebook),
    externalLink("Instagram", settings.socialLinks.instagram),
    externalLink("LinkedIn", settings.socialLinks.linkedin),
  ].filter((link): link is PublicContactLink => link !== null);

  return {
    businessName: settings.businessName,
    email,
    phone,
    whatsapp,
    location: settings.publicLocation,
    maps: externalLink("View location", settings.googleMapsUrl),
    googleBusiness: externalLink("Google Business Profile", settings.socialLinks.googleBusiness),
    socialLinks,
    businessHours: settings.businessHours.map(({ day, open, opensAt, closesAt }) => ({ day, open, opensAt, closesAt })),
    seo: { title: settings.seo.title, description: settings.seo.description },
  };
}

const getCached = unstable_cache(getPublicBusinessSettingsUncached, ["public-business-settings-v1",FIREBASE_CACHE_NAMESPACE], {
  tags: [PUBLIC_BUSINESS_SETTINGS_TAG],
  revalidate: 3600,
});

export const getPublicBusinessSettings = cache(getCached);
