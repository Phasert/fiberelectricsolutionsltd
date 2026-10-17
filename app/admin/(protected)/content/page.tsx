import { AdminPageHeader, MockNotice } from "@/components/admin/admin-ui";
import { ContentEditor } from "@/components/admin/content-editor";
export default function ContentPage(){return <><AdminPageHeader title="Site Content" description="Manage selected public copy that benefits from routine client editing."/><MockNotice/><ContentEditor/></>}
