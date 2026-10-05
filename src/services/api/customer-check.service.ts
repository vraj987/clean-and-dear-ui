import { apiConfig } from "./config";
import { postApi } from "./client";
import { unwrapApiResult } from "./response";
import type { ApiAccount, AuthSession } from "./models";

export async function customerCheck(session: AuthSession) {
  const result = unwrapApiResult(
    await postApi<ApiAccount[]>("customerCheck", {
      customer_id: session.accountId,
      customer_auth_token: session.authToken,
      customer_android_token: "",
      customer_ios_token: "",
      customer_app_version: apiConfig.versionCode,
    }),
  );
  return result[0] ?? session.account;
}
