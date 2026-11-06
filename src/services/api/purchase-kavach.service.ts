import { postMultipartApi } from "./client";
import { unwrapApiResult } from "./response";

export type PurchaseKavachValues = {
  kavach_customer_id: string;
  created_by_user_id?: string;
  product_id: string;
  invoice_date: string;
  duration: string;
  purchase_price: string;
  package_id: string;
  package_name: string;
  package_percentage: string;
  buyback_amount: string;
  package_price: string;
  filter_user: string;
  invoice_number: string;
  imei_number: string;
  serial_number: string;
  invoice_file?: File;
};

export type KavachPurchaseRecord = {
  kavach_order_id: string;
  created_by_user_id?: string;
  product_id: string;
  package_id: string;
  package_name: string;
  package_price: string;
  payable_amount?: string;
  total_amount?: string;
  product_details_json?: {
    product_id: string;
    brand_id: string;
    brand_name: string;
    model_id: string;
    model_name: string;
    category_id: string;
    product_variant: string;
    invoice_date: string;
    duration: string;
    purchase_price: string;
    package_id: string;
    package_name: string;
    package_percentage: string;
    buyback_amount: string;
    package_price: string;
    imei_number: string;
    serial_number: string;
    invoice_number: string;
    invoice_file: string;
    remarks: string;
  };
  order_status: string;
  /** Created by the backend with its Razorpay secret; required to open Checkout securely. */
  razorpay_order_id?: string;
  razorpayOrderId?: string;
  kavach_razorpayOrderId?: string;
  razorpay_amount?: string | number;
  razorpay_currency?: string;
  amount?: string;
  currency?: string;
};

export async function purchaseKavach(values: PurchaseKavachValues) {
  return unwrapApiResult(await postMultipartApi<KavachPurchaseRecord[]>("purchaseKavach", values));
}
