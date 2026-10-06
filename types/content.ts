export type ServiceKind = "electrical" | "fiber";
export type ProjectCategory = "Electrical" | "Fiber" | "Combined";

export interface Service {
  slug: string;
  title: string;
  description: string;
  kind: ServiceKind;
  icon: string;
}

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  summary: string;
  location?: string;
  period?: string;
  featuredImage: string;
  gallery: string[];
  featured?: boolean;
  status: "placeholder" | "approved";
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: "Electrical" | "Fiber" | "Company";
  publishedAt?: string;
  content: string[];
  status: "placeholder" | "approved";
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
  status: "placeholder" | "approved";
}
