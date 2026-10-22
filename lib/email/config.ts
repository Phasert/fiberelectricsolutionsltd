import "server-only";
import { z } from "zod";

const schema = z.object({
  host: z.string().trim().min(1),
  port: z.coerce.number().int().min(1).max(65_535),
  user: z.email().max(254),
  password: z.string().transform(value => value.replace(/\s/g, "")).pipe(z.string().length(16)),
  from: z.email().max(254),
  recipient: z.email().max(254),
});

export type EmailConfig = z.infer<typeof schema>;

export function getEmailConfig(): EmailConfig {
  const parsed = schema.safeParse({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_APP_PASSWORD,
    from: process.env.SMTP_FROM,
    recipient: process.env.CONTACT_RECIPIENT_EMAIL,
  });
  if (!parsed.success) throw new Error("EMAIL_NOT_CONFIGURED");
  return parsed.data;
}
