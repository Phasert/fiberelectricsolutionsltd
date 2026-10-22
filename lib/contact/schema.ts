import { z } from "zod";

const noHeaders = (value: string) => !/[\r\n]/.test(value);
export const contactSubmissionSchema = z.object({
  schemaVersion: z.literal(1),
  submissionKey: z.uuid(),
  startedAt: z.number().int().positive(),
  companyWebsite: z.string().max(200).optional().default(""),
  name: z.string().trim().min(2).max(120).refine(noHeaders),
  email: z.email().max(254).refine(noHeaders),
  phone: z.string().trim().max(40).refine(value => !value || value.replace(/\D/g, "").length >= 7).refine(noHeaders).optional().default(""),
  subject: z.string().trim().min(3).max(160).refine(noHeaders),
  message: z.string().trim().min(10).max(3_000),
});
export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
