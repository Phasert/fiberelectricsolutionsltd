import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";

export const PUBLIC_SITE_CONTENT_TAG = "public-site-content";
export const PUBLIC_SERVICES_TAG = "public-services";

export function invalidatePublicSiteContent() {
  revalidateTag(PUBLIC_SITE_CONTENT_TAG, { expire: 0 });
  for (const path of ["/", "/electrical", "/fiber-optic", "/about"]) revalidatePath(path);
}

export function invalidatePublicServices() {
  revalidateTag(PUBLIC_SERVICES_TAG, { expire: 0 });
  for (const path of ["/", "/electrical", "/fiber-optic", "/about"]) revalidatePath(path);
}
