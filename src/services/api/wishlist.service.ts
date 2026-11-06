import { ApiStatusError, postApi } from "./client";
import type { SubscriptionProduct } from "./models";
import { unwrapApiResult } from "./response";

export type WishlistAction = {
  action: "added" | "removed";
  wishlist_id: string;
  product_id: string;
};

export async function toggleWishlist(productId: string, customerId: string) {
  return unwrapApiResult(
    await postApi<WishlistAction[]>("wishlist", {
      product_id: productId,
      customer_id: customerId,
    }),
  );
}

export async function getMyWishlist(customerId: string) {
  const response = await postApi<SubscriptionProduct[]>("myWishlist", { user_id: customerId });
  if (String(response.status) === "0" && response.result.length === 0) return [];
  if (String(response.status) !== "1") {
    throw new ApiStatusError(response.error || "Wishlist could not be loaded.", response.status);
  }
  return unwrapApiResult(response);
}
