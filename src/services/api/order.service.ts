import { postApi } from "./client";
import { unwrapApiResult } from "./response";

export type OrderDepreciation = {
  month_number: string | number;
  monthly_depreciation?: string | number;
  post_new_model_depreciation?: string | number;
  total_depreciation_pct?: string | number;
  depreciation_amount?: string | number;
  buyback_amount?: string | number;
  package_price?: string | number;
};

export type OrderApiRecord = {
  image?: string;
  product_image?: string;
  product_image_url?: string;
  pro_name?: string;
  model_image_url?: string;
  kavach_order_id?: string;
  kavach_order_detail_id?: string;
  shipping_name?: string;
  shipping_mobile?: string;
  shipping_email?: string;
  shipping_state_id?: string | number;
  shipping_state?: string;
  shipping_city_id?: string | number;
  shipping_city?: string;
  shipping_pincode?: string;
  delivery_instructions?: string;
  payment_method?: string;
  order_id?: string;
  order_detail_id?: string;
  customer_name?: string;
  customer_mobile?: string;
  created_by_user_id?: string;
  created_by_user_name?: string;
  product_id?: string;
  qty?: string | number;
  product_total?: string | number;
  package_total?: string | number;
  line_total?: string | number;
  brand_name?: string;
  model_name?: string;
  category_name?: string;
  product_variant?: string;
  product_name?: string;
  original_price?: string | number;
  package_id?: string;
  package_name?: string;
  package_percentage?: string | number;
  package_price?: string | number;
  purchase_price?: string | number;
  buyback_amount?: string | number;
  duration?: string | number;
  invoice_date?: string;
  purchase_date?: string;
  start_date?: string;
  expiry_date?: string;
  order_status?: string | number;
  order_status_text?: string;
  delivery_date?: string | null;
  order_type?: string;
  kavach_order_status?: string | number;
  payment_status?: string;
  total_base_price?: string | number;
  total_discount_price?: string | number;
  payable_amount?: string | number;
  kavach_payable?: string | number;
  kavach_discount?: string | number;
  kavach_delivery_charges?: string | number;
  kavach_razorpay_status?: string | number;
  kavach_razorpay_payment_id?: string;
  products?: unknown;
  product_array?: unknown;
  product_arr?: unknown;
  order_products?: unknown;
  billing_details?: unknown;
  billing?: unknown;
  shipping_address?: unknown;
  payment_details?: unknown;
  order_status_history?: unknown;
  status_history?: unknown;
  order_history?: unknown;
  depreciation_json?: OrderDepreciation[] | string | null;
  product_details_json?: Record<string, unknown> | string | null;
  [key: string]: unknown;
};

export type OrderDateRange = { from_date: string; to_date: string };

export async function getOrders(values: OrderDateRange & { filter_user?: string; created_by_user_id?: string; kavach_order_id?: string }) {
  const response = await postApi<OrderApiRecord[]>("orderList", {
    ...values,
    filter_user: values.filter_user ?? "",
    created_by_user_id: values.created_by_user_id ?? "",
    kavach_order_id: values.kavach_order_id ?? "",
    list_type: "",
    limit: "",
    offset: "",
    order_type: "",
  });
  return unwrapApiResult(response);
}

export async function getOrderDetails(values: OrderDateRange & {
  filter_user: string;
  kavach_order_id: string;
}) {
  const response = await postApi<OrderApiRecord[]>("orderDetailList", {
    ...values,
    kavach_order_detail_id: "",
    list_type: "",
    limit: "",
    offset: "",
  });
  return unwrapApiResult(response);
}

export function readOrderDepreciation(value: OrderApiRecord["depreciation_json"]): OrderDepreciation[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed as OrderDepreciation[];
    if (parsed && typeof parsed === "object" && "month_number" in parsed) return [parsed as OrderDepreciation];
    return [];
  } catch {
    return [];
  }
}
