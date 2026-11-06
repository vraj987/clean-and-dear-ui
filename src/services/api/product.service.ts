import { postApi, type ApiRequestOptions } from "./client";
import type { SubscriptionProduct } from "./models";
import { unwrapApiResult } from "./response";
import { readAuthSession } from "./auth";

export type ProductQuery = {
  brand_id: string;
  model_id: string;
  product_id?: string;
  category_id?: string;
  invoice_date?: string;
  purchase_price?: string;
  duration?: string;
  package_id?: string;
  product_type?: string;
  search?: string;
  limit?: string;
  offset?: string;
};

export async function getSubscriptionProducts(values: ProductQuery) {
  const session = readAuthSession();
  return unwrapApiResult(await postApi<SubscriptionProduct[]>("products", {
    ...values,
    product_type: "1",
    ...(session ? { user_id: session.accountId } : {}),
  }));
}

export async function getProductVariants(brandId: string, modelId: string) {
  return unwrapApiResult(
    await postApi<SubscriptionProduct[]>("productVariants", {
      brand_id: brandId,
      model_id: modelId,
      product_type: "1",
    }),
  );
}

export async function getProducts(
  values: Partial<ProductQuery> = {},
  options: ApiRequestOptions = {},
) {
  const session = readAuthSession();
  return unwrapApiResult(
    await postApi<SubscriptionProduct[]>(
      "products",
      {
        product_id: "",
        category_id: "",
        brand_id: "",
        model_id: "",
        invoice_date: "",
        purchase_price: "",
        duration: "",
        package_id: "",
        product_type: "",
        search: "",
        limit: "",
        offset: "",
        ...values,
        ...(session ? { user_id: session.accountId } : {}),
      },
      options,
    ),
  );
}
