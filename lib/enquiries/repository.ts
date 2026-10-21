import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { getAdminFirestore, getAdminStorage } from "@/lib/firebase/admin";
import type { Enquiry, EnquiryNote, EnquiryStatus } from "@/types/admin";

export const enquiryStatusSchema = z.enum(["New", "Reviewing", "Contacted", "Closed"]);
export const enquiryNoteSchema = z.object({ body: z.string().trim().min(1).max(2_000) }).strict();

type Actor = { uid:string; email?:string|null };
type StoredAttachment = { id?:unknown; storagePath?:unknown; mimeType?:unknown; sizeBytes?:unknown; width?:unknown; height?:unknown; status?:unknown };
const toIso=(value:unknown)=>value instanceof Timestamp?value.toDate().toISOString():typeof value==="string"?value:"";
const displayDate=(value:string)=>value?new Intl.DateTimeFormat("en-TT",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value)):"Unknown";

function mapEnquiry(id:string,data:Record<string,unknown>,notes:EnquiryNote[]=[]):Enquiry {
  const submittedAtIso=toIso(data.submittedAt);
  const attachmentDetails=Array.isArray(data.attachments)?(data.attachments as StoredAttachment[]).flatMap((item)=>{if(typeof item?.id!=="string")return[];return[{id:item.id,url:`/api/admin/enquiries/${encodeURIComponent(id)}/attachments/${encodeURIComponent(item.id)}`,mimeType:String(item.mimeType??""),sizeBytes:Number(item.sizeBytes??0),width:Number(item.width??0),height:Number(item.height??0),status:String(item.status??"")}] }):[];
  const attachments=attachmentDetails.map(item=>item.url),consent=data.consent&&typeof data.consent==="object"?data.consent as Record<string,unknown>:{};
  const preferredContact=data.preferredContact;
  return {id,name:String(data.name??""),email:typeof data.email==="string"?data.email:undefined,phone:typeof data.phone==="string"?data.phone:undefined,contact:typeof data.email==="string"?data.email:typeof data.phone==="string"?data.phone:undefined,preferredContact:preferredContact==="Phone"||preferredContact==="Email"||preferredContact==="WhatsApp"?preferredContact:undefined,service:(data.service==="Electrical"||data.service==="Fiber Optic"||data.service==="Both Services"||data.service==="Not Sure Yet")?data.service:"Not Sure Yet",selectedServiceIds:Array.isArray(data.selectedServiceIds)?data.selectedServiceIds.filter((item):item is string=>typeof item==="string"):[],location:String(data.location??""),propertyType:String(data.propertyType??""),description:String(data.description??""),preferredTimeframe:typeof data.preferredTimeframe==="string"?data.preferredTimeframe:undefined,submittedAt:displayDate(submittedAtIso),submittedAtIso,updatedAt:toIso(data.updatedAt),status:enquiryStatusSchema.catch("New").parse(data.status),attachments,attachmentDetails,consentAcknowledged:consent.acknowledged===true,photoConsentAcknowledged:consent.photoAcknowledged===true,consentAcknowledgedAt:toIso(consent.acknowledgedAt),consentVersion:typeof consent.version==="string"?consent.version:typeof data.consentVersion==="string"?data.consentVersion:undefined,retentionUntil:toIso(data.retentionUntil),notes};
}

export async function listAdminEnquiries():Promise<Enquiry[]> {
  const snapshot=await getAdminFirestore().collection("quoteRequests").orderBy("submittedAt","desc").get();
  return snapshot.docs.map((doc)=>mapEnquiry(doc.id,doc.data()));
}

export async function getAdminEnquiry(id:string):Promise<Enquiry|undefined> {
  const db=getAdminFirestore(),ref=db.collection("quoteRequests").doc(id),[snapshot,notesSnapshot]=await Promise.all([ref.get(),ref.collection("notes").orderBy("createdAt","asc").get()]);
  if(!snapshot.exists)return undefined;
  const notes=notesSnapshot.docs.map((doc):EnquiryNote=>{const data=doc.data();return{id:doc.id,body:String(data.body??""),authorUid:String(data.authorUid??""),authorEmail:String(data.authorEmail??"Administrator"),createdAt:toIso(data.createdAt)};});
  return mapEnquiry(snapshot.id,snapshot.data()!,notes);
}

export async function updateEnquiryStatus(id:string,status:EnquiryStatus,actor:Actor){
  const parsed=enquiryStatusSchema.parse(status),db=getAdminFirestore(),ref=db.collection("quoteRequests").doc(id);
  await db.runTransaction(async(transaction)=>{const snapshot=await transaction.get(ref);if(!snapshot.exists)throw new Error("ENQUIRY_NOT_FOUND");transaction.update(ref,{status:parsed,updatedAt:Timestamp.now(),updatedBy:actor.uid});});
  return parsed;
}

export async function addEnquiryNote(id:string,input:unknown,actor:Actor):Promise<EnquiryNote>{
  const {body}=enquiryNoteSchema.parse(input),db=getAdminFirestore(),ref=db.collection("quoteRequests").doc(id),noteRef=ref.collection("notes").doc(),createdAt=Timestamp.now();
  await db.runTransaction(async(transaction)=>{const snapshot=await transaction.get(ref);if(!snapshot.exists)throw new Error("ENQUIRY_NOT_FOUND");transaction.create(noteRef,{body,authorUid:actor.uid,authorEmail:actor.email??"Administrator",createdAt});transaction.update(ref,{updatedAt:createdAt,updatedBy:actor.uid});});
  return{id:noteRef.id,body,authorUid:actor.uid,authorEmail:actor.email??"Administrator",createdAt:createdAt.toDate().toISOString()};
}

export async function readEnquiryAttachment(enquiryId:string,attachmentId:string){
  const snapshot=await getAdminFirestore().collection("quoteRequests").doc(enquiryId).get();if(!snapshot.exists)throw new Error("ATTACHMENT_NOT_FOUND");
  const item=(Array.isArray(snapshot.data()?.attachments)?snapshot.data()!.attachments:[]).find((value:StoredAttachment)=>value?.id===attachmentId);
  const storagePath=typeof item?.storagePath==="string"?item.storagePath:"",prefix=`quote-photos/private/requests/${enquiryId}/`;
  if(!storagePath.startsWith(prefix)||storagePath.includes(".."))throw new Error("ATTACHMENT_NOT_FOUND");
  const file=getAdminStorage().bucket().file(storagePath),[metadata]=await file.getMetadata(),[bytes]=await file.download();
  return{bytes,mimeType:metadata.contentType==="image/webp"?"image/webp":"application/octet-stream"};
}
