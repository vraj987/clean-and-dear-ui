import { postApi } from "./client";
import { unwrapApiResult } from "./response";
import type { BrandRecord } from "./models";

export async function getBrands() {
  return unwrapApiResult(await postApi<BrandRecord[]>("brands", {}));
}
