import { postApi } from "./client";
import type { OfferProductListRecord } from "./models";
import { unwrapApiResult } from "./response";

export async function getOfferProducts(values: {
  offer_id?: string;
  product_id?: string;
  user_id?: string;
} = {}) {
  return unwrapApiResult(
    await postApi<OfferProductListRecord[]>("offers", {
      offer_id: "",
      product_id: "",
      user_id: "",
      ...values,
    }),
  );
}
