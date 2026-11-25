import { z } from "zod";
import { formatFibreText } from "./spelling";

const text = (max: number) => z.string().trim().min(1).max(max).transform(formatFibreText);
const optionalText = (max: number) => z.string().trim().max(max).default("");

export const defaultHomepageHeroSlides = [
  { id: "infrastructure", headline: "Powering what matters. Connecting what comes next.", description: "Practical electrical and fibre optic solutions for homes, businesses and projects across Trinidad & Tobago.", imageId: "", fallbackSrc: "/images/home/slideshow/hero-electrical-infrastructure-1672.webp", fallbackAlt: "Illustrative electrical distribution equipment and conduit in a cinematic industrial setting", focalPoint: { x: 68, y: 50 } },
  { id: "electrical", headline: "Electrical solutions built for reliability.", description: "Professional electrical installation and infrastructure services tailored to your project requirements.", imageId: "", fallbackSrc: "/images/home/slideshow/hero-electrical-installation-1672.webp", fallbackAlt: "Illustrative industrial electrical installation with distribution panels and organized cabling", focalPoint: { x: 66, y: 50 } },
  { id: "fiber", headline: "Better connections start here.", description: "Fibre optic infrastructure solutions designed to support dependable connectivity.", imageId: "", fallbackSrc: "/images/home/slideshow/hero-fiber-optic-technician-1672.webp", fallbackAlt: "Illustrative technician working with fibre optic connections and networking equipment", focalPoint: { x: 68, y: 50 } },
] as const;

const homepageHeroSlideSchema = z.object({
  id: z.enum(["infrastructure", "electrical", "fiber"]),
  headline: text(160), description: text(600), imageId: optionalText(160),
  fallbackSrc: z.string().regex(/^\/images\/home\/slideshow\/[a-z0-9-]+\.webp$/),
  fallbackAlt: text(220),
  focalPoint: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }),
});

export const sectionSchema = z.enum(["homepage", "electrical", "fiber", "about"]);
export type SiteContentSection = z.infer<typeof sectionSchema>;

export const homepageContentSchema = z.object({
  heroHeading: text(160), heroDescription: text(600),
  serviceHeading: text(160), serviceDescription: text(600),
  aboutHeading: text(160), aboutDescription: text(600),
  heroImageId: optionalText(160),
  heroSlides: z.array(homepageHeroSlideSchema).length(3).default(defaultHomepageHeroSlides.map(slide=>({...slide,focalPoint:{...slide.focalPoint}}))),
});
export const servicePageContentSchema = z.object({ heading: text(160), description: text(800), heroImageId: z.string().trim().max(160).optional() });
const correctFoundingYear = (value: string) => value.replace(/\b(since|established(?: in)?|founded(?: in)?) 2004\b/gi, "$1 2008");

export const aboutContentSchema = z.object({
  heroHeading: text(160), heroDescription: text(600),
  overviewHeading: text(160).transform(correctFoundingYear), overviewBody: text(2000).transform(correctFoundingYear),
  establishedYear: z.number().int().min(1900).max(2100).transform(year => year === 2004 ? 2008 : year).default(2008),
  labels: z.object({
    introEyebrow:text(100), established:text(60), location:text(100), storyEyebrow:text(100),
    companyImageCaption:text(160), imageFallbackText:text(240), approachEyebrow:text(100), expertiseEyebrow:text(100),
    electricalLabel:text(80), fiberLabel:text(80),
  }).default({introEyebrow:"About FES · Trinidad & Tobago",established:"Established",location:"Trinidad & Tobago",storyEyebrow:"Our story",companyImageCaption:"Fiber & Electric Solutions Ltd.",imageFallbackText:"Electrical and fibre-optic capability under one company.",approachEyebrow:"Our working approach",expertiseEyebrow:"Our expertise",electricalLabel:"Electrical",fiberLabel:"Fibre Optic"}),
  approachHeading: text(160).default("How we approach our work"),
  approachDescription: text(1000).default("Each requirement is considered in context, with attention to planning, communication and the finished installation."),
  approachItems: z.array(z.object({ title:text(100), description:text(500) })).min(3).max(4).default([
    {title:"Start with the requirement",description:"Understand the site, the intended outcome and the practical constraints before work begins."},
    {title:"Plan for the conditions",description:"Consider how the electrical or fibre-optic work fits the property, programme and surrounding systems."},
    {title:"Keep the work clear",description:"Prioritize tidy execution and straightforward communication from the initial conversation through handover."},
  ]),
  capabilitiesHeading: text(160), capabilitiesDescription: text(1000),
  electricalExpertiseTitle: text(100).default("Electrical infrastructure"),
  electricalExpertiseBody: text(800).default("Electrical installation, upgrades and related infrastructure for residential, commercial and industrial requirements."),
  fiberExpertiseTitle: text(100).default("Fibre-optic connectivity"),
  fiberExpertiseBody: text(800).default("Fibre-optic installation, splicing, testing and consulting for dependable building and site connectivity."),
  imageId: optionalText(160),
});
export const pageInputSchema = z.discriminatedUnion("section", [
  z.object({ section: z.literal("homepage"), status: z.enum(["Draft", "Published"]), content: homepageContentSchema }),
  z.object({ section: z.literal("electrical"), status: z.enum(["Draft", "Published"]), content: servicePageContentSchema }),
  z.object({ section: z.literal("fiber"), status: z.enum(["Draft", "Published"]), content: servicePageContentSchema }),
  z.object({ section: z.literal("about"), status: z.enum(["Draft", "Published"]), content: aboutContentSchema }),
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
export type PageInput = z.infer<typeof pageInputSchema>;
export type SiteContentAdminState = {
  homepage: { status: "Draft" | "Published"; content: HomepageContent };
  electrical: { status: "Draft" | "Published"; content: ServicePageContent };
  fiber: { status: "Draft" | "Published"; content: ServicePageContent };
  about: { status: "Draft" | "Published"; content: AboutContent };
};
