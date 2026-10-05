import { apiConfig, type ApiEndpoint } from "./config";

export type ApiEnvelope<T> = {
  status: string | number;
  error?: string;
  result: T;
};

export class ApiStatusError extends Error {
  constructor(
    message: string,
    readonly status: string | number,
  ) {
    super(message);
    this.name = "ApiStatusError";
  }
}

type ApiValue = string | number | boolean | null | undefined;

function apiUrl(endpoint: ApiEndpoint) {
  if (import.meta.env.DEV) return `/api/${apiConfig.endpoints[endpoint]}`;
  return `${apiConfig.baseUrl}${apiConfig.endpoints[endpoint]}`;
}

function formBody(values: Record<string, ApiValue>) {
  const body = new URLSearchParams();
  if (apiConfig.companyId) body.set("company_id", apiConfig.companyId);
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null) body.set(key, String(value));
  }
  return body;
}

async function readResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  if (!response.ok) throw new Error(`Request failed (${response.status}). Please try again.`);
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!payload || typeof payload.status === "undefined" || !Array.isArray(payload.result)) {
    throw new Error("The server returned an unexpected response.");
  }
  return payload;
}

export async function getApi<T>(endpoint: ApiEndpoint, query?: Record<string, ApiValue>) {
  const params = new URLSearchParams();
  if (apiConfig.companyId) params.set("company_id", apiConfig.companyId);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }
  const suffix = params.size ? `?${params.toString()}` : "";
  const response = await fetch(`${apiUrl(endpoint)}${suffix}`, {
    headers: { Accept: "application/json" },
  });
  return readResponse<T>(response);
}

export async function postApi<T>(endpoint: ApiEndpoint, values: Record<string, ApiValue>) {
  const response = await fetch(apiUrl(endpoint), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: formBody(values),
  });
  return readResponse<T>(response);
}
