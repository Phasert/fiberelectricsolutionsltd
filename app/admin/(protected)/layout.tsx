import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/session";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const administrator = await requireAdmin();
  return <AdminShell administrator={administrator}>{children}</AdminShell>;
}
