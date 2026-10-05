import { getApi } from "./client";
import type { PackageRecord } from "./models";
import { unwrapApiResult } from "./response";

export async function getPackages() {
  return unwrapApiResult(await getApi<PackageRecord[]>("packages"));
}
