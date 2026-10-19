import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";

export const PUBLIC_PROJECTS_TAG = "public-projects";

export function invalidatePublicProjects() {
  revalidateTag(PUBLIC_PROJECTS_TAG, { expire: 0 });
  revalidatePath("/projects");
  revalidatePath("/projects/[slug]", "page");
  revalidatePath("/sitemap.xml");
}
