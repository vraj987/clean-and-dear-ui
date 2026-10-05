import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, ChevronRight, PackageSearch, ReceiptText } from "lucide-react";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { catalog, getProduct } from "@/lib/catalog";
import { demoOrders } from "@/lib/orders";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "My Orders — BytePe" },
      { name: "description", content: "View order details and track your BytePe deliveries." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
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
              Your BytePe account
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
        <div className="mt-8 space-y-4">
          {demoOrders.map((order) => {
            const item = getProduct(order.itemSlug) ?? catalog[0]!;
            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-card"
              >
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
                <div className="grid gap-4 p-4 sm:grid-cols-[100px_minmax(0,1fr)_auto] sm:items-center sm:p-5">
                  <div className={cn("aspect-square overflow-hidden rounded-xl", item.tone)}>
                    <img
                      src={item.image}
                      alt={`${item.brand} ${item.name}`}
                      className="size-full object-cover"
                      style={{ objectPosition: item.imagePosition ?? "center" }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">
                        {item.brand} {item.name}
                      </h2>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          order.status === "Delivered"
                            ? "bg-success-soft text-success"
                            : "bg-primary-soft text-primary",
                        )}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{order.payment}</p>
                    <p className="mt-3 text-sm">
                      Total <b>{order.total}</b>
                    </p>
                  </div>
                  <Button asChild variant="outline" className="w-full rounded-full sm:w-auto">
                    <Link to="/orders/$orderId" params={{ orderId: order.id }}>
                      View details
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Sample order information shown for UI preview. No account or order data is connected.
        </p>
      </main>
    </PageShell>
  );
}
