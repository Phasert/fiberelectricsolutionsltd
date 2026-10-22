import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createQuoteRequest: vi.fn(), sendQuoteEmails: vi.fn(), logEmailFailure: vi.fn() }));
vi.mock("../../lib/quotes/repository", () => ({ createQuoteRequest: mocks.createQuoteRequest }));
vi.mock("../../lib/quotes/attachments", () => ({ prepareQuoteAttachments: vi.fn().mockResolvedValue([]) }));
vi.mock("../../lib/email/delivery", () => ({ sendQuoteEmails: mocks.sendQuoteEmails, logEmailFailure: mocks.logEmailFailure }));
import { POST } from "../../app/api/quote-requests/route";

const quote = { schemaVersion: 1, submissionKey: "3f468b65-bd19-484d-9df4-3d12b94144dc", name: "Ada Lovelace", email: "ada@example.com", phone: "", preferredContact: "Email", service: "Fiber Optic", selectedServiceIds: [], location: "Port of Spain", propertyType: "Commercial", description: "Install and certify a new fiber run between two rooms.", preferredTimeframe: "Next month", consentAcknowledged: true, attachments: [] };

describe("quote email sequencing", () => {
  it("keeps the saved reference when SMTP fails and does not write twice", async () => {
    mocks.createQuoteRequest.mockResolvedValue({ id: "FES-123", duplicate: false }); mocks.sendQuoteEmails.mockRejectedValue(new Error("EMAIL_NOT_ACCEPTED"));
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
    const response = await POST(new Request("http://localhost:3000/api/quote-requests", { method: "POST", headers: { "content-type": "application/json", origin: "http://localhost:3000" }, body: JSON.stringify({ startedAt: Date.now() - 3_000, companyWebsite: "", quote }) }));
    expect(response.status).toBe(201); expect(await response.json()).toMatchObject({ ok: true, reference: "FES-123", emailAcceptedBySmtp: false }); expect(mocks.createQuoteRequest).toHaveBeenCalledOnce(); expect(mocks.sendQuoteEmails).toHaveBeenCalledOnce();
  });
  it("does not resend email for an idempotent duplicate", async () => {
    mocks.createQuoteRequest.mockResolvedValueOnce({ id: "FES-123", duplicate: true }); mocks.sendQuoteEmails.mockClear();
    const response = await POST(new Request("http://localhost:3000/api/quote-requests", { method: "POST", headers: { "content-type": "application/json", origin: "http://localhost:3000" }, body: JSON.stringify({ startedAt: Date.now() - 3_000, companyWebsite: "", quote }) }));
    expect(response.status).toBe(200); expect(mocks.sendQuoteEmails).not.toHaveBeenCalled();
  });
});
