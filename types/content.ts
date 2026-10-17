export type ServiceKind = "electrical" | "fiber";
export type ProjectCategory = "Electrical" | "Fiber" | "Combined";

export interface ProjectImage {
  src: string;
  alt?: string;
  caption?: string;
}

export interface Service {
  slug: string;
  title: string;
  description: string;
  kind: ServiceKind;
  icon: string;
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
