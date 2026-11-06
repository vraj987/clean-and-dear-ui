import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  MapPin,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageShell, rememberAuthReturnPath } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { ApiStatusError } from "@/services/api/client";
import {
  checkSavedSession,
  clearSavedAccountData,
  readAuthSession,
  type AuthSession,
} from "@/services/api/auth";
import { listCart, type CartRecord } from "@/services/api/cart.service";
import { purchaseCart, verifyCartPayment } from "@/services/api/purchase-cart.service";
import { apiConfig } from "@/services/api/config";
import { getCities, getStates, type CityRecord, type StateRecord } from "@/services/api/catalog";
import { mapApiProduct } from "@/lib/catalog";
import { getProducts } from "@/services/api/product.service";
import { openRazorpayCheckout } from "@/services/razorpay";
import { useCompanyDetails } from "@/services/api/company.service";

export const Route = createFileRoute("/checkout/payment")({
  head: () => ({
    meta: [
      { title: "Payment Options — Kimaat Lock" },
      { name: "description", content: "Review your order and choose a payment method." },
    ],
  }),
  component: PaymentPage,
});

const BILLING_KEY = "kimaat-lock-billing-address";
type PaymentMethod = "online" | "cod";
type BillingDetails = Record<string, string>;

function money(value: string | number | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount)
    ? `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : "₹0";
}

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function PaymentPage() {
  const companyQuery = useCompanyDetails();
  const companyName = companyQuery.data?.result?.[0]?.company_name || apiConfig.projectName;
  const navigate = useNavigate({ from: "/checkout/payment" });
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [loadingCart, setLoadingCart] = useState(true);
  const [rows, setRows] = useState<CartRecord[]>([]);
  const [address, setAddress] = useState<BillingDetails>({});
  const [stateName, setStateName] = useState("");
  const [cityName, setCityName] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("online");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [codPlaced, setCodPlaced] = useState(false);
  const [gatewayOpening, setGatewayOpening] = useState(false);

  useEffect(() => {
    let mounted = true;
    const saved = readAuthSession();
    if (!saved) {
      setChecking(false);
      setLoadingCart(false);
      return;
    }
    setSession(saved);
    let savedBilling: BillingDetails = {};
    try {
      savedBilling = JSON.parse(localStorage.getItem(BILLING_KEY) || "{}") as BillingDetails;
      setAddress(savedBilling);
    } catch {
      setAddress({});
    }

    void Promise.all([
      getStates().catch(() => [] as StateRecord[]),
      listCart({ user_id: saved.accountId }),
      checkSavedSession(saved),
    ])
      .then(async ([states, cart]) => {
        if (!mounted) return;
        const stateId = savedBilling["state_id"] || "";
        const selectedState = states.find((item) => item.state_id === stateId);
        setStateName(selectedState?.state_name || "");
        if (stateId) {
          const cities = await getCities(stateId).catch(() => [] as CityRecord[]);
          if (!mounted) return;
          const selectedCity = cities.find((item) => item.city_id === savedBilling["city_id"]);
          setCityName(selectedCity?.city_name || "");
        }
        if (String(cart.status) === "1") {
          const enrichedRows = await Promise.all(
            (cart.result ?? []).map(async (row) => {
              const purchasePrice =
                row.retailer_price || row.purchase_price || row.original_price || "0";
              try {
                const products = await getProducts({
                  product_id: row.cart_product_id || row.product_id,
                  brand_id: row.brand_id || "",
                  model_id: row.model_id || "",
                  invoice_date: row.invoice_date || today(),
                  purchase_price: purchasePrice,
                  duration: String(Math.max(1, Number(row.cart_duration) || 1)),
                  package_id: "",
                });
                const product = products.find(
                  (item) => item.product_id === (row.cart_product_id || row.product_id),
                );
                return { ...row, packages: product?.packages ?? row.packages ?? [] };
              } catch {
                return row;
              }
            }),
          );
          if (mounted) setRows(enrichedRows);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof ApiStatusError) {
          if (String(error.status) === "3") {
            clearSavedAccountData();
            if (mounted) {
              setSession(null);
              setMessage(error.message);
              rememberAuthReturnPath();
              void navigate({ to: "/profile" });
            }
          } else if (mounted) {
            setMessage(error.message);
          }
        } else if (mounted) {
          setMessage(error instanceof Error ? error.message : "Could not load checkout details.");
        }
      })
      .finally(() => {
        if (mounted) {
          setChecking(false);
          setLoadingCart(false);
        }
      });

    return () => {
      mounted = false;
    };
    // Load the address snapshot from storage once along with the authenticated cart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const totals = useMemo(() => {
    const products = rows.reduce((sum, row) => {
      const price = Number(row.retailer_price || row.original_price || row.purchase_price || 0);
      return sum + price * (Number(row.cart_qty) || 1);
    }, 0);
    const protection = rows.reduce((sum, row) => {
      const quote =
        String(row.product_type ?? "") === "3"
          ? undefined
          : row.packages?.find((item) => item.package_id === row.cart_package_id);
      return sum + Number(quote?.package_price || 0) * (Number(row.cart_qty) || 1);
    }, 0);
    return {
      products: money(products),
      protection: money(protection),
      total: money(products + protection),
    };
  }, [rows]);

  async function submitPayment() {
    setMessage("");
    setSubmitting(true);
    try {
      if (!session) throw new Error("Please sign in before continuing.");
      if (!rows.length) throw new Error("Your cart is empty. Add a product before checkout.");
      const shipping = {
        shipping_name: address["name"] || session.name,
        shipping_mobile: address["mobile"] || session.mobile,
        shipping_email: address["email"] || session.account["customer_email"] || "",
        shipping_address: address["address"] || "",
        shipping_state_id: address["state_id"] || "",
        shipping_city_id: address["city_id"] || "",
        shipping_pincode: address["pincode"] || "",
        delivery_instructions: address["remarks"] || "",
      };

      if (method === "cod") {
        await purchaseCart(session.accountId, shipping, "cod");
        setCodPlaced(true);
        await new Promise((resolve) => window.setTimeout(resolve, 1200));
        await navigate({ to: "/orders" });
        return;
      }

      {
        const order = await purchaseCart(session.accountId, shipping, "online");
        const razorpayOrderId = order.razorpay_order_id;
        const checkoutKey = order.razorpay_key_id || apiConfig.razorpayKeyId;
        if (!checkoutKey) throw new Error("Razorpay is not configured. Please contact support.");

        setGatewayOpening(true);
        const checkout = await openRazorpayCheckout({
          key: checkoutKey,
          orderId: razorpayOrderId,
          amount: Number(order.razorpay_amount),
          currency: order.razorpay_currency || "INR",
          name: companyName,
          description: "Your cart purchase",
          customerName: session.name,
          customerEmail: session.account["customer_email"] || undefined,
          customerPhone: session.mobile,
        });
        setGatewayOpening(false);

        if (checkout.type === "dismissed") {
          setMessage("Payment was cancelled. Your cart is still saved, so you can try again.");
          return;
        }

        const payment = checkout.type === "success" ? checkout.payment : null;
        const verification = await verifyCartPayment({
          kavach_customer_id: session.accountId,
          kavach_razorpayOrderId: payment?.razorpay_order_id || razorpayOrderId,
          current_kavach_order_id: order.kavach_order_id,
          razorpay_signature: payment?.razorpay_signature || "",
          razorpay_payment_id:
            payment?.razorpay_payment_id ||
            (checkout.type === "failed" ? checkout.error.metadata?.payment_id || "" : ""),
          kavach_razorpay_status: checkout.type === "success" ? "2" : "3",
        });
        if (checkout.type === "failed" || verification[0]?.payment_status !== "2") {
          throw new Error(
            checkout.type === "failed"
              ? checkout.error.description ||
                  "Payment could not be completed. Your cart is still saved; please try again."
              : "Payment could not be verified. Your cart is still saved; please try again.",
          );
        }

        setCodPlaced(true);
        await new Promise((resolve) => window.setTimeout(resolve, 900));
        await navigate({ to: "/orders" });
        return;
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not continue with payment.");
    } finally {
      setGatewayOpening(false);
      setSubmitting(false);
    }
  }

  if (checking)
    return (
      <PageShell footer={false}>
        <main className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
          Checking your account…
        </main>
      </PageShell>
    );
  if (!session)
    return (
      <PageShell footer={false}>
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Sign in to continue</h1>
          <p className="mt-3 text-muted-foreground">Please verify your profile before checkout.</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/profile" onClick={rememberAuthReturnPath}>
              Continue to profile
            </Link>
          </Button>
        </main>
      </PageShell>
    );

  return (
    <PageShell footer={false}>
      {submitting && !gatewayOpening && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
            {codPlaced ? (
              <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
            ) : (
              <LoaderCircle className="mx-auto size-11 animate-spin text-primary" />
            )}
            <h2 className="mt-4 font-display text-xl font-semibold">
              {codPlaced
                ? method === "online"
                  ? "Payment successful"
                  : "Order placed successfully"
                : method === "online"
                  ? "Confirming your payment…"
                  : "Placing your COD order…"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {codPlaced
                ? method === "online"
                  ? "Your order is confirmed. Opening your orders list."
                  : "Your cash-on-delivery order is confirmed. Opening your orders list."
                : method === "online"
                  ? "Please wait while we verify your payment and confirm the order."
                  : "Please wait while we prepare your order preview."}
            </p>
          </div>
        </div>
      )}
      <main className="min-h-[70vh] bg-muted/40 px-4 py-7 md:px-8">
        <div className="mx-auto max-w-[980px]">
          <Link
            to="/checkout/address"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Shipping Address
          </Link>
          <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-full bg-primary px-3 py-1.5 font-semibold text-primary-foreground">
              1 · Address
            </span>
            <span className="h-px flex-1 bg-border" />
            <span className="rounded-full bg-foreground px-3 py-1.5 font-semibold text-background">
              2 · Payment
            </span>
          </div>
          <h1 className="mt-7 font-display text-3xl font-semibold">Review &amp; payment</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review your items and delivery details before choosing how to pay.
          </p>

          {message && (
            <div
              role="alert"
              className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
            >
              {message}
            </div>
          )}

          <div className="mt-6 grid gap-5">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-card sm:rounded-3xl sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary sm:text-xs">
                    Order summary
                  </p>
                  <h2 className="mt-1 font-display text-lg font-semibold sm:text-xl">Your items</h2>
                </div>
                <Link
                  to="/cart"
                  className="shrink-0 rounded-full border border-border px-3 py-2 text-xs font-semibold text-primary transition hover:border-primary/40 hover:bg-primary/5 sm:border-0 sm:px-0 sm:py-0 sm:text-sm sm:font-medium sm:underline sm:underline-offset-4"
                >
                  Edit cart
                </Link>
              </div>
              {loadingCart ? (
                <p className="mt-5 animate-pulse text-sm text-muted-foreground">
                  Loading your cart…
                </p>
              ) : rows.length === 0 ? (
                <div className="mt-5 rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
                  Your cart is empty.{" "}
                  <Link to="/products" className="font-semibold text-primary underline">
                    Browse products
                  </Link>
                </div>
              ) : (
                <div className="mt-3 divide-y divide-border sm:mt-4">
                  {rows.map((row) => {
                    const quantity = Number(row.cart_qty) || 1;
                    const productPrice = Number(
                      row.retailer_price || row.original_price || row.purchase_price || 0,
                    );
                    const isNoBuybackProduct = String(row.product_type ?? "") === "3";
                    const quote = isNoBuybackProduct
                      ? undefined
                      : row.packages?.find((item) => item.package_id === row.cart_package_id);
                    const noPackage =
                      isNoBuybackProduct || !row.cart_package_id || row.cart_package_id === "0";
                    const product = mapApiProduct(row);
                    const imageUrl = product.galleryImages?.[0] || row.model_image_url || "";
                    const packageName =
                      row.package_name || quote?.package_name || "Protection plan";
                    const packageTone =
                      packageName.toLowerCase() === "gold"
                        ? "border-amber-200 bg-[#FFFDF0] text-amber-950"
                        : packageName.toLowerCase() === "platinum"
                          ? "border-slate-700 bg-[#0F172A] text-slate-100"
                          : "border-slate-200 bg-[#F8FAFC] text-slate-800";
                    return (
                      <article key={row.cart_id} className="py-3 first:pt-0 sm:py-4 sm:first:pt-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                          <div className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted sm:size-28 sm:rounded-2xl">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={row.pro_name || "Product"}
                                className="size-full object-contain p-2"
                              />
                            ) : (
                              <PackageCheck className="size-8 text-muted-foreground/60" />
                            )}
                          </div>
                          <div className="min-w-0 w-full flex-1">
                            <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:justify-between sm:gap-2">
                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold leading-snug sm:text-base">
                                  {row.pro_name ||
                                    `${row.brand_name || ""} ${row.model_name || ""} ${row.product_variant || ""}`.trim() ||
                                    "Product"}
                                </h3>
                                {row.product_variant && (
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {row.product_variant}
                                  </p>
                                )}
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Quantity: {quantity}
                                </p>
                              </div>
                              <p className="whitespace-nowrap text-sm font-bold text-primary sm:shrink-0 sm:text-base">
                                {money(productPrice * quantity)}
                              </p>
                            </div>
                            {!noPackage && (
                              <div className={`mt-3 rounded-2xl border p-3 sm:p-4 ${packageTone}`}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="flex size-8 items-center justify-center rounded-full bg-white/70 text-current">
                                      <ShieldCheck className="size-4" />
                                    </span>
                                    <div>
                                      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-75">
                                        Assured Buyback
                                      </p>
                                      <p className="font-semibold">
                                        {packageName} plan · {row.cart_duration} months
                                      </p>
                                    </div>
                                  </div>
                                  <Link
                                    to="/cart"
                                    className="text-xs font-semibold underline underline-offset-4"
                                  >
                                    Edit plan
                                  </Link>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-current/10 pt-3">
                                  <div>
                                    <p className="text-[11px] opacity-75">Package price</p>

                                  </div>
                                  <div className="text-right">
                                    <p className="mt-0.5 text-sm font-bold">
                                      {money(Number(quote?.package_price || 0) * quantity)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
              <div className="mt-3 space-y-2 border-t border-border pt-4 text-sm">
                <p className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Products</span>
                  <b>{totals.products}</b>
                </p>
                {totals.protection > 0 && (
                  <p className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Protection packages</span>
                    <b>{totals.protection}</b>
                  </p>
                )}
                <p className="flex justify-between gap-4 border-t border-border pt-3 text-base">
                  <b>Total payable</b>
                  <b>{totals.total}</b>
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MapPin className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Delivery address
                    </p>
                    <h2 className="mt-1 font-display text-lg font-semibold">
                      {address["name"] || session.name}
                    </h2>
                  </div>
                </div>
                <Link
                  to="/checkout/address"
                  className="text-sm font-medium text-primary underline underline-offset-4"
                >
                  Edit
                </Link>
              </div>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>{[address["address"], cityName, stateName].filter(Boolean).join(", ")}</p>
                <p>
                  {[address["pincode"], address["mobile"] || session.mobile]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {address["email"] && <p>{address["email"]}</p>}
                {address["remarks"] && <p>Remarks: {address["remarks"]}</p>}
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Payment method
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold">
                How would you like to pay?
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    {
                      id: "online",
                      title: "Online payment",
                      detail: "UPI, cards and net banking",
                      Icon: CreditCard,
                    },
                    {
                      id: "cod",
                      title: "Cash on delivery",
                      detail: "Pay when your order arrives",
                      Icon: Banknote,
                    },
                  ] as const
                ).map(({ id, title, detail, Icon }) => (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${method === id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/50"}`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={id}
                      checked={method === id}
                      onChange={() => setMethod(id)}
                      disabled={submitting}
                      className="mt-1 accent-[var(--primary)]"
                    />
                    <Icon
                      className={`mt-0.5 size-5 ${method === id ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span>
                      <b className="text-sm">{title}</b>
                      <small className="mt-1 block text-xs text-muted-foreground">{detail}</small>
                    </span>
                  </label>
                ))}
              </div>
              <Button
                className="mt-5 h-12 w-full rounded-full text-base"
                disabled={loadingCart || submitting || rows.length === 0}
                onClick={() => void submitPayment()}
              >
                {submitting
                  ? method === "online"
                    ? "Preparing payment…"
                    : "Placing order…"
                  : method === "online"
                    ? `Pay ${totals.total} online`
                    : "Place order · Cash on delivery"}
              </Button>
              <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-success" /> Secure checkout
              </p>
            </section>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
