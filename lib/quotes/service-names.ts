import { electricalServices, fiberServices } from "@/data/content";

const titles = new Map([...electricalServices, ...fiberServices].map(service => [service.slug, service.title]));

export function formatQuoteServices(ids: readonly string[] = []): string {
  return ids.map(id => titles.get(id) ?? id).join(", ") || "None selected";
}
