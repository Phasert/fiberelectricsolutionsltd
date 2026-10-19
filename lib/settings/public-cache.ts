import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

export const PUBLIC_BUSINESS_SETTINGS_TAG = "public-business-settings";

export function invalidatePublicBusinessSettings() {
  revalidateTag(PUBLIC_BUSINESS_SETTINGS_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  for (const path of ["/", "/about", "/electrical", "/fiber-optic", "/request-a-quote"]) revalidatePath(path);
}
