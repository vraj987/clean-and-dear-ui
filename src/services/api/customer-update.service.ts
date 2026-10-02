import { postApi } from "./client";
import { unwrapApiResult } from "./response";
import type { ApiAccount } from "./models";

export type CustomerUpdateValues = {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  customer_pincode: string;
  state_id: string;
  city_id: string;
};

export async function customerUpdate(values: CustomerUpdateValues) {
  const response = await postApi<ApiAccount[]>("customerUpdate", values);
  return { accounts: unwrapApiResult(response), message: response.error ?? "" };
}
