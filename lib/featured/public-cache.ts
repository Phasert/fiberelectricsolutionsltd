import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

export const PUBLIC_HOMEPAGE_FEATURED_TAG = "public-homepage-featured";

export function invalidatePublicHomepageFeatured() {
  revalidateTag(PUBLIC_HOMEPAGE_FEATURED_TAG, { expire: 0 });
  revalidatePath("/");
}
