import { z } from "zod";

const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).default("");

export const sectionSchema = z.enum(["homepage", "electrical", "fiber", "about", "cta"]);
export type SiteContentSection = z.infer<typeof sectionSchema>;

const ctaItemSchema = z.object({
  id: z.string().trim().min(1).max(80),
  placement: text(100),
  label: text(80),
  supportingText: optionalText(300),
  destination: z.string().trim().min(1).max(500).refine((value) => value.startsWith("/") || /^https:\/\//i.test(value), "Use an internal path or an HTTPS URL."),
  enabled: z.boolean(),
  essential: z.boolean().optional(),
});

export const homepageContentSchema = z.object({
  heroHeading: text(160), heroDescription: text(600),
  primaryCtaLabel: text(80), secondaryCtaLabel: text(80),
  serviceHeading: text(160), serviceDescription: text(600),
  aboutHeading: text(160), aboutDescription: text(600),
  heroImageId: optionalText(160),
});
export const servicePageContentSchema = z.object({ heading: text(160), description: text(800) });
export const aboutContentSchema = z.object({
  heroHeading: text(160), heroDescription: text(600),
  overviewHeading: text(160), overviewBody: text(2000),
  capabilitiesHeading: text(160), capabilitiesDescription: text(1000),
  imageId: optionalText(160),
});
export const ctaContentSchema = z.object({
  items: z.array(ctaItemSchema).max(30).superRefine((items, ctx) => {
    if (new Set(items.map((item) => item.id)).size !== items.length) ctx.addIssue({ code: "custom", message: "CTA IDs must be unique." });
  }),
});

export const pageInputSchema = z.discriminatedUnion("section", [
  z.object({ section: z.literal("homepage"), status: z.enum(["Draft", "Published"]), content: homepageContentSchema }),
  z.object({ section: z.literal("electrical"), status: z.enum(["Draft", "Published"]), content: servicePageContentSchema }),
  z.object({ section: z.literal("fiber"), status: z.enum(["Draft", "Published"]), content: servicePageContentSchema }),
  z.object({ section: z.literal("about"), status: z.enum(["Draft", "Published"]), content: aboutContentSchema }),
  z.object({ section: z.literal("cta"), status: z.enum(["Draft", "Published"]), content: ctaContentSchema }),
]);

export const serviceInputSchema = z.object({
  id: z.string().trim().min(1).max(100),
  category: z.enum(["electrical", "fiber"]),
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: text(160), shortDescription: text(500), detailedDescription: text(3000),
  imageId: optionalText(160), displayOrder: z.number().int().min(0).max(999),
  status: z.enum(["Draft", "Published"]), enabled: z.boolean(),
});
export const servicesInputSchema = z.object({
  category: z.enum(["electrical", "fiber"]), services: z.array(serviceInputSchema).max(100),
}).superRefine(({ category, services }, ctx) => {
  if (services.some((service) => service.category !== category)) ctx.addIssue({ code: "custom", message: "Every service must match the selected category." });
  for (const key of ["id", "slug", "displayOrder"] as const) {
    if (new Set(services.map((service) => service[key])).size !== services.length) ctx.addIssue({ code: "custom", message: `Service ${key}s must be unique.` });
  }
});

export type HomepageContent = z.infer<typeof homepageContentSchema>;
export type ServicePageContent = z.infer<typeof servicePageContentSchema>;
export type AboutContent = z.infer<typeof aboutContentSchema>;
export type CtaContent = z.infer<typeof ctaContentSchema>;
export type PageInput = z.infer<typeof pageInputSchema>;
export type SiteContentAdminState = {
  homepage: { status: "Draft" | "Published"; content: HomepageContent };
  electrical: { status: "Draft" | "Published"; content: ServicePageContent };
  fiber: { status: "Draft" | "Published"; content: ServicePageContent };
  about: { status: "Draft" | "Published"; content: AboutContent };
  cta: { status: "Draft" | "Published"; content: CtaContent };
};
