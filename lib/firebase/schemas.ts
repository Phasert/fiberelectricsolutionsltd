import { z } from "zod";

export const administratorSchema = z.object({
  email: z.email(),
  displayName: z.string().trim().min(1).max(100),
  role: z.literal("admin"),
  active: z.boolean(),
});

export const adminDashboardContentSchema = z.object({
  title: z.string().trim().min(1).max(160),
  summary: z.string().trim().min(1).max(500),
  status: z.enum(["draft", "published"]),
  updatedAt: z.string().datetime(),
});

export const sessionRequestSchema = z.object({ idToken: z.string().min(20) });
export const passwordResetSchema = z.object({ email: z.email() });
