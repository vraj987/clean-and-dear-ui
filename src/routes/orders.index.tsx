import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  PackageSearch,
  ReceiptText,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { mapApiOrder, type OrderRecord } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { readAuthSession } from "@/services/api/auth";
import { getOrders } from "@/services/api/order.service";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "My Orders — Kimaat Lock" },
      { name: "description", content: "View order details and track your Kimaat Lock deliveries." },
    ],
  }),
  component: OrdersPage,
});

function dateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [fromDate, setFromDate] = useState(() => dateOffset(-15));
  const [toDate, setToDate] = useState(() => dateOffset(0));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => setSessionId(readAuthSession()?.accountId ?? ""), []);

  useEffect(() => {
    if (!sessionId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError("");
    void getOrders({ from_date: fromDate, to_date: toDate, filter_user: sessionId })
      .then((records) => {
        if (active) setOrders(records.map(mapApiOrder));
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setOrders([]);
        setError(reason instanceof Error ? reason.message : "Could not load your orders.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sessionId, fromDate, toDate]);

  return (
    <PageShell>
      <main className="mx-auto min-h-[60vh] max-w-[1100px] px-4 py-8 md:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">My orders</span>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
              Your Kimaat Lock account
            </p>
            <h1 className="mt-1 font-display text-4xl">My orders</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Keep track of your deliveries and revisit order details.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/products">
              <PackageSearch className="size-4" />
              Keep exploring
            </Link>
          </Button>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-3 sm:px-5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <SlidersHorizontal className="size-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Filter orders by date</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Choose a date range to find an order.
              </p>
            </div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end sm:gap-4 sm:px-5">
            <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-foreground">
              <span className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-3.5" />
                From date
              </span>
              <input
                type="date"
                value={fromDate}
                max={toDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="h-12 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>
            <span className="hidden pb-5 text-xs font-medium text-muted-foreground sm:block">
              to
            </span>
            <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-foreground">
              <span className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-3.5" />
                To date
              </span>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                max={dateOffset(0)}
                onChange={(event) => setToDate(event.target.value)}
                className="h-12 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>
          </div>
        </section>

        <div className="mt-5 space-y-4">
          {loading &&
            Array.from({ length: 2 }, (_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl border border-border bg-muted/50"
              />
            ))}
          {!loading &&
            orders.map((order) => {
              return (
                <article
                  key={`${order.id}-${order.orderType}`}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-card"
                >
                  <Link
                    to="/orders/$orderId"
                    params={{ orderId: order.id }}
                    aria-label={`View order ${order.id} details`}
                    className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/60 px-5 py-3 text-xs">
                    <span className="flex items-center gap-2 font-semibold">
                      <ReceiptText className="size-4 text-primary" />
                      Order {order.id}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      Placed {order.placed}
                    </span>
                  </div>
                  <div className="pointer-events-none relative z-10 p-4 sm:p-5">
                    <div className="grid gap-3 rounded-xl bg-muted/40 p-3 sm:grid-cols-2 sm:p-4">
                      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-2">
                        <div>
                          <p className="text-muted-foreground">Order date</p>
                          <p className="mt-1 font-semibold text-foreground">{order.placed}</p>
                        </div>
                        {order.deliveryDate && (
                          <div>
                            <p className="text-muted-foreground">Delivery date</p>
                            <p className="mt-1 font-semibold text-foreground">{order.deliveryDate}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground">Order type</p>
                          <p className="mt-1 font-semibold text-foreground">{order.orderType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Order status</p>
                          <p className="mt-1 font-semibold text-foreground">{order.status}</p>
                        </div>
                       
                      </div>
                      <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                        {order.productTotal > 0 && (
                          <div>
                            <p className="text-muted-foreground">Products total</p>
                            <p className="mt-1 font-semibold text-foreground">
                              {order.productTotal}
                            </p>
                          </div>
                        )}
                        {order.kavachTotal &&
                          Number(order.kavachTotal.replace(/[^0-9.]/g, "")) > 0 && (
                            <div>
                              <p className="text-muted-foreground">Kavach total</p>
                              <p className="mt-1 font-semibold text-foreground">
                                {order.kavachTotal}
                              </p>
                            </div>
                          )}
                        {order.discountTotal &&
                          Number(order.discountTotal.replace(/[^0-9.]/g, "")) > 0 && (
                            <div>
                              <p className="text-muted-foreground">Discount</p>
                              <p className="mt-1 font-semibold text-foreground">
                                −{order.discountTotal}
                              </p>
                            </div>
                          )}
                        <div>
                          <p className="text-muted-foreground">Order total</p>
                          <p className="mt-1 text-base font-bold text-foreground">
                            {order.payableTotal || order.total}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h2 className="mb-2 text-sm font-semibold">Products in this order</h2>
                      {order.products?.length ? (
                        <div className="space-y-2">
                          {order.products.map((product, index) => (
                            <div
                              key={`${product.name}-${index}`}
                              className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-background p-3"
                            >
                              <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="size-full object-contain p-1"
                                  />
                                ) : (
                                  <PackageSearch className="size-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="break-words text-sm font-semibold">{product.name}</p>
                                {product.variant && (
                                  <p className="mt-0.5 break-words text-xs text-muted-foreground">
                                    {product.variant}
                                  </p>
                                )}
                                {product.price > 0 && (
                                  <p className="mt-1 text-xs font-semibold">
                                    Product price · {product.price}
                                  </p>
                                )}
                                {product.packageName && (
                                  <p className="mt-2 inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-lg bg-primary-soft px-2.5 py-1.5 text-xs font-semibold text-primary">
                                    <ShieldCheck className="size-3.5" /> {product.packageName}{" "}
                                    Kavach
                                    {/* {product.duration > 0 && (
                                      <>
                                        {" "}
                                        · {product.duration}{" "}
                                        {product.duration === 1 ? "month" : "months"}
                                      </>
                                    )} */}
                                    {Number(product.packagePrice) > 0 && (
                                      <>
                                        {" "}
                                        ·{" "}
                                        {`₹${Number(product.packagePrice).toLocaleString("en-IN")}`}
                                      </>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                          No product data found
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        asChild
                        variant="outline"
                        className="pointer-events-auto w-full rounded-full sm:w-auto"
                      >
                        <Link to="/orders/$orderId" params={{ orderId: order.id }}>
                          View details
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          {!loading && !orders.length && (
            <section className="rounded-2xl border border-border bg-card px-5 py-12 text-center">
              <PackageSearch className="mx-auto size-9 text-muted-foreground" />
              <h2 className="mt-3 font-display text-xl">No data found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {error ||
                  (sessionId
                    ? "There are no orders in this date range. Try changing the dates."
                    : "Sign in to see your orders here.")}
              </p>
            </section>
          )}
        </div>
      </main>
    </PageShell>
  );
}
