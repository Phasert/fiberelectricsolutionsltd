import type { Article, ExternalResource, Project, Service, Tip } from "@/types/content";

export const electricalServices: Service[] = [
  { slug: "commercial-industrial", title: "Commercial & industrial installation", description: "Electrical installation capability for commercial and industrial environments.", kind: "electrical", icon: "bolt" },
  { slug: "data-wiring", title: "Data wiring", description: "Structured data wiring for dependable building connectivity.", kind: "electrical", icon: "network" },
  { slug: "fire-wiring", title: "Fire wiring & devices", description: "Wiring and device installation for approved fire-system requirements.", kind: "electrical", icon: "shield" },
  { slug: "transformers", title: "Transformer installation", description: "Professional transformer installation for approved project scopes.", kind: "electrical", icon: "transformer" },
  { slug: "generators", title: "Generator installation", description: "Generator installation integrated with project electrical requirements.", kind: "electrical", icon: "generator" },
];

export const fiberServices: Service[] = [
  { slug: "fiber-installation", title: "Fiber cable installation", description: "Planned fiber cable installation for reliable infrastructure.", kind: "fiber", icon: "cable" },
  { slug: "fiber-splicing", title: "Fiber splicing", description: "Careful joining and termination of fiber-optic connections.", kind: "fiber", icon: "splice" },
  { slug: "fiber-testing", title: "Fiber testing", description: "Testing to assess connection performance and installation quality.", kind: "fiber", icon: "test" },
  { slug: "fiber-consulting", title: "Fiber consulting", description: "Technical guidance for planning and delivering fiber projects.", kind: "fiber", icon: "consult" },
];

export const projects: Project[] = [
  { slug: "featured-project-placeholder", title: "Featured project", category: "Combined", summary: "Reserved for a client-approved FES project story, scope and photography.", location: "Location to be confirmed", featuredImage: "/images/project-combined.svg", gallery: ["/images/project-combined.svg", "/images/project-electrical.svg", "/images/project-fiber.svg"], featured: true, status: "placeholder" },
  { slug: "electrical-project-placeholder", title: "Electrical project", category: "Electrical", summary: "A structured project entry ready for approved work details and photographs.", location: "Location to be confirmed", featuredImage: "/images/project-electrical.svg", gallery: ["/images/project-electrical.svg", "/images/project-combined.svg"], status: "placeholder" },
  { slug: "fiber-project-placeholder", title: "Fiber infrastructure project", category: "Fiber", summary: "A portfolio template for installation, splicing, testing and project context.", location: "Location to be confirmed", featuredImage: "/images/project-fiber.svg", gallery: ["/images/project-fiber.svg", "/images/project-combined.svg"], status: "placeholder" },
];

export const tips: Tip[] = [
  { id: "plan", type: "do", title: "Plan before work begins", body: "Share the site conditions, required outcome and clear photographs when requesting a quotation." },
  { id: "access", type: "do", title: "Keep equipment accessible", body: "Maintain safe access to electrical panels and communication equipment." },
  { id: "guess", type: "dont", title: "Do not guess at faults", body: "Electrical and fiber issues should be assessed by an appropriate professional." },
];

export const articles: Article[] = [
  { slug: "planning-a-service-request", title: "Preparing a clear service request", excerpt: "What to gather before discussing an electrical or fiber project with FES.", category: "Company", content: ["This article space is prepared for FES-approved guidance.", "Final technical and safety advice will be published only after client review."], status: "placeholder" },
  { slug: "electrical-insight-placeholder", title: "Electrical insight", excerpt: "Reserved for original, client-approved electrical information.", category: "Electrical", content: ["Original FES content will appear here once supplied and approved."], status: "placeholder" },
  { slug: "fiber-insight-placeholder", title: "Fiber insight", excerpt: "Reserved for original, client-approved fiber information.", category: "Fiber", content: ["Original FES content will appear here once supplied and approved."], status: "placeholder" },
];

export const externalResources: ExternalResource[] = [
  { id: "external-placeholder", title: "External industry resource", source: "Source to be approved", summary: "A future attributed summary will link readers to the original publisher.", status: "placeholder" },
];
