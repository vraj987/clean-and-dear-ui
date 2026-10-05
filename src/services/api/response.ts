import { ApiStatusError, type ApiEnvelope } from "./client";

export function unwrapApiResult<T>(response: ApiEnvelope<T>) {
  if (String(response.status) !== "1") {
    throw new ApiStatusError(
      response.error || "The request could not be completed.",
      response.status,
    );
  }
  return response.result;
}
