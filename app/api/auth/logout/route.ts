import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { requestHasTrustedOrigin, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";

export async function POST(request: Request) {
  if (!requestHasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const current = request.headers.get("cookie")?.match(/(?:^|; )__session=([^;]*)/)?.[1];
  if (current) {
    try {
      const claims = await getAdminAuth().verifySessionCookie(decodeURIComponent(current));
      await getAdminAuth().revokeRefreshTokens(claims.uid);
    } catch { /* An invalid session is still cleared locally. */ }
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  return response;
}
