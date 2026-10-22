import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ sendContactEmails: vi.fn(), logEmailFailure: vi.fn() }));
vi.mock("../../lib/email/delivery", () => mocks);
import { resetContactRateLimitsForTesting } from "../../lib/contact/rate-limit";
import { POST } from "../../app/api/contact/route";

const valid = () => ({ schemaVersion: 1, submissionKey: crypto.randomUUID(), startedAt: Date.now() - 3_000, companyWebsite: "", name: "Ada Lovelace", email: "ada@example.com", phone: "+1 868 555 0100", subject: "Service enquiry", message: "Please contact me about a fiber installation." });
const request = (body: unknown, headers: Record<string, string> = {}) => new Request("http://localhost:3000/api/contact", { method: "POST", headers: { "content-type": "application/json", origin: "http://localhost:3000", "user-agent": "test", "x-forwarded-for": crypto.randomUUID(), ...headers }, body: JSON.stringify(body) });

describe("contact route", () => {
  beforeEach(() => { vi.clearAllMocks(); resetContactRateLimitsForTesting(); mocks.sendContactEmails.mockResolvedValue({ acceptedBySmtp: true }); });
  it("reports success only after both messages are SMTP-accepted", async () => { const response = await POST(request(valid())); expect(response.status).toBe(200); expect(await response.json()).toEqual({ ok: true, acceptedBySmtp: true }); expect(mocks.sendContactEmails).toHaveBeenCalledOnce(); });
  it("rejects invalid submissions before email", async () => { const response = await POST(request({ ...valid(), email: "invalid", message: "short" })); expect(response.status).toBe(400); expect(mocks.sendContactEmails).not.toHaveBeenCalled(); });
  it("fails safely when SMTP authentication fails", async () => { mocks.sendContactEmails.mockRejectedValueOnce(Object.assign(new Error("Invalid login"), { code: "EAUTH" })); const response = await POST(request(valid())); expect(response.status).toBe(503); expect(await response.json()).toEqual({ error: "Your message could not be sent. Please try again later." }); });
  it("silently accepts the honeypot without sending email", async () => { const response = await POST(request({ ...valid(), companyWebsite: "spam.example" })); expect(response.status).toBe(202); expect(mocks.sendContactEmails).not.toHaveBeenCalled(); });
  it("rate limits repeated clients", async () => { const shared = { "x-forwarded-for": "203.0.113.5" }; for (let count = 0; count < 5; count++) expect((await POST(request(valid(), shared))).status).toBe(200); expect((await POST(request(valid(), shared))).status).toBe(429); });
});
