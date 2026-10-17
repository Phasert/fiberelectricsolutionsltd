import "server-only";

import { verifyAdminSession } from "@/lib/auth/session";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { adminDashboardContentSchema } from "@/lib/firebase/schemas";
import type { AdminDashboardContent } from "@/types/firebase";

export async function getAuthorizedAdminDashboardContent(sessionCookie?: string): Promise<AdminDashboardContent[]> {
  const administrator = await verifyAdminSession(sessionCookie);
  if (!administrator) throw new Error("Administrator authorization required.");
  const snapshot = await getAdminFirestore().collection("adminDashboardContent").limit(10).get();
  return snapshot.docs.flatMap((document) => {
    const parsed = adminDashboardContentSchema.safeParse(document.data());
    return parsed.success ? [{ id: document.id, ...parsed.data }] : [];
  });
}
