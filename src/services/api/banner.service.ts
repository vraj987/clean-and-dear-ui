import { getApi } from "./client";
import { unwrapApiResult } from "./response";
import type { BannerRecord } from "./models";

export async function getBanners() {
  return unwrapApiResult(await getApi<BannerRecord[]>("banners"));
}
