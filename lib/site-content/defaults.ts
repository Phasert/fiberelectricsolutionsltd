import { aboutContent, electricalServices, fiberServices } from "@/data/content";
import type { ManagedCta, ManagedService } from "@/types/admin";

export const defaultPages = {
  homepage: { heroHeading: "Powering what matters. Connecting what comes next.", heroDescription: "Fiber & Electric Solutions Ltd. delivers practical electrical and fiber-optic infrastructure for homes, businesses and project sites across Trinidad & Tobago.", primaryCtaLabel: "Request a quote", secondaryCtaLabel: "View our work", serviceHeading: "One team for power and connectivity.", serviceDescription: "From electrical installation and upgrades to fiber splicing, testing and structured cabling, FES brings careful workmanship to the systems your property depends on.", aboutHeading: "Built around careful work and clear communication.", aboutDescription: "FES helps clients move from a defined need to a practical solution. We focus on tidy installations, straightforward communication and work that is planned for the conditions on site.", heroImageId: "" },
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
