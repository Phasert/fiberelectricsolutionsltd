import "server-only";

import { createHash, createHmac } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { electricalServices, fiberServices } from "@/data/content";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireQuoteSubmissionsEnabled } from "@/lib/quotes/config";
import { quoteRequestSchema } from "@/lib/quotes/schemas";

const allowedServices = new Map([...electricalServices, ...fiberServices].map(service => [service.slug, service.kind]));
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const protectedDigest = (value: string, secret: string) => createHmac("sha256", secret).update(value).digest("hex");
const expiresAt = (now: Date, milliseconds: number) => Timestamp.fromMillis(now.getTime() + milliseconds);

export async function createQuoteRequest(input: unknown, source: { ip: string; userAgent: string }) {
  const config = requireQuoteSubmissionsEnabled(), value = quoteRequestSchema.parse(input);
  for (const id of value.selectedServiceIds) { const category = allowedServices.get(id); if (!category || (value.service === "Electrical" && category !== "electrical") || (value.service === "Fiber Optic" && category !== "fiber")) throw new Error("QUOTE_SERVICE_INVALID"); }
  const database = getAdminFirestore(), now = new Date();
  const fingerprint = digest(JSON.stringify({ ...value, submissionKey: undefined })), idempotencyId = digest(value.submissionKey), abuseId = protectedDigest(`${source.ip}\n${source.userAgent}`, config.abuseHashSecret);
  const idempotencyRef = database.collection("quoteSubmissionKeys").doc(idempotencyId), duplicateRef = database.collection("quoteDuplicateKeys").doc(fingerprint), rateRef = database.collection("quoteRateLimits").doc(abuseId), requestRef = database.collection("quoteRequests").doc();
  return database.runTransaction(async transaction => {
    const [idempotency, duplicate, rate] = await Promise.all([transaction.get(idempotencyRef), transaction.get(duplicateRef), transaction.get(rateRef)]);
    if (idempotency.exists) { if (idempotency.get("fingerprint") !== fingerprint) throw new Error("QUOTE_IDEMPOTENCY_CONFLICT"); return { id: String(idempotency.get("requestId")), duplicate: true }; }
    if (duplicate.exists && duplicate.get("expiresAt") instanceof Timestamp && duplicate.get("expiresAt").toMillis() > now.getTime()) { const requestId = String(duplicate.get("requestId")); transaction.create(idempotencyRef, { requestId, fingerprint, createdAt: Timestamp.fromDate(now), expiresAt: expiresAt(now, config.duplicateWindowMs) }); return { id: requestId, duplicate: true }; }
    const windowStart = rate.get("windowStart") instanceof Timestamp ? rate.get("windowStart").toMillis() : 0, withinWindow = now.getTime() - windowStart < config.rateWindowMs, count = withinWindow ? Number(rate.get("count") || 0) : 0;
    if (count >= config.rateLimit) throw new Error("QUOTE_RATE_LIMITED");
    transaction.create(requestRef, { schemaVersion: 1, name: value.name, email: value.email || null, phone: value.phone || null, preferredContact: value.preferredContact, service: value.service, selectedServiceIds: value.selectedServiceIds, location: value.location, propertyType: value.propertyType, description: value.description, preferredTimeframe: value.preferredTimeframe || null, attachments: [], status: "New", consent: { acknowledged: true, version: config.consentVersion, acknowledgedAt: Timestamp.fromDate(now) }, source: { channel: "website", ipHash: protectedDigest(source.ip, config.abuseHashSecret), userAgentHash: protectedDigest(source.userAgent, config.abuseHashSecret) }, submittedAt: Timestamp.fromDate(now), updatedAt: Timestamp.fromDate(now), retentionUntil: expiresAt(now, config.retentionDays * 24 * 60 * 60 * 1000) });
    transaction.create(idempotencyRef, { requestId: requestRef.id, fingerprint, createdAt: Timestamp.fromDate(now), expiresAt: expiresAt(now, config.duplicateWindowMs) });
    transaction.create(duplicateRef, { requestId: requestRef.id, createdAt: Timestamp.fromDate(now), expiresAt: expiresAt(now, config.duplicateWindowMs) });
    transaction.set(rateRef, { count: count + 1, windowStart: Timestamp.fromMillis(withinWindow ? windowStart : now.getTime()), expiresAt: expiresAt(now, config.rateWindowMs) });
    return { id: requestRef.id, duplicate: false };
  });
}
