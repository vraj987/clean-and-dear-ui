import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, ShieldCheck } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import type { RuntimeLog } from "../lib/runtime-diagnostics";
import { versionedAssetUrl } from "@/lib/versioned-asset-url";
import { getCompanyDetails, resolveCompanyLogoUrl } from "@/services/api/company.service";
import { apiQueryKeys } from "@/services/api/query-keys";
import { setPageSocialMetadata } from "@/lib/seo";

function isDebugEnabled() {
  return (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug") === "1"
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "Kimaat Lock" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "icon",
        href: versionedAssetUrl(import.meta.env["VITE_FAV_ICON_URL"] || "/favicon.svg"),
        type: import.meta.env["VITE_FAV_ICON_URL"] ? "image/png" : "image/svg+xml",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // The Hostinger production build is a client-only SPA mounted inside the
  // existing #root element in index.html. Rendering another <html>/<body>
  // inside that element creates invalid nested document markup and can make
  // React's delegated input/selection events loop when a field is focused.
  // TanStack Start's dev server still needs the document shell for SSR.
  if (import.meta.env.PROD) {
    return <>{children}</>;
  }

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch((error: unknown) => console.warn("Kimaat Lock offline support could not start.", error));
  }, []);

  // Diagnostics global input/fetch listeners lagate hain, isliye sirf ?debug=1 pe
  // lazy-load karte hain. Normal users ke liye ye code chalta hi nahi.
  useEffect(() => {
    if (!isDebugEnabled()) return;

    let cancelled = false;
    let cleanup: (() => void) | void;

    import("../lib/runtime-diagnostics").then((mod) => {
      if (cancelled) return;
      cleanup = mod.installRuntimeDiagnostics();
    });

    return () => {
      cancelled = true;
      if (typeof cleanup === "function") cleanup();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CompanyBrandingSync />
      <SocialMetadataSync />
      <OfflineStatusDialog />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <RuntimeDebugPanel />
    </QueryClientProvider>
  );
}

function SocialMetadataSync() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const companyQuery = useQuery({
    queryKey: apiQueryKeys.companyDetails,
    queryFn: getCompanyDetails,
  });
  const company = companyQuery.data?.result?.[0];
  const siteName = company?.company_name?.trim() || import.meta.env["VITE_PROJECT_NAME"] || "Kimaat Lock";
  const logo =
    resolveCompanyLogoUrl(company?.company_header_logo) ||
    import.meta.env["VITE_LOGO_URL"] ||
    import.meta.env["VITE_FAV_ICON_URL"] ||
    "/favicon.svg";

  useEffect(() => {
    if (pathname.startsWith("/products/")) return;
    const title = document.title || `${siteName} — Aaj phone lo, kal ki kimmat fix karo`;
    const description =
      document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ||
      "Aaj phone lo, kal ki kimmat fix karo. Check your phone’s month-wise selling price and choose a Kavach plan with Kimaat Lock.";
    const canonicalUrl = new URL(window.location.href);
    canonicalUrl.search = "";
    canonicalUrl.hash = "";
    setPageSocialMetadata({
      title,
      description,
      image: logo,
      url: canonicalUrl.href,
      siteName,
      type: "website",
    });
  }, [pathname, siteName, logo]);

  return null;
}

