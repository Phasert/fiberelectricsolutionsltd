import { z } from "zod";

const trimmed = (minimum: number, maximum: number) => z.string().trim().min(minimum).max(maximum);
const optionalTrimmed = (maximum: number) => z.string().trim().max(maximum).optional().default("");

export const quoteRequestSchema = z.object({
  schemaVersion: z.literal(1), submissionKey: z.uuid(), name: trimmed(2, 120),
  email: z.union([z.literal(""), z.email().max(254)]).optional().default(""),
  phone: optionalTrimmed(40).refine(value => !value || value.replace(/\D/g, "").length >= 7, "Enter a valid phone number."),
  preferredContact: z.enum(["Phone", "Email", "WhatsApp"]),
  service: z.enum(["Electrical", "Fiber Optic", "Both Services", "Not Sure Yet"]),
  selectedServiceIds: z.array(z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80)).max(12).refine(values => new Set(values).size === values.length, "Service selections must be unique."),
  location: trimmed(2, 160), propertyType: z.enum(["Residential", "Commercial", "Industrial", "Other"]),
  description: trimmed(20, 2_000), preferredTimeframe: optionalTrimmed(160), additionalNotes: z.string().trim().max(1_000).optional(), consentAcknowledged: z.literal(true),
  attachments: z.array(z.never()).max(0).optional().default([]),
}).superRefine((value, context) => {
  if (!value.email && !value.phone) { context.addIssue({ code: "custom", path: ["email"], message: "Provide an email address or phone number." }); context.addIssue({ code: "custom", path: ["phone"], message: "Provide an email address or phone number." }); }
  if (value.preferredContact === "Email" && !value.email) context.addIssue({ code: "custom", path: ["email"], message: "Email is required for email contact." });
  if ((value.preferredContact === "Phone" || value.preferredContact === "WhatsApp") && !value.phone) context.addIssue({ code: "custom", path: ["phone"], message: "Phone is required for this contact method." });
});

export const quoteSubmissionTransportSchema = z.object({ quote: quoteRequestSchema, startedAt: z.number().int().positive(), companyWebsite: z.string().max(200).optional().default("") });
export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
