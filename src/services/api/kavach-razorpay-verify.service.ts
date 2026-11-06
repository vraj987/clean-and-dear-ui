import { postApi } from "./client";
import { unwrapApiResult } from "./response";

export type KavachRazorpayVerificationValues = {
  kavach_customer_id: string;
  kavach_razorpayOrderId: string;
  current_kavach_order_id: string;
  razorpay_signature: string;
  razorpay_payment_id: string;
  kavach_razorpay_status: "2" | "3";
};

export type KavachRazorpayVerificationRecord = Record<string, string | null | undefined>;

export async function verifyKavachRazorpayPayment(values: KavachRazorpayVerificationValues) {
  return unwrapApiResult(
    await postApi<KavachRazorpayVerificationRecord[]>("verifyKavachPayment", values),
  );
}
