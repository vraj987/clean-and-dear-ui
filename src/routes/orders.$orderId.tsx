import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  PackageCheck,
  Phone,
  ReceiptText,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { getProduct } from "@/lib/catalog";
import { demoOrders } from "@/lib/orders";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders/$orderId")({
  beforeLoad: ({ params }) => {
    if (!demoOrders.some((order) => order.id === params.orderId)) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Order details — BytePe" },
      { name: "description", content: "Review order information and follow your delivery status." },
    ],
  }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const order = demoOrders.find((item) => item.id === orderId)!;
  const product = getProduct(order.itemSlug)!;
  const lastComplete = order.timeline.filter((event) => event.complete).length - 1;

  return (
    <PageShell>
      <main className="mx-auto max-w-[1100px] px-4 py-8 md:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link to="/orders" className="hover:text-primary">
            My orders
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{order.id}</span>
        </nav>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to orders
        </Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
              Order details
            </p>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl">Order {order.id}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Placed on {order.placed}</p>
          </div>
          <span
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold",
              order.status === "Delivered"
                ? "bg-success-soft text-success"
                : "bg-primary-soft text-primary",
            )}
          >
            {order.status}
          </span>
        </div>
        <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_.75fr]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl">Delivery progress</h2>
                <Truck className="size-5 text-primary" />
              </div>
              <div id="timeline" className="mt-6">
                {order.timeline.map((event, index) => (
                  <div key={event.title} className="relative flex gap-4 pb-7 last:pb-0">
                    <div className="relative flex w-8 shrink-0 justify-center">
                      <span
                        className={cn(
                          "z-10 grid size-8 place-items-center rounded-full",
                          event.complete
                            ? "bg-success text-white"
                            : "border-2 border-border bg-background text-muted-foreground",
                        )}
                      >
                        {event.complete ? (
                          <Check className="size-4" />
                        ) : (
                          <Clock3 className="size-4" />
                        )}
                      </span>
                      {index < order.timeline.length - 1 && (
                        <span
                          className={cn(
                            "absolute top-8 h-[calc(100%-8px)] w-0.5",
                            index < lastComplete ? "bg-success/50" : "bg-border",
                          )}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3
                          className={cn(
                            "text-sm font-semibold",
                            !event.complete && "text-muted-foreground",
                          )}
                        >
                          {event.title}
                        </h3>
                        <span className="text-[11px] text-muted-foreground">{event.date}</span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="font-display text-2xl">Delivery address</h2>
              <p className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                {order.address}
              </p>
              <div className="mt-5 border-t border-border pt-4">
                <a
                  href="tel:+918065918016"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  <Phone className="size-4" />
                  Need help with this order?
                </a>
              </div>
            </section>
          </div>
          <aside className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className={cn("aspect-[4/3] overflow-hidden", product.tone)}>
                <img
                  src={product.image}
                  alt={`${product.brand} ${product.name}`}
                  className="size-full object-cover"
                  style={{ objectPosition: product.imagePosition ?? "center" }}
                />
              </div>
              <div className="p-5">
                <p className="text-xs text-muted-foreground">{product.brand}</p>
                <h2 className="mt-1 text-lg font-semibold">{product.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{order.payment}</p>
                <Button asChild variant="outline" className="mt-4 w-full rounded-full">
                  <Link to="/products/$slug" params={{ slug: product.slug }}>
                    View product
                  </Link>
                </Button>
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-xl">Payment summary</h2>
              <div className="mt-4 flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Payment method</span>
                <span className="text-right">{order.payment}</span>
              </div>
              <div className="mt-3 flex justify-between gap-4 border-t border-border pt-3 text-sm">
                <span className="font-semibold">Order total</span>
                <b>{order.total}</b>
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-success" />
                Payment information is a UI preview only.
              </p>
            </section>
            <section className="rounded-2xl bg-logo p-5 text-logo-foreground">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-white/10">
                  <PackageCheck className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">BytePe open-box delivery</p>
                  <p className="mt-1 text-xs text-white/65">
                    Check your device before you accept delivery.
                  </p>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-white/65">
                <ReceiptText className="size-4" />
                Sample details for interface preview.
              </p>
            </section>
          </aside>
        </div>
      </main>
    </PageShell>
  );
}
