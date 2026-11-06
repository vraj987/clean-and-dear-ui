import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Package, Search, Store } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { readAuthSession, type AuthSession } from "@/services/api/auth";
import { getOrders, type OrderApiRecord } from "@/services/api/order.service";

export const Route = createFileRoute("/vendor/orders/")({ component: VendorOrdersPage });

function localDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function VendorOrdersPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [startDate, setStartDate] = useState(localDate(-15));
  const [endDate, setEndDate] = useState(localDate());
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<OrderApiRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setSession(readAuthSession()); setReady(true); }, []);

  useEffect(() => {
    if (!session || (session.accountType !== "vendor" && session.accountType !== "employee")) return;
    let active = true;
    setLoading(true);
    setError("");
    void getOrders({ from_date: startDate, to_date: endDate, created_by_user_id: session.accountId })
      .then((rows) => { if (active) setOrders(rows); })
      .catch((reason: unknown) => {
        if (!active) return;
        setOrders([]);
        setError(reason instanceof Error ? reason.message : "Could not load store orders.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session, startDate, endDate]);

  const filtered = useMemo(() => orders.filter((order) => {
    const orderStatus = String(order.order_status_text ?? order.order_status ?? "").toLowerCase();
    const products = Array.isArray(order.products) ? order.products as OrderApiRecord[] : [];
    const searchText = [
      order.customer_name, order.customer_mobile, order.invoice_number,
      ...products.flatMap((product) => [product.invoice_number, product.product_variant, product.pro_name]),
    ].join(" ").toLowerCase();
    return (!status || orderStatus === status.toLowerCase()) && (!query.trim() || searchText.includes(query.trim().toLowerCase()));
  }), [orders, status, query]);

  if (!ready) return null;
  if (session?.accountType !== "vendor" && session?.accountType !== "employee") return <VendorOnly />;

  return (
    <PageShell>
      <main className="mx-auto min-h-[65vh] max-w-[1100px] px-4 py-8 md:px-8">
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> My profile</Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">{session.accountType === "vendor" ? "Vendor" : "Employee"} workspace</p><h1 className="mt-1 font-display text-4xl">Store Orders</h1><p className="mt-2 text-sm text-muted-foreground">Orders created from this account for customers.</p></div><span className="rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary">{filtered.length} orders</span></div>

        <section className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_1.6fr] lg:items-end">
            <label className="text-xs font-semibold text-muted-foreground">Start date<Input type="date" value={startDate} max={endDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1.5 h-11 font-normal text-foreground" /></label>
            <label className="text-xs font-semibold text-muted-foreground">End date<Input type="date" value={endDate} min={startDate} max={localDate()} onChange={(event) => setEndDate(event.target.value)} className="mt-1.5 h-11 font-normal text-foreground" /></label>
            <label className="text-xs font-semibold text-muted-foreground">Order status<SearchableSelect value={status} onValueChange={setStatus} placeholder="All statuses" className="mt-1.5" options={[{ value: "", label: "All statuses" }, ...["Active", "Paid", "Cancelled"].map((item) => ({ value: item, label: item }))]} /></label>
            <label className="text-xs font-semibold text-muted-foreground">Search invoice or customer mobile<span className="relative mt-1.5 block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Invoice number or mobile" className="h-11 pl-9 font-normal" /></span></label>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Showing orders from the last 15 days by default.</p>
        </section>

        <div className="mt-5 space-y-3">
          {loading && <div className="rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">Loading store orders…</div>}
          {!loading && error && <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">{error}</div>}
          {!loading && !error && filtered.map((order) => {
            const orderId = String(order.kavach_order_id ?? "");
            const products = Array.isArray(order.products) ? order.products as OrderApiRecord[] : [];
            const firstProduct = products[0];
            const itemName = String(firstProduct?.pro_name ?? order.pro_name ?? order.product_variant ?? "Kavach subscription");
            const invoice = String(firstProduct?.invoice_number ?? order.invoice_number ?? "");
            return <Link key={orderId} to="/vendor/orders/$orderId" params={{ orderId }} className="block rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Package className="size-5" /></span><div className="min-w-0"><p className="font-semibold">Order #{orderId}</p><p className="mt-0.5 break-words text-sm text-muted-foreground">{itemName}{products.length > 1 ? ` + ${products.length - 1} more` : ""}</p></div></div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{String(order.order_status_text ?? order.order_status ?? "Pending")}</span>
              </div>
              <div className="mt-4 grid gap-2 border-t border-border pt-3 text-sm sm:grid-cols-4">
                <p><span className="text-muted-foreground">Customer</span><br /><span className="font-medium">{String(order.customer_name ?? "—")}</span></p>
                <p><span className="text-muted-foreground">Mobile</span><br /><span className="font-medium">{String(order.customer_mobile ?? "—")}</span></p>
                <p><span className="text-muted-foreground">Invoice</span><br /><span className="font-medium">{invoice || "—"}</span></p>
                <p><span className="text-muted-foreground">Payable</span><br /><span className="font-semibold">₹{Number(order.payable_amount ?? order.kavach_payable ?? 0).toLocaleString("en-IN")}</span></p>
              </div>
            </Link>;
          })}
          {!loading && !error && filtered.length === 0 && <div className="rounded-2xl border border-dashed border-border p-10 text-center"><Package className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 font-semibold">No data found</p><p className="mt-1 text-sm text-muted-foreground">Orders placed for customers from this account will appear here.</p></div>}
        </div>
      </main>
    </PageShell>
  );
}

export function VendorOnly() {
  return <PageShell><main className="mx-auto max-w-3xl px-4 py-16 text-center"><Store className="mx-auto size-10 text-primary" /><h1 className="mt-4 font-display text-3xl">Staff access only</h1><p className="mt-2 text-sm text-muted-foreground">Sign in with a vendor or employee account to view Store Orders.</p><Button asChild className="mt-6 rounded-full"><Link to="/profile">Go to profile</Link></Button></main></PageShell>;
}
