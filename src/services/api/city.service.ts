import { postApi } from "./client";
import { unwrapApiResult } from "./response";
import type { CityRecord } from "./models";

export async function getCities(stateId: string) {
  return unwrapApiResult(await postApi<CityRecord[]>("cities", { state_id: stateId }));
}
