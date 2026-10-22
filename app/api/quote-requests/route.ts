import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requestHasTrustedOrigin } from "@/lib/auth/session";
import { getQuoteSubmissionConfig } from "@/lib/quotes/config";
import { createQuoteRequest } from "@/lib/quotes/repository";
import { quoteSubmissionTransportSchema } from "@/lib/quotes/schemas";
import {prepareQuoteAttachments} from "@/lib/quotes/attachments";
import { logEmailFailure, sendQuoteEmails } from "@/lib/email/delivery";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!requestHasTrustedOrigin(request)) return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  const config = getQuoteSubmissionConfig();
  if (config.mode === "live-disabled") return NextResponse.json({ error: "Online quote submissions are awaiting owner privacy and retention approval." }, { status: 503 });
  const contentType=request.headers.get("content-type")?.toLowerCase()??"",multipart=contentType.startsWith("multipart/form-data"),json=contentType.startsWith("application/json");
  if (!multipart&&!json) return NextResponse.json({ error: "Unsupported request format." }, { status: 415 });
  const maximum=multipart?config.maxMultipartBodyBytes:config.maxBodyBytes;
  if (Number(request.headers.get("content-length") || 0) > maximum) return NextResponse.json({ error: "The request is too large." }, { status: 413 });
  try {
    let transport,files:File[]=[];
    if(multipart){const form=await request.formData(),payload=form.get("payload");if(typeof payload!=="string"||new TextEncoder().encode(payload).byteLength>config.maxBodyBytes) return NextResponse.json({error:"The request is too large."},{status:413});transport=quoteSubmissionTransportSchema.parse(JSON.parse(payload));files=form.getAll("photos").filter((item):item is File=>item instanceof File);if(files.length&&!config.attachmentsEnabled)return NextResponse.json({error:"Photo attachments are awaiting owner privacy approval."},{status:503});}
    else{const body = await request.text();if (new TextEncoder().encode(body).byteLength > config.maxBodyBytes) return NextResponse.json({ error: "The request is too large." }, { status: 413 });transport = quoteSubmissionTransportSchema.parse(JSON.parse(body));}
    if (transport.companyWebsite) return NextResponse.json({ ok: true, reference: "received" }, { status: 202 });
    const elapsed = Date.now() - transport.startedAt;
    if (elapsed < 1_500 || elapsed > 2 * 60 * 60 * 1000) return NextResponse.json({ error: "Please review the form and try again." }, { status: 400 });
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const prepared=await prepareQuoteAttachments(files,config.attachmentLimits);
    const result = await createQuoteRequest(transport.quote, { ip: forwarded || "unknown", userAgent: request.headers.get("user-agent") || "unknown" },prepared);
    let emailAcceptedBySmtp = false;
    if (!result.duplicate) {
      try { await sendQuoteEmails(transport.quote, result.id); emailAcceptedBySmtp = true; }
      catch (error) { logEmailFailure("quote", error); }
    }
    return NextResponse.json({ ok: true, reference: result.id, duplicate: result.duplicate, emailAcceptedBySmtp }, { status: result.duplicate ? 200 : 201 });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof ZodError) return NextResponse.json({ error: "Check the highlighted information and try again." }, { status: 400 });
    const code = error instanceof Error ? error.message : "";
    if (code === "QUOTE_RATE_LIMITED") return NextResponse.json({ error: "Too many requests were received. Please wait and try again." }, { status: 429 });
    if (code === "QUOTE_IDEMPOTENCY_CONFLICT") return NextResponse.json({ error: "This submission could not be safely retried. Refresh the page and try again." }, { status: 409 });
    if (code === "QUOTE_SERVICE_INVALID") return NextResponse.json({ error: "One or more selected services are unavailable." }, { status: 400 });
    if (code.startsWith("QUOTE_ATTACHMENT_")) return NextResponse.json({ error: code.includes("COUNT")?"Attach no more than four photographs.":code.includes("TOTAL")?"The selected photographs exceed the 12 MB total limit.":code.includes("SIZE")?"Each photograph must be 5 MB or smaller.":code.includes("TYPE")||code.includes("SIGNATURE")?"Use genuine JPG, PNG or WebP photographs.":"One of the photographs could not be processed safely." }, { status: 400 });
    return NextResponse.json({ error: "Your request could not be saved. Please try again." }, { status: 500 });
  }
}
