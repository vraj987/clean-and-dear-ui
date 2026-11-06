import { postApi } from "./client";
import { unwrapApiResult } from "./response";
import type { CategoryRecord } from "./models";

export async function getCategories() {
  return unwrapApiResult(await postApi<CategoryRecord[]>("categories", {}));
}
