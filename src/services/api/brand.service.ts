import { getApi } from "./client";
import { unwrapApiResult } from "./response";
import type { BrandRecord } from "./models";

export async function getBrands() {
  return unwrapApiResult(await getApi<BrandRecord[]>("brands"));
}
