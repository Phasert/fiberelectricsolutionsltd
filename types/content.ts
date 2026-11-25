export type ServiceKind = "electrical" | "fiber";
export type ProjectCategory = "Electrical" | "Fiber" | "Combined";

export interface ProjectImage {
  type?: "image" | "video";
  src: string;
  poster?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  alt?: string;
  caption?: string;
}

export interface PublicProject {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  summary: string;
  description?: string;
  location?: string;
  period?: string;
  featuredImage: string;
  featuredImageAlt: string;
  featuredImageFit?: "cover" | "contain";
  gallery: ProjectImage[];
  featured: boolean;
  publishedAt?: string;
  updatedAt?: string;
}

export interface Service {
  slug: string;
  title: string;
  description: string;
  kind: ServiceKind;
  icon: string;
}

export interface PublicService {
  id: string;
  category: ServiceKind;
  slug: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  displayOrder: number;
}

export interface PublicHomepageContent {
  heroHeading: string;
  heroDescription: string;
  serviceHeading: string;
  serviceDescription: string;
  aboutHeading: string;
  aboutDescription: string;
  heroImageSrc?: string;
  heroImageAlt?: string;
  heroSlides: Array<{ id: string; headline: string; description: string; imageId: string; fallbackSrc: string; fallbackAlt: string; focalPoint: { x: number; y: number }; imageSrc?: string; imageAlt?: string }>;
}

export interface PublicServicePageContent { heading: string; description: string; heroImageSrc?: string; heroImageAlt?: string; }
export interface PublicAboutContent {
  heroHeading: string;
  heroDescription: string;
  overviewHeading: string;
  overviewBody: string;
  establishedYear: number;
  labels: {
    introEyebrow: string; established: string; location: string; storyEyebrow: string;
    companyImageCaption: string; imageFallbackText: string; approachEyebrow: string; expertiseEyebrow: string;
    electricalLabel: string; fiberLabel: string;
  };
  approachHeading: string;
  approachDescription: string;
  approachItems: Array<{ title: string; description: string }>;
  capabilitiesHeading: string;
  capabilitiesDescription: string;
  electricalExpertiseTitle: string;
  electricalExpertiseBody: string;
  fiberExpertiseTitle: string;
  fiberExpertiseBody: string;
  imageSrc?: string;
  imageAlt?: string;
}

export interface Project {
  id?: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  summary: string;
  description?: string;
  scope?: string[];
  location?: string;
  period?: string;
  featuredImage: string;
  featuredImageAlt?: string;
  gallery: (string | ProjectImage)[];
  featured?: boolean;
  status: "placeholder" | "approved";
  publicationStatus?: "Draft" | "Published";
  demo?: boolean;
}

export type ResourceCategory = "Electrical" | "Fiber Optic" | "Company Updates";
export type PublicationStatus = "Draft" | "Published";
export interface PublicRichTextMark { type: "bold" | "italic" | "strike" | "code" | "link"; attrs?: { href: string; target: "_blank"; rel: string }; }
export interface PublicRichTextNode { type: "doc" | "paragraph" | "heading" | "bulletList" | "orderedList" | "listItem" | "blockquote" | "hardBreak" | "text"; text?: string; attrs?: { level?: number }; marks?: PublicRichTextMark[]; content?: PublicRichTextNode[]; }
export interface PublicArticle {
  id: string;
  slug: string;
  title: string;
  kind: "FES article" | "Company update";
  category: ResourceCategory;
  summary: string;
  publishedAt?: string;
  featured: boolean;
  featuredImage: string;
  featuredImageAlt: string;
  readingTime: string;
  content: PublicRichTextNode;
}
export interface PublicExternalResource {
  id: string;
  title: string;
  source: string;
  url: string;
  summary: string;
  category: ResourceCategory;
  publishedAt?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
}
export interface ArticleSection { heading?: string; paragraphs?: string[]; list?: string[]; quote?: string; }
export interface Article {
  slug: string;
  title: string;
  summary: string;
  contentType: "FES Article" | "Company Update";
  category: ResourceCategory;
  publishedAt?: string;
  author?: string;
  readingTime?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  featured?: boolean;
  content: ArticleSection[];
  publicationStatus: PublicationStatus;
  approvalStatus: "placeholder" | "approved";
  demo?: boolean;
}

export interface Tip {
  id: string;
  type: "do" | "dont";
  title: string;
  body: string;
}

export interface PublicTip {
  id: string;
  type: "do" | "dont";
  title: string;
  body: string;
  category?: "Electrical" | "Fiber Optic" | "General";
  image?: string;
}

export interface PublicFeaturedContent {
  project: PublicProject | null;
  resource: PublicArticle | PublicExternalResource | null;
  tips: PublicTip[];
}

export interface PublicContactLink { label: string; href: string; }
export interface PublicBusinessHour { day: string; open: boolean; opensAt: string; closesAt: string; }
export interface PublicBusinessSettings {
  businessName: string;
  email: PublicContactLink | null;
  phone: PublicContactLink | null;
  whatsapp: PublicContactLink | null;
  location: string;
  maps: PublicContactLink | null;
  googleBusiness: PublicContactLink | null;
  socialLinks: PublicContactLink[];
  businessHours: PublicBusinessHour[];
}

export interface ExternalResource {
  id: string;
  title: string;
  source: string;
  url?: string;
  summary: string;
  category: Exclude<ResourceCategory, "Company Updates">;
  publicationStatus: PublicationStatus;
  approvalStatus: "placeholder" | "approved";
}

export interface AboutContent {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
  };
  introduction: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
  };
  capabilities: {
    eyebrow: string;
    title: string;
    description: string;
  };
  closing: {
    eyebrow: string;
    title: string;
    description: string;
  };
}
