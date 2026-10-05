import { postApi } from "./client";
import { unwrapApiResult } from "./response";
import type { ApiAccount } from "./models";

export async function customerVerify(mobile: string, otp: string) {
  const response = await postApi<ApiAccount[]>("customerVerify", {
    customer_mobile: mobile,
    customer_otp: otp,
  });
  return { accounts: unwrapApiResult(response), message: response.error ?? "" };
}
