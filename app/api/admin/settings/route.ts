import { NextResponse } from "next/server";
import { requestHasTrustedOrigin, verifyAdminSession } from "@/lib/auth/session";
import { saveBusinessSettings } from "@/lib/settings/repository";
import { invalidatePublicBusinessSettings } from "@/lib/settings/public-cache";

export async function PUT(request: Request) {
  if (!requestHasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const admin = await verifyAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { await saveBusinessSettings(await request.json(), admin.uid); invalidatePublicBusinessSettings(); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Business settings validation failed." }, { status: 400 }); }
}
