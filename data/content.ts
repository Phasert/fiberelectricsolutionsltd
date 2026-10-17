import type { AboutContent, Article, ExternalResource, Project, Service, Tip } from "@/types/content";

export const aboutContent: AboutContent = {
  hero: {
    eyebrow: "About FES · Trinidad & Tobago",
    title: "Powering the work. Connecting what matters.",
    description: "Fiber & Electric Solutions Ltd. provides electrical and fiber-optic services for commercial and industrial requirements across Trinidad and Tobago.",
    image: "/images/hero-infrastructure.svg",
    imageAlt: "Technical illustration of electrical distribution and fiber-optic infrastructure",
  },
  introduction: {
    eyebrow: "Who we are",
    title: "Two essential disciplines. One focused team.",
    paragraphs: [
      "Fiber & Electric Solutions Ltd. supports the infrastructure that keeps businesses powered and connected.",
      "Our capabilities span commercial and industrial electrical work alongside fiber-optic installation, splicing, testing and consulting. Every conversation starts with the requirement, so customers can find the right service and share the details needed to move forward.",
    ],
  },
  capabilities: {
    eyebrow: "Our capabilities",
    title: "Built for power and connectivity.",
    description: "Explore the two core FES service areas and find the capability that fits your requirement.",
  },
  closing: {
    eyebrow: "Start a conversation",
    title: "Let’s discuss what your site needs.",
    description: "Share your electrical or fiber-optic requirements with FES through the existing quote request form.",
  },
};

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
  {
    id: "demo-electrical-01", slug: "demo-commercial-electrical-upgrade", title: "Commercial Electrical Upgrade", category: "Electrical",
    summary: "Sample case study showing how a commercial electrical project can be presented in the FES portfolio.",
    description: "This sample overview demonstrates space for a clear explanation of the project requirement and the work recorded by the administrator.\nWhen approved project information becomes available, this area can describe the work without overstating technical details or outcomes.",
    scope: ["Electrical installation", "Distribution equipment integration", "Data wiring", "Final project checks"],
    location: "Trinidad & Tobago", period: "Demo period", featuredImage: "/images/project-electrical.svg", featuredImageAlt: "Demo illustration representing commercial electrical work",
    gallery: [
      { src: "/images/project-electrical.svg", alt: "Demo illustration of an electrical project", caption: "Sample cover image for layout demonstration." },
      { src: "/images/electrical-services.svg", alt: "Demo electrical services illustration", caption: "Sample supporting gallery image." },
      { src: "/images/project-combined.svg", alt: "Demo combined infrastructure illustration", caption: "Sample detail view for the gallery layout." },
    ], featured: true, status: "approved", publicationStatus: "Published", demo: true,
  },
  {
    id: "demo-fiber-01", slug: "demo-fiber-backbone-installation", title: "Fiber Backbone Installation", category: "Fiber",
    summary: "Sample portfolio entry demonstrating a fiber optic installation story with gallery and scope details.",
    description: "This demonstration project shows how a fiber optic case study can introduce the requirement, supporting context and approved work activities.\nThe content and illustrations are examples only and do not represent completed FES work.",
    scope: ["Fiber cable installation", "Fiber splicing", "Connection testing", "Installation documentation"],
    location: "Trinidad & Tobago", period: "Demo period", featuredImage: "/images/project-fiber.svg", featuredImageAlt: "Demo illustration representing fiber optic infrastructure",
    gallery: [
      { src: "/images/project-fiber.svg", alt: "Demo illustration of fiber optic infrastructure", caption: "Sample cover image for layout demonstration." },
      { src: "/images/fiber-services.svg", alt: "Demo fiber optic services illustration", caption: "Sample supporting gallery image." },
      { src: "/images/project-combined.svg", alt: "Demo combined infrastructure illustration", caption: "Sample project context image." },
    ], featured: true, status: "approved", publicationStatus: "Published", demo: true,
  },
  {
    id: "demo-combined-01", slug: "demo-integrated-power-connectivity", title: "Integrated Power & Connectivity", category: "Combined",
    summary: "Sample combined-services case study illustrating how electrical and fiber optic capabilities can appear together.",
    description: "This sample project demonstrates the case-study format for work involving both FES service areas. It provides room for approved project context, scope and photography when real content is ready.",
    scope: ["Electrical service coordination", "Structured data wiring", "Fiber cable installation", "System testing"],
    featuredImage: "/images/project-combined.svg", featuredImageAlt: "Demo illustration representing integrated electrical and fiber infrastructure",
    gallery: [
      { src: "/images/project-combined.svg", alt: "Demo integrated infrastructure illustration", caption: "Sample combined-services cover image." },
      { src: "/images/project-electrical.svg", alt: "Demo electrical infrastructure illustration", caption: "Sample electrical gallery view." },
      { src: "/images/project-fiber.svg", alt: "Demo fiber infrastructure illustration", caption: "Sample fiber gallery view." },
    ], featured: true, status: "approved", publicationStatus: "Published", demo: true,
  },
  {
    id: "demo-electrical-02", slug: "demo-distribution-equipment-installation", title: "Distribution Equipment Installation", category: "Electrical",
    summary: "Sample project card for an electrical equipment installation, including optional location and completion fields.",
    description: "A concise sample overview showing the presentation of an electrical installation project. Final public copy would be replaced with approved, project-specific information.",
    scope: ["Equipment placement", "Electrical connections", "Project coordination"],
    location: "Central Trinidad", featuredImage: "/images/electrical-services.svg", featuredImageAlt: "Demo technical illustration for an electrical installation",
    gallery: [{ src: "/images/electrical-services.svg", alt: "Demo electrical installation illustration" }, { src: "/images/project-electrical.svg", alt: "Demo electrical project illustration" }],
    status: "approved", publicationStatus: "Published", demo: true,
  },
  {
    id: "demo-fiber-02", slug: "demo-fiber-splicing-testing", title: "Fiber Splicing & Testing", category: "Fiber",
    summary: "Sample entry showing a focused fiber optic service project with a concise scope and responsive gallery.",
    description: "This sample demonstrates how a focused fiber service project can be documented with a short overview and recorded scope of work.",
    scope: ["Fiber preparation", "Fiber splicing", "Connection testing"],
    featuredImage: "/images/fiber-services.svg", featuredImageAlt: "Demo technical illustration for fiber optic services",
    gallery: [{ src: "/images/fiber-services.svg", alt: "Demo fiber service illustration" }, { src: "/images/project-fiber.svg", alt: "Demo fiber project illustration" }],
    status: "approved", publicationStatus: "Published", demo: true,
  },
  {
    id: "demo-combined-02", slug: "demo-structured-infrastructure-fitout", title: "Structured Infrastructure Fit-Out", category: "Combined",
    summary: "Sample combined project that exercises missing optional fields while retaining a complete, polished layout.",
    description: "This example intentionally omits location and completion information to verify that optional project details hide gracefully.",
    scope: ["Electrical infrastructure", "Data wiring", "Fiber connectivity"],
    featuredImage: "/images/hero-infrastructure.svg", featuredImageAlt: "Demo technical illustration of structured infrastructure",
    gallery: [{ src: "/images/hero-infrastructure.svg", alt: "Demo structured infrastructure illustration" }, { src: "/images/project-combined.svg", alt: "Demo combined project illustration" }],
    status: "approved", publicationStatus: "Published", demo: true,
  },
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
  { slug: "planning-a-service-request", title: "Preparing a clear service request", summary: "What to gather before discussing an electrical or fiber-optic project with FES.", contentType: "FES Article", category: "Company Updates", publishedAt: "2026-10-01", readingTime: "2 min read", featuredImage: "/images/project-combined.svg", featuredImageAlt: "Technical illustration of integrated electrical and fiber infrastructure", featured: true, demo: true, content: [{ heading: "Start with the requirement", paragraphs: ["A useful service request explains the site conditions, the required outcome and the type of support being requested."], list: ["The service location and property type", "A clear description of the requirement", "Relevant photographs where they can be taken safely", "Any access or scheduling considerations"] }, { heading: "Share what is known", paragraphs: ["You do not need to diagnose a fault before making contact. Share the information you have and avoid working on electrical or fiber equipment yourself."], quote: "Clear context helps the right questions get asked at the start of the conversation." }], publicationStatus: "Published", approvalStatus: "approved" },
  { slug: "electrical-insight-placeholder", title: "Electrical insight", summary: "Reserved for original, client-approved electrical information.", contentType: "FES Article", category: "Electrical", content: [{ paragraphs: ["Original FES content will appear here once supplied and approved."] }], publicationStatus: "Draft", approvalStatus: "placeholder" },
  { slug: "fiber-insight-placeholder", title: "Fiber insight", summary: "Reserved for original, client-approved fiber information.", contentType: "FES Article", category: "Fiber Optic", content: [{ paragraphs: ["Original FES content will appear here once supplied and approved."] }], publicationStatus: "Draft", approvalStatus: "placeholder" },
];

export const externalResources: ExternalResource[] = [
  { id: "external-placeholder", title: "External industry resource", source: "Source to be approved", summary: "A future attributed summary will link readers to the original publisher.", category: "Fiber Optic", publicationStatus: "Draft", approvalStatus: "placeholder" },
];

const includeDemoContent = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_DEMO_CONTENT === "true";

export const publishedArticles = articles.filter(article => article.publicationStatus === "Published" && article.approvalStatus === "approved" && (includeDemoContent || !article.demo));
export const publishedExternalResources = externalResources.filter(resource => resource.publicationStatus === "Published" && resource.approvalStatus === "approved" && resource.url);
