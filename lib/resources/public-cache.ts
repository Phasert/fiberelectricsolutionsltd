import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";

export const PUBLIC_RESOURCES_TAG = "public-resources";

export function invalidatePublicResources() {
  revalidateTag(PUBLIC_RESOURCES_TAG, { expire: 0 });
  revalidatePath("/resources");
  revalidatePath("/resources/[slug]", "page");
  revalidatePath("/sitemap.xml");
}
