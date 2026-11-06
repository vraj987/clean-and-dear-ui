import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LoaderCircle, PackageSearch } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/shop/site-shell";
import { readAuthSession, type AuthSession } from "@/services/api/auth";
import { getOrders, type OrderApiRecord } from "@/services/api/order.service";
import { VendorOnly } from "@/routes/vendor.orders.index";

export const Route = createFileRoute("/vendor/orders/$orderId")({ component: VendorOrderDetailPage });

function VendorOrderDetailPage() {
  const { orderId } = Route.useParams();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [order, setOrder] = useState<OrderApiRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { setSession(readAuthSession()); setReady(true); }, []);
  useEffect(() => {
    if (!session || (session.accountType !== "vendor" && session.accountType !== "employee")) return;
    let active = true;
    setLoading(true);
    setError("");
    void getOrders({ from_date: "", to_date: "", kavach_order_id: orderId, created_by_user_id: session.accountId })
      .then((rows) => { if (active) setOrder(rows[0] ?? null); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load this order."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session, orderId]);

  if (!ready) return null;
  if (session?.accountType !== "vendor" && session?.accountType !== "employee") return <VendorOnly />;
  const products = Array.isArray(order?.products) ? order.products as OrderApiRecord[] : [];

  return (
    <PageShell>
      <main className="mx-auto min-h-[65vh] max-w-[900px] px-4 py-8 md:px-8">
        <Link to="/vendor/orders" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Store Orders</Link>
        {loading ? <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-border p-12 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" /> Loading order…</div>
          : error ? <p className="mt-8 rounded-2xl border border-destructive/30 p-5 text-sm text-destructive">{error}</p>
            : !order ? <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center"><PackageSearch className="mx-auto size-10 text-muted-foreground" /><h1 className="mt-4 font-display text-2xl">No data found</h1><p className="mt-2 text-sm text-muted-foreground">Order {orderId} is not available for this account.</p></div>
              : <>
                <div className="mt-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Store order</p><h1 className="mt-1 font-display text-3xl">Order #{orderId}</h1></div><span className="rounded-full bg-primary-soft px-3 py-1.5 text-sm font-semibold text-primary">{String(order.order_status_text ?? order.order_status ?? "Pending")}</span></div>
                <section className="mt-5 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2"><div><h2 className="font-semibold">Customer</h2><p className="mt-2 text-sm">{String(order.customer_name ?? "—")}</p><p className="text-sm text-muted-foreground">{String(order.customer_mobile ?? "—")}</p></div><div><h2 className="font-semibold">Payment</h2><p className="mt-2 text-sm">Payable · ₹{Number(order.payable_amount ?? order.kavach_payable ?? 0).toLocaleString("en-IN")}</p><p className="text-sm text-muted-foreground">{String(order.kavach_razorpay_status ?? "") === "2" ? "Paid online" : String(order.order_status_text ?? "Payment pending")}</p></div></section>
                <section className="mt-5 rounded-2xl border border-border bg-card p-5"><h2 className="font-semibold">Products and Kavach</h2><div className="mt-3 space-y-3">{products.map((product, index) => <div key={`${product.product_id ?? "product"}-${index}`} className="rounded-xl border border-border p-4"><p className="font-medium">{String(product.pro_name ?? product.product_variant ?? "Product")}</p><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground"><span>Price · ₹{Number(product.purchase_price ?? 0).toLocaleString("en-IN")}</span>{String(product.package_name ?? "").trim() && <span>{String(product.package_name)} Kavach · {String(product.duration ?? "—")} months</span>}</div></div>)}</div></section>
              </>}
      </main>
    </PageShell>
  );
}
