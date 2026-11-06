import { postMultipartApi } from "./client";
import { unwrapApiResult } from "./response";

export type VendorProductRecord = {
  product_id: string;
  category_id?: string;
  category_name?: string;
  brand_id?: string;
  brand_name?: string;
  model_id?: string;
  model_name?: string;
  product_variant?: string;
  short_description?: string;
  long_description?: string;
  vendor_offer?: string;
  product_image?: string;
  product_image_url?: string;
  product_images?: string;
  cgst?: string;
  sgst?: string;
  is_exclusive_tax?: string;
  base_price?: string;
  mrp?: string;
  retailer_price?: string;
  hsn_code?: string;
  product_sku?: string;
  priority?: string;
  status?: string;
  customer_id?: string;
  product_type?: string;
};

export type VendorProductAction = "1" | "2" | "3" | "4";
export type VendorProductValues = Record<
  string,
  string | number | File | File[] | string[] | undefined
>;

export async function manageVendorProducts(values: VendorProductValues) {
  return unwrapApiResult(
    await postMultipartApi<VendorProductRecord[]>("vendorProducts", values),
  );
}
