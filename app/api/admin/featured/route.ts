import { NextResponse } from "next/server";
import { requestHasTrustedOrigin, verifyAdminSession } from "@/lib/auth/session";
import { getFeaturedSelection, saveFeaturedSelection } from "@/lib/featured/repository";
import { invalidatePublicHomepageFeatured } from "@/lib/featured/public-cache";

export async function GET() {
  if (!await verifyAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ selection: await getFeaturedSelection() });
}

export async function PUT(request: Request) {
  if (!requestHasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const admin = await verifyAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await saveFeaturedSelection(await request.json(), admin.uid);
    invalidatePublicHomepageFeatured();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "INELIGIBLE_PROJECT") return NextResponse.json({ error: "The featured project must still be published." }, { status: 409 });
    if (code === "INELIGIBLE_MEDIA") return NextResponse.json({ error: "The featured photograph must still be published in Projects." }, { status: 409 });
    if (code === "INELIGIBLE_RESOURCE") return NextResponse.json({ error: "The featured resource must still be published." }, { status: 409 });
    if (code === "INELIGIBLE_TIP") return NextResponse.json({ error: "Every featured tip must still be enabled." }, { status: 409 });
    return NextResponse.json({ error: "Featured-content validation failed." }, { status: 400 });
  }
}
