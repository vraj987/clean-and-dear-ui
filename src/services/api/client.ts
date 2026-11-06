import { apiConfig, getRuntimeCompanyId, type ApiEndpoint } from "./config";

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
export type ApiRequestOptions = { signal?: AbortSignal; maxResponseBytes?: number };
const MAX_API_RESPONSE_BYTES = 4 * 1024 * 1024;

function apiUrl(endpoint: ApiEndpoint) {
  if (import.meta.env.DEV) return `/api/${apiConfig.endpoints[endpoint]}`;
  return `${apiConfig.baseUrl}${apiConfig.endpoints[endpoint]}`;
}

async function fetchApi(endpoint: ApiEndpoint, method: string, request: () => Promise<Response>) {
  const startedAt = performance.now();
  const file = apiConfig.endpoints[endpoint];
  const record = (event: string, status?: number) => {
    if (typeof window === "undefined") return;
    window.__KIMAAT_RECORD_RUNTIME_LOG__?.({
      time: new Date().toISOString(),
      event,
      target: `${method} ${file}`,
      ...(status === undefined ? {} : { status }),
      ...(event === "api-complete" || event === "api-error"
        ? { durationMs: Math.round(performance.now() - startedAt) }
        : {}),
    });
  };

  record("api-start");
  try {
    const response = await request();
    record("api-complete", response.status);
    return response;
  } catch (error) {
    record("api-error");
    throw error;
  }
}

function formBody(values: Record<string, ApiValue>) {
  const body = new URLSearchParams();
  if (getRuntimeCompanyId()) body.set("company_id", getRuntimeCompanyId());
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null) body.set(key, String(value));
  }
  return body;
}

async function readResponse<T>(
  response: Response,
  maxBytes = MAX_API_RESPONSE_BYTES,
): Promise<ApiEnvelope<T>> {
  if (!response.ok) throw new Error(`Request failed (${response.status}). Please try again.`);
  let responseText: string;
  if (maxBytes && response.body) {
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new Error("The server returned too much data. Please narrow the request and try again.");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    responseText = new TextDecoder().decode(bytes);
  } else {
    responseText = await response.text();
    if (maxBytes && new TextEncoder().encode(responseText).byteLength > maxBytes) {
      throw new Error("The server returned too much data. Please narrow the request and try again.");
    }
  }
  const payload = JSON.parse(responseText) as ApiEnvelope<T>;
  if (!payload || typeof payload.status === "undefined" || !Array.isArray(payload.result)) {
    throw new Error("The server returned an unexpected response.");
  }
  return payload;
}

export async function getApi<T>(endpoint: ApiEndpoint, query?: Record<string, ApiValue>) {
  const params = new URLSearchParams();
  if (getRuntimeCompanyId()) params.set("company_id", getRuntimeCompanyId());
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }
  const suffix = params.size ? `?${params.toString()}` : "";
  const response = await fetchApi(endpoint, "GET", () =>
    fetch(`${apiUrl(endpoint)}${suffix}`, {
      headers: { Accept: "application/json" },
    }),
  );
  return readResponse<T>(response);
}

export async function postApi<T>(
  endpoint: ApiEndpoint,
  values: Record<string, ApiValue>,
  options: ApiRequestOptions = {},
) {
  const response = await fetchApi(endpoint, "POST", () =>
    fetch(apiUrl(endpoint), {
      method: "POST",
      signal: options.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: formBody(values),
    }),
  );
  return readResponse<T>(response, options.maxResponseBytes);
}

export async function postMultipartApi<T>(
  endpoint: ApiEndpoint,
  values: Record<string, ApiValue | File | File[] | string[]>,
) {
  const body = new FormData();
  if (getRuntimeCompanyId()) body.set("company_id", getRuntimeCompanyId());
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      value.forEach((item) => body.append(key, item));
    } else if (value !== undefined && value !== null) {
      body.set(key, value instanceof File ? value : String(value));
    }
  }
  const response = await fetchApi(endpoint, "POST multipart", () =>
    fetch(apiUrl(endpoint), {
      method: "POST",
      headers: { Accept: "application/json" },
      body,
    }),
  );
  return readResponse<T>(response);
}
