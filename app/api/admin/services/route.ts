import { NextResponse } from "next/server";
import { requestHasTrustedOrigin, verifyAdminSession } from "@/lib/auth/session";
import { saveServices } from "@/lib/site-content/repository";
import { invalidatePublicServices } from "@/lib/site-content/public-cache";

export async function PUT(request: Request) {
  if (!requestHasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const admin = await verifyAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { await saveServices(await request.json(), admin.uid); invalidatePublicServices(); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Service validation failed." }, { status: 400 }); }
}
