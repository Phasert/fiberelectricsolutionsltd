import type { ProjectCategory } from "./content";

export type PublishStatus = "Draft" | "Published";
export type EnquiryStatus = "New" | "Reviewing" | "Contacted" | "Closed";
export type QuoteServiceCategory = "Electrical" | "Fiber Optic" | "Both Services" | "Not Sure Yet";
export type PreferredContactMethod = "Phone" | "Email" | "WhatsApp";

/** Customer-supplied fields shared by the public form and the future admin workflow. */
export interface QuoteRequestCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  preferredContact?: PreferredContactMethod;
  service: QuoteServiceCategory;
  selectedServiceIds: string[];
  location: string;
  propertyType: "Residential" | "Commercial" | "Industrial" | "Other" | "";
  description: string;
  preferredTimeframe?: string;
  attachments: string[];
}

export interface ProjectGalleryItem { mediaId:string; alt:string; caption:string; order:number; }
export type MediaAspectRatio = "original"|"freeform"|"1:1"|"4:3"|"16:9"|"9:16";
export interface MediaCrop { x:number; y:number; width:number; height:number; rotation:0|90|180|270; aspectRatio:MediaAspectRatio; }
export interface AdminProject { id:string; slug:string; title:string; category:ProjectCategory; summary:string; location:string; period:string; status:PublishStatus; featured:boolean; image:string; coverMediaId:string|null; gallery:ProjectGalleryItem[]; galleryCount:number; updatedAt:string; }
export interface AdminResource { id:string; slug:string; title:string; kind:"FES article"|"Company update"|"External resource"; category:"Electrical"|"Fiber Optic"|"Company Updates"; summary:string; source?:string; externalUrl?:string; status:PublishStatus; featured?:boolean; publishedAt?:string; updatedAt:string; coverImage?:string; coverMediaId?:string|null; content?: Record<string, unknown>; }
export interface AdminTip { id:string; type:"Do"|"Don’t"; title:string; body:string; enabled:boolean; order:number; category?:"Electrical"|"Fiber Optic"|"General"; imageMediaId?:string|null; }
export interface Enquiry extends Omit<QuoteRequestCustomerInput, "propertyType"> {
  id:string;
  name:string;
  contact?:string;
  email?:string;
  phone?:string;
  location:string;
  propertyType:string;
  selectedServiceIds: string[];
  submittedAt:string;
  submittedAtIso?:string;
  updatedAt?:string;
  status:EnquiryStatus;
  attachments:string[];
  attachmentDetails?:EnquiryAttachment[];
  consentAcknowledged?:boolean;
  photoConsentAcknowledged?:boolean;
  consentAcknowledgedAt?:string;
  consentVersion?:string;
  retentionUntil?:string;
  notes?:EnquiryNote[];
}
export interface EnquiryAttachment { id:string; url:string; mimeType:string; sizeBytes:number; width:number; height:number; status:string; }
export interface EnquiryNote { id:string; body:string; authorUid:string; authorEmail:string; createdAt:string; }
export interface MediaItem {
  id:string;
  name:string;
  src:string;
  kind:"image"|"video";
  type:"JPG"|"PNG"|"WEBP"|"HEIC"|"MP4"|"MOV";
  size:string;
  sizeBytes:number;
  width:number;
  height:number;
  durationSeconds?:number|null;
  posterSrc?:string|null;
  alt:string;
  caption:string;
  status:"Pending"|"Processing"|"Ready"|"Failed"|"Deleting";
  projectId?:string;
  project?:string;
  roles?:Array<"project-gallery"|"resource-cover"|"service-image"|"site-content"|"branding"|"general">;
  category:ProjectCategory;
  isCover?:boolean;
  createdAt:string;
  crop?:MediaCrop|null;
  slideshow?:SlideshowAssignment|null;
  galleryPublished?:boolean;
  galleryExcluded?:boolean;
  galleryOrder?:number;
}

export type SlideshowPlacement="hero"|"electrical"|"fiber";
export interface SlideshowAssignment { placement:SlideshowPlacement;order:number;alt:string;focalPoint:{x:number;y:number};published:boolean;headline?:string;description?:string;ctaLabel?:string;ctaHref?:string; }

export interface BusinessHoursDay {
  day: string;
  open: boolean;
  opensAt: string;
  closesAt: string;
}

export interface BusinessSettings {
  businessName: string;
  publicEmail: string;
  publicPhone: string;
  whatsappNumber: string;
  publicLocation: string;
  googleMapsUrl: string;
  businessHours: BusinessHoursDay[];
  socialLinks: {
    facebook: string;
    instagram: string;
    linkedin: string;
    googleBusiness: string;
    whatsapp: string;
  };
}

export type SiteContentSection = "homepage" | "electrical" | "fiber" | "about" | "cta";
export type ContentStatus = "Draft" | "Published";

export interface ManagedService {
  id: string;
  category: "electrical" | "fiber";
  slug: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  imageId?: string;
  displayOrder: number;
  status: ContentStatus;
  enabled: boolean;
}

export interface ManagedCta {
  id: string;
  placement: string;
  label: string;
  supportingText: string;
  destination: string;
  enabled: boolean;
  essential?: boolean;
}
