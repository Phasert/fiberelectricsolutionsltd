import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requestHasTrustedOrigin } from "@/lib/auth/session";
import { getQuoteSubmissionConfig } from "@/lib/quotes/config";
import { createQuoteRequest } from "@/lib/quotes/repository";
import { quoteSubmissionTransportSchema } from "@/lib/quotes/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!requestHasTrustedOrigin(request)) return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  const config = getQuoteSubmissionConfig();
  if (config.mode === "live-disabled") return NextResponse.json({ error: "Online quote submissions are awaiting owner privacy and retention approval." }, { status: 503 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return NextResponse.json({ error: "Unsupported request format." }, { status: 415 });
  if (Number(request.headers.get("content-length") || 0) > config.maxBodyBytes) return NextResponse.json({ error: "The request is too large." }, { status: 413 });
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > config.maxBodyBytes) return NextResponse.json({ error: "The request is too large." }, { status: 413 });
    const transport = quoteSubmissionTransportSchema.parse(JSON.parse(body));
    if (transport.companyWebsite) return NextResponse.json({ ok: true, reference: "received" }, { status: 202 });
    const elapsed = Date.now() - transport.startedAt;
    if (elapsed < 1_500 || elapsed > 2 * 60 * 60 * 1000) return NextResponse.json({ error: "Please review the form and try again." }, { status: 400 });
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const result = await createQuoteRequest(transport.quote, { ip: forwarded || "unknown", userAgent: request.headers.get("user-agent") || "unknown" });
    return NextResponse.json({ ok: true, reference: result.id, duplicate: result.duplicate }, { status: result.duplicate ? 200 : 201 });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof ZodError) return NextResponse.json({ error: "Check the highlighted information and try again." }, { status: 400 });
    const code = error instanceof Error ? error.message : "";
    if (code === "QUOTE_RATE_LIMITED") return NextResponse.json({ error: "Too many requests were received. Please wait and try again." }, { status: 429 });
    if (code === "QUOTE_IDEMPOTENCY_CONFLICT") return NextResponse.json({ error: "This submission could not be safely retried. Refresh the page and try again." }, { status: 409 });
    if (code === "QUOTE_SERVICE_INVALID") return NextResponse.json({ error: "One or more selected services are unavailable." }, { status: 400 });
    return NextResponse.json({ error: "Your request could not be saved. Please try again." }, { status: 500 });
  }
}
