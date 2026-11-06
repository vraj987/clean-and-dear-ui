export type RuntimeLog = {
  time: string;
  event: string;
  durationMs?: number;
  target?: string;
  status?: number;
};

declare global {
  interface Window {
    __KIMAAT_RUNTIME_LOGS__?: () => RuntimeLog[];
    __KIMAAT_RECORD_RUNTIME_LOG__?: (entry: RuntimeLog) => void;
  }
}

const MAX_LOGS = 120;

/** Lightweight diagnostics. Never records input values or personal data. */
export function installRuntimeDiagnostics() {
  if (typeof window === "undefined" || window.__KIMAAT_RUNTIME_LOGS__) return;

  const logs: RuntimeLog[] = [];
  const record = (entry: RuntimeLog) => {
    logs.push(entry);
    if (logs.length > MAX_LOGS) logs.shift();
  };

  window.__KIMAAT_RUNTIME_LOGS__ = () => logs.slice();
  window.__KIMAAT_RECORD_RUNTIME_LOG__ = (entry) => record(entry);
  const onInput = (event: Event) => {
    const startedAt = performance.now();
    const target = event.target;
    const element = target instanceof HTMLElement ? target : null;
    const targetName = element
      ? `${element.tagName.toLowerCase()}${element.getAttribute("aria-label") ? `[${element.getAttribute("aria-label")}]` : ""}`
      : "unknown";

    record({ time: new Date().toISOString(), event: "input", target: targetName });
    window.requestAnimationFrame(() => {
      const durationMs = Math.round(performance.now() - startedAt);
      if (durationMs >= 100) {
        record({ time: new Date().toISOString(), event: "input-delay", durationMs, target: targetName });
      }
    });
  };

  document.addEventListener("input", onInput, true);

  return () => {
    document.removeEventListener("input", onInput, true);
    delete window.__KIMAAT_RUNTIME_LOGS__;
    delete window.__KIMAAT_RECORD_RUNTIME_LOG__;
  };
}
