const CACHE_PREFIX = "kimaat-lock:subscription-data:v1:";

export type SubscriptionCacheEntry<T> = {
  data: T;
  updatedAt: number;
};

export function readSubscriptionCache<T>(key: string): SubscriptionCacheEntry<T> | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return undefined;
    const entry = JSON.parse(raw) as Partial<SubscriptionCacheEntry<T>>;
    if (typeof entry.updatedAt !== "number" || !("data" in entry)) return undefined;
    return entry as SubscriptionCacheEntry<T>;
  } catch {
    return undefined;
  }
}

export function writeSubscriptionCache<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    const entry: SubscriptionCacheEntry<T> = { data, updatedAt: Date.now() };
    window.localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Caching is optional; quota and privacy settings must not interrupt checkout.
  }
}
