import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.string().url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol), "Use an HTTP or HTTPS URL.")]);
const optionalEmail = z.union([z.literal(""), z.string().email().max(254)]);
const optionalPhone = z.string().trim().max(24).refine((value) => !value || (/^[+()\-\s\d]{7,24}$/.test(value) && value.replace(/\D/g, "").length >= 7), "Enter a valid telephone number with at least 7 digits.");
const time = z.union([z.literal(""), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)]);
const day = z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);

const hoursSchema = z.object({ day, open: z.boolean(), opensAt: time, closesAt: time }).strict().superRefine((value, ctx) => {
  if (value.open && (!value.opensAt || !value.closesAt)) ctx.addIssue({ code: "custom", message: "Open days require opening and closing times." });
  if (value.open && value.opensAt >= value.closesAt) ctx.addIssue({ code: "custom", message: "Closing time must be after opening time." });
});

export const publicBusinessSettingsSchema = z.object({
  businessName: z.string().trim().min(1).max(160),
  publicEmail: optionalEmail,
  publicPhone: optionalPhone,
  whatsappNumber: optionalPhone,
  publicLocation: z.string().trim().max(300),
  googleMapsUrl: optionalUrl,
  businessHours: z.array(hoursSchema).length(7).superRefine((hours, ctx) => {
    const names = hours.map((entry) => entry.day);
    if (new Set(names).size !== 7 || day.options.some((name) => !names.includes(name))) ctx.addIssue({ code: "custom", message: "Opening hours must contain each day exactly once." });
  }),
  socialLinks: z.object({ facebook: optionalUrl, instagram: optionalUrl, linkedin: optionalUrl, tiktok: optionalUrl.default(""), googleBusiness: optionalUrl, whatsapp: optionalUrl }).strict(),
}).strip();

export const businessSettingsInputSchema = z.object({
  approvalStatus: z.enum(["Draft", "Approved"]),
  settings: publicBusinessSettingsSchema,
}).strict().superRefine((value, ctx) => {
  if (value.approvalStatus !== "Approved") return;
  if (!value.settings.publicEmail && !value.settings.publicPhone) ctx.addIssue({ code: "custom", path: ["settings", "publicEmail"], message: "Approved settings require a public email or telephone number." });
  if (!value.settings.publicLocation) ctx.addIssue({ code: "custom", path: ["settings", "publicLocation"], message: "Approved settings require a confirmed public location." });
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsInputSchema>;
export type BusinessSettingsState = BusinessSettingsInput;
