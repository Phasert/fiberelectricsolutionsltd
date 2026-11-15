import { AdminPageHeader } from "@/components/admin/admin-ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminBusinessSettings } from "@/lib/settings/repository";
export default async function SettingsPage(){await requireAdmin();const initialState=await getAdminBusinessSettings();return <><AdminPageHeader title="Settings" description="Manage approved public business and contact details."/><SettingsForm initialState={initialState}/></>}
