import { aboutContent, electricalServices, fiberServices } from "@/data/content";
import type { ManagedCta, ManagedService } from "@/types/admin";

export const defaultPages = {
  homepage: { heroHeading: "Make it good. Make it last.", heroDescription: "Professional electrical and fiber optic solutions, presented with clarity and built around the work.", primaryCtaLabel: "Request a quote", secondaryCtaLabel: "Explore our work", serviceHeading: "Power and connectivity, treated with equal precision.", serviceDescription: "Explore FES capability across commercial and industrial electrical work and fiber optic infrastructure.", aboutHeading: "A clearer view of the work behind the name.", aboutDescription: "FES is focused on electrical and fiber optic services. Company background, credentials and approved project history will be added only after client confirmation.", heroImageId: "" },
  electrical: { heading: "Electrical Services", description: "Safe, reliable electrical solutions delivered by qualified professionals." },
  fiber: { heading: "Fiber Optic Services", description: "Professional fiber optic installation, testing and support." },
  about: { heroHeading: aboutContent.hero.title, heroDescription: aboutContent.hero.description, overviewHeading: aboutContent.introduction.title, overviewBody: aboutContent.introduction.paragraphs.join("\n\n"), capabilitiesHeading: aboutContent.capabilities.title, capabilitiesDescription: aboutContent.capabilities.description, imageId: "" },
  cta: { items: [
    { id: "home-quote", placement: "Homepage hero", label: "Request a quote", supportingText: "Primary action in the homepage hero.", destination: "/request-a-quote", enabled: true, essential: true },
    { id: "home-projects", placement: "Homepage hero", label: "Explore our work", supportingText: "Secondary action in the homepage hero.", destination: "/projects", enabled: true },
    { id: "about-projects", placement: "About FES", label: "Explore the project structure", supportingText: "Links company visitors to approved project content.", destination: "/projects", enabled: true },
  ] satisfies ManagedCta[] },
};

export const defaultServices: ManagedService[] = [...electricalServices.map((service, index) => ({ id: `electrical-${service.slug}`, category: "electrical" as const, slug: service.slug, title: service.title, shortDescription: service.description, detailedDescription: service.description, imageId: "", displayOrder: index + 1, status: "Published" as const, enabled: true })), ...fiberServices.map((service, index) => ({ id: `fiber-${service.slug}`, category: "fiber" as const, slug: service.slug, title: service.title, shortDescription: service.description, detailedDescription: service.description, imageId: "", displayOrder: index + 1, status: "Published" as const, enabled: true }))];
