import { postApi } from "./client";
import { unwrapApiResult } from "./response";

export type CartPurchaseRecord = {
  kavach_order_id: string;
  kavach_order_detail_ids: string[];
  order_type: string;
  payment_method: "online" | "cod";
  product_total: string;
  package_total: string;
  payable_amount: string;
  razorpay_order_id?: string;
  razorpay_key_id?: string;
  razorpay_amount?: string | number;
  razorpay_currency?: string;
};

export type CartShippingDetails = {
  shipping_name: string;
  shipping_mobile: string;
  shipping_email: string;
  shipping_address: string;
  shipping_state_id: string;
  shipping_city_id: string;
  shipping_pincode: string;
  delivery_instructions: string;
};

export async function purchaseCart(
  user_id: string,
  shipping: CartShippingDetails,
  payment_method: "online" | "cod" = "online",
) {
  const result = unwrapApiResult(
    await postApi<CartPurchaseRecord[]>("purchaseCart", { user_id, payment_method, ...shipping }),
  );
  const order = result[0];
  if (!order?.kavach_order_id) {
    throw new Error("The server did not return the order details.");
  }
  if (payment_method === "online" && (!order.razorpay_order_id || !order.razorpay_amount)) {
    throw new Error("The server did not return the online payment details.");
  }
  return order;
}

export type CartPaymentVerification = {
  kavach_order_id: string;
  payment_status: string;
  order_status: string;
};

export async function verifyCartPayment(values: {
  kavach_customer_id: string;
  kavach_razorpayOrderId: string;
  current_kavach_order_id: string;
  razorpay_signature: string;
  razorpay_payment_id: string;
  kavach_razorpay_status: "2" | "3";
}) {
  return unwrapApiResult(
    await postApi<CartPaymentVerification[]>("verifyCartPayment", values),
  );
}
