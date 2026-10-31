import "server-only";
import { createHash } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";

type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();
const WINDOW_MS = 15 * 60 * 1000, LIMIT = 5;

function enforceMemoryRateLimit(key:string,now:number){
  const current=buckets.get(key);if(!current||current.resetAt<=now){buckets.set(key,{count:1,resetAt:now+WINDOW_MS});return}
  if(current.count>=LIMIT)throw new Error("CONTACT_RATE_LIMITED");current.count+=1;
  if(buckets.size>1_000)for(const[bucket,value]of buckets)if(value.resetAt<=now)buckets.delete(bucket);
}

export async function enforceContactRateLimit(identifier: string, now = Date.now()) {
  const key = createHash("sha256").update(identifier).digest("hex");
  if(process.env.NODE_ENV!=="production"){enforceMemoryRateLimit(key,now);return}
  const reference=getAdminFirestore().collection("contactRateLimits").doc(key);
  await getAdminFirestore().runTransaction(async transaction=>{const snapshot=await transaction.get(reference),resetAt=snapshot.get("resetAt") instanceof Timestamp?snapshot.get("resetAt").toMillis():0,count=resetAt>now?Number(snapshot.get("count")||0):0;if(count>=LIMIT)throw new Error("CONTACT_RATE_LIMITED");transaction.set(reference,{count:count+1,resetAt:Timestamp.fromMillis(resetAt>now?resetAt:now+WINDOW_MS),expiresAt:Timestamp.fromMillis(now+WINDOW_MS)})});
}

export function resetContactRateLimitsForTesting() { buckets.clear(); }