function OfflineStatusDialog() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      // Reload only on the offline -> online transition. This makes all
      // queries use their network responses after connectivity is restored.
      window.setTimeout(() => window.location.reload(), 150);
    };
    if (!navigator.onLine) handleOffline();
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <Dialog open={isOffline} onOpenChange={() => {}}>
      <DialogContent
        aria-describedby="offline-description"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        className="max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[430px] overflow-hidden rounded-[28px] border-0 bg-white p-0 shadow-[0_28px_90px_rgba(4,28,55,.32)] [&>button.absolute.right-4.top-4]:hidden"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-[#092b52] via-[#075277] to-[#087d83] px-7 pb-8 pt-9 text-center text-white sm:px-9">
          <div className="absolute -right-14 -top-20 size-52 rounded-full bg-white/5" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-12 size-44 rounded-full bg-[#f58220]/15" aria-hidden="true" />
          <div className="relative mx-auto grid size-[86px] place-items-center rounded-[26px] border border-white/20 bg-white/10 shadow-inner shadow-white/10">
            <WifiOff className="size-10 text-[#ffad64]" strokeWidth={1.8} aria-hidden="true" />
            <span className="absolute -right-1 -top-1 size-4 rounded-full border-[3px] border-[#075277] bg-[#f58220]" aria-hidden="true" />
          </div>
          <p className="relative mt-5 text-[11px] font-bold uppercase tracking-[.22em] text-white/70">Kimaat Lock</p>
          <DialogTitle className="relative mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-[34px]">
            You’re offline
          </DialogTitle>
          <DialogDescription id="offline-description" className="relative mx-auto mt-3 max-w-[320px] text-sm leading-6 text-white/80">
            Your internet connection was interrupted. Your details are safe; reconnect to continue where you left off.
          </DialogDescription>
        </div>

        <div className="px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
          <div className="flex items-center gap-3 rounded-2xl border border-[#f4e3d2] bg-[#fff8f1] p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#0b4772] shadow-sm">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#102c4d]">Your progress is safe</p>
              <p className="mt-0.5 text-xs leading-5 text-[#68788b]">We’ll close this message when your connection returns.</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.onLine) window.location.reload();
            }}
            className="mt-5 h-12 w-full rounded-full bg-gradient-to-r from-[#0b2a55] to-[#08717f] text-white shadow-[0_10px_22px_rgba(11,42,85,.2)] hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Retry connection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CompanyBrandingSync() {
  const companyQuery = useQuery({ queryKey: apiQueryKeys.companyDetails, queryFn: getCompanyDetails });
  useEffect(() => {
    const company = companyQuery.data?.result?.[0];
    if (!company) return;
    const iconUrl = resolveCompanyLogoUrl(company.company_favicon);
    const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (iconUrl && link) link.href = versionedAssetUrl(iconUrl);
    const companyName = company.company_name?.trim();
    if (companyName) {
      document.querySelector<HTMLMetaElement>('meta[name="author"]')?.setAttribute("content", companyName);
      document.title = document.title.replace(/Kimaat Lock/g, companyName);
    }
  }, [companyQuery.data]);
  return null;
}

function RuntimeDebugPanel() {
  const enabled = isDebugEnabled();
  const [logs, setLogs] = useState<RuntimeLog[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const update = () => setLogs(window.__KIMAAT_RUNTIME_LOGS__?.() ?? []);
    update();
    const timer = window.setInterval(update, 400);
    return () => window.clearInterval(timer);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <aside
      aria-label="Kimaat diagnostic log"
      className="fixed bottom-3 right-3 z-[10000] max-h-[38vh] w-[min(440px,calc(100vw-24px))] overflow-auto rounded-xl border border-slate-600 bg-slate-950/95 p-3 font-mono text-[11px] text-slate-100 shadow-2xl"
    >
      <div className="sticky top-0 mb-2 flex items-center justify-between bg-slate-950 pb-2 text-xs font-bold">
        <span>Kimaat diagnostics · no typed values</span>
        <button type="button" onClick={() => setLogs([])} className="rounded bg-slate-800 px-2 py-1">
          Clear
        </button>
      </div>
      {logs.length ? (
        <ol className="space-y-1">
          {logs.slice(-18).map((entry, index) => (
            <li key={`${entry.time}-${entry.event}-${index}`} className="break-words">
              {new Date(entry.time).toLocaleTimeString()} · {entry.event}
              {entry.target ? ` · ${entry.target}` : ""}
              {entry.status !== undefined ? ` · HTTP ${entry.status}` : ""}
              {entry.durationMs !== undefined ? ` · ${entry.durationMs} ms` : ""}
            </li>
          ))}
        </ol>
      ) : (
        <p>Waiting for input or API activity…</p>
      )}
    </aside>
  );
}
