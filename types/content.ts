export type ServiceKind = "electrical" | "fiber";
export type ProjectCategory = "Electrical" | "Fiber" | "Combined";

export interface ProjectImage {
  src: string;
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
