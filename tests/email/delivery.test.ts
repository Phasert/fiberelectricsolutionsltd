import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SendMailOptions } from "nodemailer";
import { sendQuoteEmails, type MailTransport } from "../../lib/email/delivery";
import { quoteBusinessTemplate, quoteCustomerTemplate } from "../../lib/email/templates";

const quote = { schemaVersion: 1 as const, submissionKey: "3f468b65-bd19-484d-9df4-3d12b94144dc", name: "Ada Lovelace", email: "ada@example.com", phone: "", preferredContact: "Email" as const, service: "Fiber Optic" as const, selectedServiceIds: [], location: "Port of Spain", propertyType: "Commercial" as const, description: "Install and certify a new fiber run between two rooms.", preferredTimeframe: "Next month", consentAcknowledged: true as const, attachments: [] };

beforeEach(() => {
  Object.assign(process.env, { SMTP_HOST: "smtp.gmail.com", SMTP_PORT: "465", SMTP_USER: "anthony@fiberelectricsoltions.com", SMTP_APP_PASSWORD: "abcdefghijklmnop", SMTP_FROM: "anthony@fiberelectricsoltions.com", CONTACT_RECIPIENT_EMAIL: "anthony@fiberelectricsoltions.com" });
});

function mockTransport(accepted = true) {
  const messages: SendMailOptions[] = [];
  const mail: MailTransport = { sendMail: vi.fn(async message => { messages.push(message); const address = typeof message.to === "string" ? message.to : ""; return { accepted: accepted ? [address] : [], rejected: accepted ? [] : [address], envelope: { from: "anthony@fiberelectricsoltions.com", to: [address] }, messageId: "mock-message-id" }; }) };
  return { mail, messages };
}

describe("email delivery", () => {
  it("sends quote messages with only the inline logo and no private photograph data", async () => {
    const { mail, messages } = mockTransport(); await sendQuoteEmails(quote, "FES-100", mail);
    expect(messages).toHaveLength(2); expect(messages.every(item => Array.isArray(item.attachments) && item.attachments.length === 1)).toBe(true);
    expect(messages[0].replyTo).toBe(quote.email); expect(messages[1].to).toBe(quote.email);
    expect(messages.every(item => Boolean(item.html && item.text))).toBe(true);
    expect(messages.every(item => item.attachments?.[0]?.cid === "fes-logo")).toBe(true);
    expect(String(messages[0].html)).toContain('src="cid:fes-logo"'); expect(String(messages[0].html)).not.toContain("storagePath");
  });
  it("rejects an SMTP response that did not accept the recipient", async () => {
    const { mail } = mockTransport(false); await expect(sendQuoteEmails(quote, "FES-100", mail)).rejects.toThrow("EMAIL_NOT_ACCEPTED");
  });
  it("escapes customer content and includes responsive email CSS", () => {
    const quoteEmail = quoteBusinessTemplate({ ...quote, name: "Ada <script>" }, "FES-100");
    expect(quoteEmail.html).toContain("&lt;script&gt;"); expect(quoteEmail.html).toContain("@media(max-width:600px)"); expect(quoteEmail.html).toContain('name="viewport"');
    expect(quoteEmail.text).toContain("Private photographs are intentionally excluded");
    const customerEmail = quoteCustomerTemplate(quote, "FES-100"); expect(customerEmail.html).not.toContain("This acknowledgement is not a quotation, price, or confirmed appointment."); expect(customerEmail.text).not.toContain("This acknowledgement is not a quotation, price, or confirmed appointment.");
  });
});
