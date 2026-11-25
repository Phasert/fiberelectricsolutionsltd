import "server-only";
import { FieldValue, type Transaction } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { z } from "zod";
import { mediaRoleSchema } from "@/lib/media/schemas";

export type MediaRole = z.infer<typeof mediaRoleSchema>;

export async function prepareMediaReferenceSync(transaction:Transaction, input:{consumer:string;previousIds:string[];nextIds:string[];role:MediaRole;uid:string;projectCoverId?:string|null}) {
  const db=getAdminFirestore(),previous=new Set(input.previousIds.filter(Boolean)),next=new Set(input.nextIds.filter(Boolean)),ids=[...new Set([...previous,...next])];
  const mediaSnapshots=new Map<string,FirebaseFirestore.DocumentSnapshot>(),referenceSnapshots=new Map<string,FirebaseFirestore.DocumentSnapshot>();
  for(const id of ids){mediaSnapshots.set(id,await transaction.get(db.collection("media").doc(id)));referenceSnapshots.set(id,await transaction.get(db.collection("mediaReferences").doc(id)))}
  for (const id of next) {
    const data = mediaSnapshots.get(id)?.data();
    const allowsVideo = input.role === "project-gallery" &&
      input.projectCoverId !== undefined && id !== input.projectCoverId;
    if (data?.status !== "Ready" ||
      (data.kind !== "editorial-image" && !(allowsVideo && data.kind === "editorial-video"))) {
      throw new Error("MEDIA_NOT_READY");
    }
    const roles = Array.isArray(data.roles) ? data.roles : ["general"];
    if (!roles.includes("general") && !roles.includes(input.role)) {
      throw new Error("MEDIA_ROLE_INVALID");
    }
  }
  return ()=>{for(const id of ids){const ref=db.collection("mediaReferences").doc(id),existing=referenceSnapshots.get(id)?.data(),values=new Set<string>(Array.isArray(existing?.references)?existing!.references:[]);if(next.has(id))values.add(input.consumer);else values.delete(input.consumer);transaction.set(ref,{schemaVersion:1,mediaId:id,references:[...values].sort(),updatedAt:FieldValue.serverTimestamp(),updatedBy:input.uid},{merge:true})}}
}
export async function syncMediaReferences(transaction:Transaction,input:Parameters<typeof prepareMediaReferenceSync>[1]){const apply=await prepareMediaReferenceSync(transaction,input);apply()}

export const projectMediaIds=(value:{gallery?:Array<{mediaId?:string}>;coverMediaId?:string|null})=>[...new Set([...(value.gallery??[]).map(item=>item.mediaId??""),value.coverMediaId??""].filter(Boolean))];
export const resourceMediaIds=(value:{coverMediaId?:string|null})=>value.coverMediaId?[value.coverMediaId]:[];
export const collectMediaIds=(value:unknown):string[]=>{const found=new Set<string>();const visit=(item:unknown,key="")=>{if(typeof item==="string"&&/(?:mediaId|imageId)$/i.test(key)&&item)found.add(item);else if(Array.isArray(item))item.forEach(entry=>visit(entry,key));else if(item&&typeof item==="object")Object.entries(item as Record<string,unknown>).forEach(([childKey,entry])=>visit(entry,childKey))};visit(value);return[...found]};
