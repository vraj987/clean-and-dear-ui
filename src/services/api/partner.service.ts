import { postApi } from "./client";
import type { PartnerRecord } from "./models";
import { unwrapApiResult } from "./response";

export async function getPartners() {
  return unwrapApiResult(await postApi<PartnerRecord[]>("partners", {}));
}
