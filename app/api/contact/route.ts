import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requestHasTrustedOrigin } from "@/lib/auth/session";
import { enforceContactRateLimit } from "@/lib/contact/rate-limit";
import { contactSubmissionSchema } from "@/lib/contact/schema";
import { logEmailFailure, sendContactEmails } from "@/lib/email/delivery";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  if (!requestHasTrustedOrigin(request)) return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return NextResponse.json({ error: "Unsupported request format." }, { status: 415 });
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) return NextResponse.json({ error: "The request is too large." }, { status: 413 });
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) return NextResponse.json({ error: "The request is too large." }, { status: 413 });
    const input = contactSubmissionSchema.parse(JSON.parse(body));
    if (input.companyWebsite) return NextResponse.json({ ok: true }, { status: 202 });
    const elapsed = Date.now() - input.startedAt;
    if (elapsed < 1_500 || elapsed > 2 * 60 * 60 * 1000) return NextResponse.json({ error: "Please review the form and try again." }, { status: 400 });
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    await enforceContactRateLimit(`${ip}|${request.headers.get("user-agent") || "unknown"}`);
    await sendContactEmails(input);
    return NextResponse.json({ ok: true, acceptedBySmtp: true }, { status: 200 });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof ZodError) return NextResponse.json({ error: "Check the highlighted information and try again." }, { status: 400 });
    if (error instanceof Error && error.message === "CONTACT_RATE_LIMITED") return NextResponse.json({ error: "Too many messages were received. Please wait and try again." }, { status: 429 });
    logEmailFailure("contact", error);
    return NextResponse.json({ error: "Your message could not be sent. Please try again later." }, { status: 503 });
  }
}
