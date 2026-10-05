import { postApi } from "./client";
import { unwrapApiResult } from "./response";
import type { ApiAccount } from "./models";

export async function customerLogin(mobile: string) {
  return unwrapApiResult(await postApi<ApiAccount[]>("customerLogin", { customer_mobile: mobile }));
}
