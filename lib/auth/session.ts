import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdministrator } from "@/lib/admin/firebase-repository";
import { getAdminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE } from "@/lib/auth/session-constants";
import type { Administrator } from "@/types/firebase";

export { SESSION_COOKIE };
export const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

export async function verifyAdminSession(cookieValue?: string): Promise<Administrator | null> {
  const value = cookieValue ?? (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    const claims = await getAdminAuth().verifySessionCookie(value, true);
    const user = await getAdminAuth().getUser(claims.uid);
    if (user.disabled) return null;
    const administrator = await getAdministrator(claims.uid);
    return administrator?.active && administrator.role === "admin" ? administrator : null;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<Administrator> {
  const administrator = await verifyAdminSession();
  if (!administrator) redirect("/admin/login?reason=session");
  return administrator;
}

export function sessionCookieOptions(maxAge = SESSION_DURATION_MS / 1000) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge };
}

export function requestHasTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}
