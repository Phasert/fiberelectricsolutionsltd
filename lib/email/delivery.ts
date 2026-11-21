import "server-only";
import nodemailer from "nodemailer";
import type { SendMailOptions, SentMessageInfo } from "nodemailer";
import { join } from "node:path";
import { getEmailConfig } from "@/lib/email/config";
import { contactBusinessTemplate, contactCustomerTemplate, quoteBusinessTemplate, quoteCustomerTemplate, type ContactEmailInput } from "@/lib/email/templates";
import type { QuoteRequestInput } from "@/lib/quotes/schemas";

export type MailTransport = { sendMail(message: SendMailOptions): Promise<SentMessageInfo> };
const safeHeader = (value: string) => value.replace(/[\r\n]+/g, " ").trim();
const logoAttachment = { filename: "fes-logo.png", path: join(process.cwd(), "public", "images", "fes-logo-email.png"), cid: "fes-logo", contentDisposition: "inline" as const };

function transport(): MailTransport {
  const config = getEmailConfig();
  return nodemailer.createTransport({ host: config.host, port: config.port, secure: true, auth: { user: config.user, pass: config.password }, connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 20_000 });
}

async function accepted(mail: MailTransport, options: SendMailOptions, recipient: string) {
  const result = await mail.sendMail(options);
  const recipients = Array.isArray(result.accepted) ? result.accepted.map(String) : [];
  if (!recipients.some(value => value.toLowerCase() === recipient.toLowerCase())) throw new Error("EMAIL_NOT_ACCEPTED");
}

export async function sendContactEmails(input: ContactEmailInput, injected?: MailTransport) {
  const config = getEmailConfig(), mail = injected ?? transport();
  const business = contactBusinessTemplate(input), customer = contactCustomerTemplate(input);
  await Promise.all([
    accepted(mail, { from: { name: "FES Website", address: config.from }, to: config.recipient, replyTo: input.email, subject: safeHeader(`Website enquiry: ${input.subject}`), attachments: [logoAttachment], ...business }, config.recipient),
    accepted(mail, { from: { name: "Fiber & Electric Solutions Ltd.", address: config.from }, to: input.email, replyTo: config.recipient, subject: "We received your FES message", attachments: [logoAttachment], ...customer }, input.email),
  ]);
  return { acceptedBySmtp: true as const };
}

export async function sendQuoteEmails(input: QuoteRequestInput, reference: string, injected?: MailTransport) {
  const config = getEmailConfig(), mail = injected ?? transport(), business = quoteBusinessTemplate(input, reference);
  const jobs = [accepted(mail, { from: { name: "FES Website", address: config.from }, to: config.recipient, replyTo: input.email || config.recipient, subject: safeHeader(`Quotation request ${reference}`), attachments: [logoAttachment], ...business }, config.recipient)];
  if (input.email) {
    const customer = quoteCustomerTemplate(input, reference);
    jobs.push(accepted(mail, { from: { name: "Fiber & Electric Solutions Ltd.", address: config.from }, to: input.email, replyTo: config.recipient, subject: safeHeader(`FES quotation request ${reference} received`), attachments: [logoAttachment], ...customer }, input.email));
  }
  await Promise.all(jobs);
  return { acceptedBySmtp: true as const, confirmationSent: Boolean(input.email) };
}

export function logEmailFailure(flow: "contact" | "quote", error: unknown) {
  const code = error instanceof Error && /^[A-Z0-9_]+$/.test(error.message) ? error.message : "SMTP_ERROR";
  console.error("Email processing failed", { flow, code });
}
