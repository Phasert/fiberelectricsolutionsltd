import "server-only";

import { createHash, createHmac } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { electricalServices, fiberServices } from "@/data/content";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getAdminStorage } from "@/lib/firebase/admin";
import { requireQuoteSubmissionsEnabled } from "@/lib/quotes/config";
import { quoteRequestSchema } from "@/lib/quotes/schemas";
import type {PreparedQuoteAttachment} from "@/lib/quotes/attachments";

const allowedServices = new Map([...electricalServices, ...fiberServices].map(service => [service.slug, service.kind]));
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const protectedDigest = (value: string, secret: string) => createHmac("sha256", secret).update(value).digest("hex");
const expiresAt = (now: Date, milliseconds: number) => Timestamp.fromMillis(now.getTime() + milliseconds);

type ObjectWriter={save:(path:string,bytes:Buffer)=>Promise<void>;remove:(paths:string[])=>Promise<void>};
const defaultWriter=():ObjectWriter=>{const bucket=getAdminStorage().bucket();return{save:async(path,bytes)=>{await bucket.file(path).save(bytes,{resumable:false,metadata:{contentType:"image/webp",cacheControl:"private, no-store"}})},remove:async(paths)=>{await Promise.all(paths.map(path=>bucket.file(path).delete({ignoreNotFound:true})))}}};

export async function createQuoteRequest(input: unknown, source: { ip: string; userAgent: string },prepared:PreparedQuoteAttachment[]=[],writer?:ObjectWriter) {
  const config = requireQuoteSubmissionsEnabled(), value = quoteRequestSchema.parse(input);
  for (const id of value.selectedServiceIds) { const category = allowedServices.get(id); if (!category || (value.service === "Electrical" && category !== "electrical") || (value.service === "Fiber Optic" && category !== "fiber")) throw new Error("QUOTE_SERVICE_INVALID"); }
  const database = getAdminFirestore(), now = new Date();
  const attachmentFingerprint=prepared.map(item=>item.checksum),fingerprint = digest(JSON.stringify({ ...value, submissionKey: undefined,attachmentFingerprint })), idempotencyId = digest(value.submissionKey), abuseId = protectedDigest(`${source.ip}\n${source.userAgent}`, config.abuseHashSecret);
  const requestId=idempotencyId.slice(0,32),paths=prepared.map((item,index)=>`quote-photos/private/requests/${requestId}/${fingerprint.slice(0,16)}/${String(index+1).padStart(2,"0")}-${item.checksum.slice(0,16)}.webp`);
  const objectWriter=writer??defaultWriter();
  try{await Promise.all(prepared.map((item,index)=>objectWriter.save(paths[index],item.bytes)));}catch(error){await objectWriter.remove(paths);throw error}
  const idempotencyRef = database.collection("quoteSubmissionKeys").doc(idempotencyId), duplicateRef = database.collection("quoteDuplicateKeys").doc(fingerprint), rateRef = database.collection("quoteRateLimits").doc(abuseId), requestRef = database.collection("quoteRequests").doc(requestId);
  try{const result=await database.runTransaction(async transaction => {
    const [idempotency, duplicate, rate] = await Promise.all([transaction.get(idempotencyRef), transaction.get(duplicateRef), transaction.get(rateRef)]);
    if (idempotency.exists) { if (idempotency.get("fingerprint") !== fingerprint) throw new Error("QUOTE_IDEMPOTENCY_CONFLICT"); return { id: String(idempotency.get("requestId")), duplicate: true,retainUploads:true }; }
    if (duplicate.exists && duplicate.get("expiresAt") instanceof Timestamp && duplicate.get("expiresAt").toMillis() > now.getTime()) { const duplicateRequestId = String(duplicate.get("requestId")),duplicateRequest=await transaction.get(database.collection("quoteRequests").doc(duplicateRequestId));if(duplicateRequest.exists){transaction.create(idempotencyRef, { requestId:duplicateRequestId, fingerprint, createdAt: Timestamp.fromDate(now), expiresAt: expiresAt(now, config.duplicateWindowMs) }); return { id: duplicateRequestId, duplicate: true,retainUploads:false };}transaction.delete(duplicateRef); }
    const windowStart = rate.get("windowStart") instanceof Timestamp ? rate.get("windowStart").toMillis() : 0, withinWindow = now.getTime() - windowStart < config.rateWindowMs, count = withinWindow ? Number(rate.get("count") || 0) : 0;
    if (count >= config.rateLimit) throw new Error("QUOTE_RATE_LIMITED");
    const attachments=prepared.map((item,index)=>({id:`photo-${index+1}`,storagePath:paths[index],mimeType:item.mimeType,sizeBytes:item.sizeBytes,width:item.width,height:item.height,checksum:item.checksum,status:"Ready"}));
    transaction.create(requestRef, { schemaVersion: 1, name: value.name, email: value.email || null, phone: value.phone || null, preferredContact: value.preferredContact, service: value.service, selectedServiceIds: value.selectedServiceIds, location: value.location, propertyType: value.propertyType, description: value.description, preferredTimeframe: value.preferredTimeframe || null, attachments, status: "New", consent: { acknowledged: true, version: config.consentVersion, photoAcknowledged:attachments.length>0, acknowledgedAt: Timestamp.fromDate(now) }, source: { channel: "website", ipHash: protectedDigest(source.ip, config.abuseHashSecret), userAgentHash: protectedDigest(source.userAgent, config.abuseHashSecret) }, submittedAt: Timestamp.fromDate(now), updatedAt: Timestamp.fromDate(now), retentionUntil: expiresAt(now, config.retentionDays * 24 * 60 * 60 * 1000) });
    transaction.create(idempotencyRef, { requestId: requestRef.id, fingerprint, createdAt: Timestamp.fromDate(now), expiresAt: expiresAt(now, config.duplicateWindowMs) });
    transaction.create(duplicateRef, { requestId: requestRef.id, createdAt: Timestamp.fromDate(now), expiresAt: expiresAt(now, config.duplicateWindowMs) });
    transaction.set(rateRef, { count: count + 1, windowStart: Timestamp.fromMillis(withinWindow ? windowStart : now.getTime()), expiresAt: expiresAt(now, config.rateWindowMs) });
    return { id: requestRef.id, duplicate: false,retainUploads:true };
  });if(!result.retainUploads)await objectWriter.remove(paths);return{id:result.id,duplicate:result.duplicate};}catch(error){await objectWriter.remove(paths);throw error}
}

export async function deleteQuoteRequest(requestId:string,writer:Pick<ObjectWriter,"remove">=defaultWriter()){const database=getAdminFirestore(),reference=database.collection("quoteRequests").doc(requestId),snapshot=await reference.get();if(!snapshot.exists)return false;if(snapshot.get("legalHold")===true)throw new Error("QUOTE_LEGAL_HOLD");const paths=(snapshot.get("attachments")??[]).map((item:{storagePath?:string})=>item.storagePath).filter((path:unknown):path is string=>typeof path==="string"&&path.startsWith(`quote-photos/private/requests/${requestId}/`));await writer.remove(paths);await database.recursiveDelete(reference);return true}

export async function cleanupExpiredQuoteRequests(now=new Date()){const snapshot=await getAdminFirestore().collection("quoteRequests").where("retentionUntil","<=",Timestamp.fromDate(now)).get();let removed=0;for(const document of snapshot.docs){if(document.get("legalHold")===true)continue;if(await deleteQuoteRequest(document.id))removed++}return removed}
