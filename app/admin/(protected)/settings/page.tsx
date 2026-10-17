import { AdminPageHeader, MockNotice } from "@/components/admin/admin-ui";
import { SettingsForm } from "@/components/admin/settings-form";
export default function SettingsPage(){return <><AdminPageHeader title="Settings" description="Prepare public business details and links without exposing developer infrastructure."/><MockNotice/><SettingsForm/></>}
