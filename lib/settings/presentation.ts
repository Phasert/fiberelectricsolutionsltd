import type { PublicBusinessHour, PublicBusinessSettings } from "@/types/content";

export const DEFAULT_PUBLIC_SEO = {
  title: "Fiber & Electric Solutions Ltd.",
  description: "Professional electrical and fiber optic solutions in Trinidad & Tobago.",
};

export function getPublicSeoDefaults(settings: PublicBusinessSettings | null) {
  return settings?.seo ?? DEFAULT_PUBLIC_SEO;
}

export function formatBusinessTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function formatBusinessHours(entry: PublicBusinessHour) {
  return entry.open ? `${formatBusinessTime(entry.opensAt)}–${formatBusinessTime(entry.closesAt)}` : "Closed";
}
