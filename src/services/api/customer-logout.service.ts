import { postApi } from "./client";
import { unwrapApiResult } from "./response";
import type { AuthSession } from "./models";

export async function customerLogout(session: AuthSession) {
  const response = await postApi<[]>("customerLogout", { customer_id: session.accountId });
  return unwrapApiResult(response);
}
