const DIAGNOSTICS_KEY = "kimaat-lock:subscription-diagnostics";
const DIAGNOSTICS_PREFIX = "[Kimaat subscription]";
const MAX_ENTRIES = 100;

type DiagnosticDetails = Record<string, string | number | boolean | null | undefined>;

function isSubscriptionPage() {
  return typeof window !== "undefined" && /\/subscription\/?$/.test(window.location.pathname);
}

export function logSubscriptionDiagnostic(event: string, details: DiagnosticDetails = {}) {
  if (!isSubscriptionPage()) return;

  const entry = {
    time: new Date().toISOString(),
    elapsedMs: Math.round(performance.now()),
    event,
    ...details,
  };

  try {
    const previous = JSON.parse(sessionStorage.getItem(DIAGNOSTICS_KEY) ?? "[]") as unknown[];
    const entries = [...previous.slice(-(MAX_ENTRIES - 1)), entry];
    sessionStorage.setItem(DIAGNOSTICS_KEY, JSON.stringify(entries));
  } catch {
    // Diagnostics must never interfere with the page when storage is unavailable.
  }

  console.info(DIAGNOSTICS_PREFIX, entry);
}

export function readSubscriptionDiagnostics() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(DIAGNOSTICS_KEY) ?? "[]") as Array<{
      time: string;
      elapsedMs: number;
      event: string;
      [key: string]: unknown;
    }>;
  } catch {
    return [];
  }
}

export function installSubscriptionDiagnostics() {
  if (!isSubscriptionPage()) return () => {};

  (window as Window & { __KIMAAT_SUBSCRIPTION_LOGS__?: typeof readSubscriptionDiagnostics })
    .__KIMAAT_SUBSCRIPTION_LOGS__ = readSubscriptionDiagnostics;

  logSubscriptionDiagnostic("page-mounted", {
    path: window.location.pathname,
    navigationType:
      (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)
        ?.type ?? "unknown",
  });

  const onError = (event: ErrorEvent) => {
    logSubscriptionDiagnostic("window-error", {
      message: event.message || "Unknown browser error",
    });
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    logSubscriptionDiagnostic("unhandled-rejection", {
      message: reason instanceof Error ? reason.message : String(reason ?? "Unknown rejection"),
    });
  };
  const onPageHide = () => logSubscriptionDiagnostic("page-hide");
  const onPageShow = (event: PageTransitionEvent) =>
    logSubscriptionDiagnostic("page-show", { restoredFromCache: event.persisted });

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("pageshow", onPageShow);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    window.removeEventListener("pagehide", onPageHide);
    window.removeEventListener("pageshow", onPageShow);
  };
}
