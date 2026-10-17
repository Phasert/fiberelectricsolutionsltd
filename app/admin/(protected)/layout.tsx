import { AdminShell } from "@/components/admin/admin-shell";
import { EnquiryStateProvider } from "@/components/admin/enquiry-state";
import { requireAdmin } from "@/lib/auth/session";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const administrator = await requireAdmin();
  return <AdminShell administrator={administrator}><EnquiryStateProvider>{children}</EnquiryStateProvider></AdminShell>;
}
