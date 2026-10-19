import { NextResponse } from "next/server";
import { requestHasTrustedOrigin, verifyAdminSession } from "@/lib/auth/session";
import { saveSiteContent } from "@/lib/site-content/repository";
import { invalidatePublicSiteContent } from "@/lib/site-content/public-cache";

type Context = { params: Promise<{ section: string }> };
export async function PUT(request: Request, context: Context) {
  if (!requestHasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const admin = await verifyAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { await saveSiteContent((await context.params).section, await request.json(), admin.uid); invalidatePublicSiteContent(); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Content validation failed." }, { status: 400 }); }
}
