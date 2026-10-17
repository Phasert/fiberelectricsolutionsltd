import { NextResponse } from "next/server";
import { getAdministrator } from "@/lib/admin/firebase-repository";
import { getAdminAuth } from "@/lib/firebase/admin";
import { sessionRequestSchema } from "@/lib/firebase/schemas";
import { requestHasTrustedOrigin, SESSION_COOKIE, SESSION_DURATION_MS, sessionCookieOptions } from "@/lib/auth/session";

export async function POST(request: Request) {
  if (!requestHasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const parsed = sessionRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid sign-in request." }, { status: 400 });
  try {
    const auth = getAdminAuth();
    const token = await auth.verifyIdToken(parsed.data.idToken, true);
    if (Date.now() / 1000 - token.auth_time > 5 * 60) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    const user = await auth.getUser(token.uid);
    const administrator = await getAdministrator(token.uid);
    if (user.disabled || !administrator?.active || administrator.role !== "admin") return NextResponse.json({ error: "This account is not approved for administration." }, { status: 403 });
    const sessionCookie = await auth.createSessionCookie(parsed.data.idToken, { expiresIn: SESSION_DURATION_MS });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, sessionCookie, sessionCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ error: "Email or password was not accepted." }, { status: 401 });
  }
}
