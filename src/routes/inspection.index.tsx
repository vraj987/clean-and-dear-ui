import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { readAuthSession, type AuthSession } from "@/services/api/auth";

export const Route = createFileRoute("/inspection/")({
  head: () => ({
    meta: [
      { title: "Device Inspections — Kimaat Lock" },
      { name: "description", content: "Manage customer device inspections." },
    ],
  }),
  component: InspectionListPage,
});

function InspectionListPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(readAuthSession());
    setReady(true);
  }, []);

  if (!ready) return null;

  if (session?.accountType !== "employee") {
    return (
      <PageShell>
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <ClipboardCheck className="mx-auto size-10 text-primary" />
          <h1 className="mt-4 font-display text-3xl">Employee access only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with an employee account to open device inspections.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/profile">Go to profile</Link>
          </Button>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="mx-auto min-h-[65vh] max-w-[1100px] px-4 py-8 md:px-8">
        <Link
          to="/profile"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" /> My profile
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
              Employee workspace
            </p>
            <h1 className="mt-1 font-display text-4xl">Customer inspections</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Open a customer visit, inspect the device, and send the result for admin approval.
            </p>
          </div>
          <span className="rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary">0 assigned visits</span>
        </div>

        <div className="mt-7 rounded-2xl border border-dashed border-border p-10 text-center">
          <ClipboardCheck className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">No data found</p>
          <p className="mt-1 text-sm text-muted-foreground">Customer inspections will appear here when available.</p>
        </div>
      </main>
    </PageShell>
  );
}
