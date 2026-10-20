import { AdminPageHeader } from "@/components/admin/admin-ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminBusinessSettings } from "@/lib/settings/repository";
import { adminRepository } from "@/lib/admin/repository";
export default async function SettingsPage(){await requireAdmin();const [initialState,media]=await Promise.all([getAdminBusinessSettings(),adminRepository.getMedia()]);return <><AdminPageHeader title="Settings" description="Manage approved public business details without exposing developer infrastructure."/><SettingsForm initialState={initialState} media={media}/></>}
