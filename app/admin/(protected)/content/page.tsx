import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ContentEditor } from "@/components/admin/content-editor";
import { listAdminServices, listAdminSiteContent } from "@/lib/site-content/repository";
export default async function ContentPage(){const [initialPages,initialServices]=await Promise.all([listAdminSiteContent(),listAdminServices()]);return <><AdminPageHeader title="Site Content" description="Manage versioned page copy and services with separate draft and published content."/><ContentEditor initialPages={initialPages} initialServices={initialServices}/></>}
