import { postApi } from "./client";
import { unwrapApiResult } from "./response";
import type { StateRecord } from "./models";

export async function getStates() {
  return unwrapApiResult(await postApi<StateRecord[]>("states", {}));
}
