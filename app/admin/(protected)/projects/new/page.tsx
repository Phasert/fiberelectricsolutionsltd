import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProjectForm } from "@/components/admin/project-form";
export default function NewProject(){return <><AdminPageHeader title="Add project" description="Create a secure draft project record in Firestore."/><ProjectForm/></>}
