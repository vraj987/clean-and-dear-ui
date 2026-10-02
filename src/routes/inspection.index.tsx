import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ClipboardCheck, MapPin, Phone, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { inspectionCustomers } from "@/lib/inspection";
import { readAuthSession, type AuthSession } from "@/services/api/auth";

export const Route = createFileRoute("/inspection/")({
  head: () => ({
    meta: [
      { title: "Device Inspections — BytePe" },
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
          <span className="rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary">
            {inspectionCustomers.length} assigned visits
          </span>
        </div>

        <div className="mt-7 space-y-3">
          {inspectionCustomers.map((customer) => (
            <article
              key={customer.id}
              className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Smartphone className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{customer.name}</h2>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          customer.requestType === "Exchange"
                            ? "bg-primary-soft text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {customer.requestType} request
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                        {customer.visitStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {customer.brand} {customer.model} · {customer.variant}
                    </p>
                  </div>
                </div>
                <Link
                  to="/inspection/$customerId"
                  params={{ customerId: customer.id }}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
                >
                  Open inspection <ArrowRight className="size-4" />
                </Link>
              </div>
              {customer.requestType === "Exchange" && customer.requestedPhone && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/15 bg-primary-soft/40 p-3 sm:ml-14 sm:items-center">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-background text-primary">
                    <Smartphone className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      New phone requested
                    </p>
                    <p className="mt-0.5 text-sm font-semibold">
                      {customer.requestedPhone.brand} {customer.requestedPhone.model}
                    </p>
                    <p className="text-xs text-muted-foreground">{customer.requestedPhone.variant}</p>
                  </div>
                </div>
              )}
              <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="size-4 shrink-0 text-muted-foreground" />
                    <a className="hover:text-primary" href={`tel:${customer.mobile.replace(/\D/g, "")}`}>
                      {customer.mobile}
                    </a>
                  </p>
                  <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0" />
                    <span>
                      {customer.address}, {customer.city}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 sm:justify-end">
                  <Button asChild variant="outline" size="sm" className="flex-1 rounded-full sm:flex-none">
                    <a href={`tel:${customer.mobile.replace(/\D/g, "")}`}>
                      <Phone className="size-4" /> Call
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 rounded-full sm:flex-none">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${customer.address}, ${customer.city}`)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MapPin className="size-4" /> Directions
                    </a>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </PageShell>
  );
}
