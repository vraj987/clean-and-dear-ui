import { postApi } from "./client";
import { unwrapApiResult } from "./response";
import type { ApiAccount } from "./models";

export async function customerRegister(values: {
  customer_mobile: string;
  customer_email: string;
  customer_name: string;
  state_id: string;
  city_id: string;
}) {
  const response = await postApi<ApiAccount[]>("customerRegister", values);
  return { accounts: unwrapApiResult(response), message: response.error ?? "" };
}
