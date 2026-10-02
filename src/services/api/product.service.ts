import { postApi } from "./client";
import type { SubscriptionProduct } from "./models";
import { unwrapApiResult } from "./response";

export type ProductQuery = {
  brand_id: string;
  model_id: string;
  product_id?: string;
  category_id?: string;
  invoice_date?: string;
  purchase_price?: string;
  duration?: string;
  package_id?: string;
};

export async function getSubscriptionProducts(values: ProductQuery) {
  return unwrapApiResult(await postApi<SubscriptionProduct[]>("products", values));
}
