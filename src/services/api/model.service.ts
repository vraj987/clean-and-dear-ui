import { postApi } from "./client";
import type { ModelRecord } from "./models";
import { unwrapApiResult } from "./response";

export async function getModels(brandId: string) {
  return unwrapApiResult(await postApi<ModelRecord[]>("models", { brand_id: brandId }));
}
