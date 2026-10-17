import "server-only";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { administratorSchema } from "@/lib/firebase/schemas";
import type { Administrator } from "@/types/firebase";

export async function getAdministrator(uid: string): Promise<Administrator | null> {
  const snapshot = await getAdminFirestore().collection("admins").doc(uid).get();
  if (!snapshot.exists) return null;
  const parsed = administratorSchema.safeParse(snapshot.data());
  return parsed.success ? { uid: snapshot.id, ...parsed.data } : null;
}
