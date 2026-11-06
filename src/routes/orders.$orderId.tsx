import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { DurationScale } from "@/components/shop/duration-scale";
import { getKavachDeviceAgeMonths, getMinimumKavachDuration } from "@/lib/kavach-duration";
import { getPackageTheme } from "@/lib/package-theme";
import { mapApiOrder, type OrderRecord } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { readAuthSession } from "@/services/api/auth";
import {
  getOrderDetails,
  getOrders,
  readOrderDepreciation,
  type OrderApiRecord,
} from "@/services/api/order.service";

export const Route = createFileRoute("/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order details — Kimaat Lock" },
      { name: "description", content: "Review order information and follow your delivery status." },
    ],
  }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const [apiOrder, setApiOrder] = useState<OrderRecord | null>(null);
  const [masterRecord, setMasterRecord] = useState<OrderApiRecord | null>(null);
  const [detailRows, setDetailRows] = useState<OrderApiRecord[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [detailError, setDetailError] = useState("");
  const [loading, setLoading] = useState(true);
  const order = apiOrder ?? emptyOrder(orderId);
  const detailRecord = detailRows[0] ?? {};
  const orderData: OrderApiRecord = { ...detailRecord, ...(masterRecord ?? {}) };
  const rawDeliveryDate = String(
    masterRecord?.delivery_date || detailRecord.delivery_date || orderData.delivery_date || "",
  ).trim();
  const deliveryDate = rawDeliveryDate && !rawDeliveryDate.startsWith("0000-00-00")
    ? formatOrderDate(rawDeliveryDate)
    : "";
  const isKavachOnlyOrder =
    String(orderData.order_type ?? "") === "3" || order.orderType === "Kavach purchase";
  const billingRecord =
    nestedRecord(orderData.billing_details) ??
    nestedRecord(orderData.billing) ??
    nestedRecord(orderData.shipping_address) ??
    orderData;
  const addressRecords = [billingRecord, orderData, detailRecord, masterRecord ?? {}];
  const billingName = firstTextAcross(addressRecords, [
    "delivery_name",
    "delivery_full_name",
    "shipping_full_name",
    "shipping_name",
    "billing_name",
    "bill_name",
    "customer_name",
    "full_name",
    "name",
  ]);
  const billingMobile = firstTextAcross(addressRecords, [
    "delivery_mobile",
    "delivery_phone",
    "shipping_mobile",
    "shipping_phone",
    "billing_mobile",
    "customer_mobile",
    "mobile_number",
    "mobile",
    "phone",
  ]);
  const billingEmail = firstTextAcross(addressRecords, ["delivery_email", "shipping_email", "billing_email", "customer_email", "email"]);
  const billingAddress = firstTextAcross(addressRecords, [
    "delivery_address",
    "shipping_full_address",
    "shipping_address_line",
    "billing_address",
    "customer_address",
    "shipping_address",
    "address_line1",
    "address",
  ]);
  const billingCity = firstTextAcross(addressRecords, ["delivery_city", "shipping_city", "billing_city", "city_name", "city"]);
  const billingState = firstTextAcross(addressRecords, ["delivery_state", "shipping_state", "billing_state", "state_name", "state"]);
  const billingPincode = firstTextAcross(addressRecords, [
    "delivery_pincode",
    "shipping_pincode",
    "billing_pincode",
    "customer_pincode",
    "pincode",
    "postal_code",
  ]);
  const deliveryRemarks = firstTextAcross(addressRecords, [
    "delivery_instructions",
    "delivery_remarks",
    "customer_remark",
    "order_remarks",
    "remarks",
    "remark",
  ]);
  const paymentRecord =
    nestedRecord(orderData.payment_details) ?? nestedRecord(orderData["payment"]) ?? orderData;
  const paymentStatus = firstText(paymentRecord, [
    "payment_status",
    "kavach_razorpay_status",
    "transaction_status",
  ]);
  const paymentMethod = firstText(paymentRecord, ["payment_method", "payment_mode", "method"]);
  const paymentId = firstText(paymentRecord, [
    "razorpay_payment_id",
    "payment_id",
    "transaction_id",
    "kavach_razorpayOrderId",
  ]);
  const orderHistory = readOrderHistory(
    orderData.order_status_history ?? orderData.status_history ?? orderData.order_history,
  );
  const orderStatusCode = String(orderData.order_status ?? "");
  const orderStatusInfo = getOrderStatusInfo(orderStatusCode);
  const displayOrderStatus = orderStatusInfo?.label ?? order.status;
  const visibleHistory = orderHistory.length
    ? orderHistory.map((event) => ({
        ...event,
        tone: getHistoryTone(event.title, event.complete),
      }))
    : buildOrderStatusHistory(orderStatusCode, orderData, order);
  const lastComplete = visibleHistory.filter((event) => event.complete).length - 1;
  const orderTypeCode = String(orderData.order_type ?? "");
  const hasKavachOrder = orderTypeCode === "2" || orderTypeCode === "3" || Boolean(order.kavach);
  const kavachOrderStatus = getKavachOrderStatus(orderData["kavach_order_status"]);
  const kavachPaymentStatus = getKavachPaymentStatus(orderData.kavach_razorpay_status);
  const showProductLineAmounts = ["1", "2"].includes(String(orderData.order_type ?? "")) ||
    ["Product purchase", "Product + Kavach"].includes(order.orderType);
  const masterProducts = readOrderProductArray(
    masterRecord?.products ??
      masterRecord?.product_array ??
      masterRecord?.product_arr ??
      masterRecord?.order_products,
  );
  // The master order endpoint includes every purchased item. Prefer that array
  // if the detail endpoint returns a shorter set, so a partial detail response
  // cannot hide products from a multi-item order.
  const detailRowsHaveLineAmounts = detailRows.some((item) =>
    item.qty !== undefined || item.product_total !== undefined || item.package_total !== undefined || item.line_total !== undefined,
  );
  const orderProducts: OrderApiRecord[] = detailRowsHaveLineAmounts
    ? detailRows
    : masterProducts.length > detailRows.length
    ? masterProducts
    : detailRows.length
      ? detailRows
      : masterProducts.length
        ? masterProducts
        : [
          {
            product_id: "",
            brand_name: order.deviceName ?? "",
            model_name: "",
            product_variant: order.variant ?? "",
            image: order.image ?? "",
            package_name: order.kavach?.packageName ?? "",
            package_price: order.kavach?.packagePrice ?? "",
            buyback_amount: order.kavach?.buybackAmount ?? "",
            duration: order.kavach?.duration ?? "",
          },
        ];
  const detailProductTotal = sumOrderAmounts(orderProducts, "product_total");
  const detailPackageTotal = sumOrderAmounts(orderProducts, "package_total");
  const detailLineTotal = sumOrderAmounts(orderProducts, "line_total");

  useEffect(() => {
    setSessionId(readAuthSession()?.accountId ?? "");
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setDetailError("");
    const request = {
      from_date: dateOffset(-15),
      to_date: dateOffset(0),
      filter_user: sessionId,
      kavach_order_id: orderId,
    };
    void Promise.all([getOrders(request), getOrderDetails(request)])
      .then(([masterRows, productRows]) => {
        if (!active) return;
        setDetailRows(productRows);
        const master =
          masterRows.find(
            (item) => String(item.kavach_order_id ?? item.order_id ?? "") === orderId,
          ) ?? masterRows[0];
        const detail =
          productRows.find(
            (item) => String(item.kavach_order_id ?? item.order_id ?? "") === orderId,
          ) ?? productRows[0];
        if (master) setMasterRecord(master);
        const record = master ?? detail;
        if (record) {
          const mapped = mapApiOrder(record);
          setApiOrder(mapped);
        }
      })
      .catch((reason: unknown) => {
        if (active)
          setDetailError(
            reason instanceof Error ? reason.message : "Could not load order details.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sessionId, orderId]);

  if (loading) {
    return (
      <PageShell>
        <main className="mx-auto min-h-[55vh] max-w-[900px] px-4 py-12 md:px-8">
          <div
            className="h-56 animate-pulse rounded-2xl bg-muted"
            aria-label="Loading order details"
          />
        </main>
      </PageShell>
    );
  }

  if (!apiOrder) {
    return (
      <PageShell>
        <main className="mx-auto flex min-h-[55vh] max-w-[900px] flex-col items-center justify-center px-4 py-16 text-center">
          <PackageCheck className="size-10 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl">No data found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Order details are not available right now.
          </p>
          <Button asChild variant="outline" className="mt-5 rounded-full">
            <Link to="/orders">Back to orders</Link>
          </Button>
        </main>
      </PageShell>
    );
  }

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
        <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-primary">
              Order details
            </p>
            <h1 className="mt-0.5 break-words font-display text-2xl sm:text-3xl">Order {order.id}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" />
                Placed {order.placed}
              </span>
              {deliveryDate && (
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                  <CalendarDays className="size-3.5" />
                  Delivery date {deliveryDate}
                </span>
              )}
              <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground">
                {order.orderType}
              </span>
            </div>
          </div>
          <div className="min-w-0 border-t border-border pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 sm:text-right">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                orderStatusInfo
                  ? statusToneClasses(orderStatusInfo.tone)
                  : /deliver|paid|complete/i.test(order.status)
                    ? "bg-success-soft text-success"
                    : "bg-primary-soft text-primary",
              )}
            >
              <span className="size-2 rounded-full bg-current" />
              {displayOrderStatus}
            </span>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:justify-end">
              {(paymentMethod || paymentId) && (
                <span className="text-muted-foreground">
                  Payment: <span className="font-semibold text-foreground">{paymentMethod || "Online"}</span>
                </span>
              )}
              {paymentId && (
                <span className="min-w-0 break-all text-muted-foreground">
                  Payment ID: <span className="font-semibold text-foreground">{paymentId}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        {detailError && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            {detailError}{" "}
            {apiOrder
              ? "Showing the order information already available."
              : "Showing the saved order view."}
          </p>
        )}

        <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_.75fr]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl">
                  Products{" "}
                  <span className="ml-1 text-base font-medium text-muted-foreground">
                    ({orderProducts.length})
                  </span>
                </h2>
              </div>
              <div className="mt-5 space-y-4">
                {orderProducts.map((item, index) => {
                  const brandedModel = [item.brand_name, item.model_name]
                    .map((part) => String(part ?? "").trim())
                    .filter(Boolean)
                    .join(" ");
                  const itemName = item.model_name
                    ? brandedModel
                    : String(
                        item.pro_name ??
                          item.product_name ??
                          item.product_variant ??
                          brandedModel ??
                          order.deviceName ??
                          "Order item",
                      );
                  const inputId = `order-kavach-duration-${String(item.kavach_order_detail_id ?? item.product_id ?? index)}`;
                  const imageUrl = String(
                    item.product_image_url ?? item.model_image_url ?? item.image ?? "",
                  );
                  const itemPrice = item.purchase_price ?? item.original_price ?? "";
                  const itemQty = item.qty;
                  const packageName = String(item.package_name ?? "").trim();
                  const hasPurchasedKavach =
                    Boolean(packageName) && String(item.package_id ?? "0") !== "0";
                  const hasLineTotals = showProductLineAmounts && (
                    itemQty !== undefined ||
                    item.product_total !== undefined ||
                    item.package_total !== undefined ||
                    item.line_total !== undefined
                  );
                  const showPackageTotal =
                    String(orderData.order_type ?? "") === "2" || hasPurchasedKavach;
                  const itemInvoiceDate = String(
                    item.invoice_date ?? order.kavach?.purchaseDate ?? "",
                  );
                  const itemMinimumDuration = getMinimumKavachDuration(itemInvoiceDate);
                  const itemDeviceEligible = getKavachDeviceAgeMonths(itemInvoiceDate) <= 24;
                  const itemSchedule = readOrderDepreciation(
                    item.depreciation_json as OrderApiRecord["depreciation_json"],
                  );
                  const itemProductDetails =
                    readProductDetails(item.product_details_json) ??
                    readProductDetails(orderData.product_details_json);
                  return (
                    <article
                      key={String(item.kavach_order_detail_id ?? item.product_id ?? index)}
                      className=""
                    >
                      <div className="flex min-w-0 gap-3">
                        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted sm:size-24">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={itemName}
                              className="size-full object-contain p-1"
                            />
                          ) : (
                            <PackageCheck className="size-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold">{itemName}</h3>
                          {item.product_variant && String(item.product_variant) !== itemName && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {String(item.product_variant)}
                            </p>
                          )}
                          {/* <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {item.category_name && (
                              <span>Category: {String(item.category_name)}</span>
                            )}
                            {item.product_id && <span>Product ID: {String(item.product_id)}</span>}
                          </div> */}
                          {hasPositiveAmount(itemPrice) && (
                            <p className="mt-2 text-sm font-semibold">
                              Unit price: {formatOrderMoney(itemPrice)}
                            </p>
                          )}
                        </div>
                      </div>
                      {hasLineTotals && (
                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-muted/40 px-4 py-3 sm:grid-cols-4">
                          {itemQty !== undefined && (
                            <OrderProductDetail label="Quantity" value={String(itemQty)} />
                          )}
                          {item.product_total !== undefined && item.product_total !== "" && (
                            <OrderProductDetail label="Product total" value={formatOrderMoney(item.product_total)} />
                          )}
                          {showPackageTotal && item.package_total !== undefined && item.package_total !== "" && (
                            <OrderProductDetail label="Kavach total" value={formatOrderMoney(item.package_total)} />
                          )}
                          {item.line_total !== undefined && item.line_total !== "" && (
                            <OrderProductDetail label="Line total" value={formatOrderMoney(item.line_total)} />
                          )}
                        </div>
                      )}
                      {isKavachOnlyOrder && itemProductDetails && (
                        <OldPhoneDetails productDetails={itemProductDetails} />
                      )}
                      {hasPurchasedKavach && (
                        <KavachOrderPlan
                          planName={packageName}
                          inputId={inputId}
                          initialDuration={
                            Number(item.duration ?? order.kavach?.duration ?? 1) || 1
                          }
                          minimumDuration={itemMinimumDuration}
                          deviceEligible={itemDeviceEligible}
                          schedule={
                            itemSchedule.length ? itemSchedule : (order.kavach?.schedule ?? [])
                          }
                          initialBuyback={String(
                            item.buyback_amount ?? order.kavach?.buybackAmount ?? "",
                          )}
                          initialPackagePrice={String(
                            item.package_price ?? order.kavach?.packagePrice ?? "",
                          )}
                          startDate={formatOrderDate(item.start_date ?? orderData.start_date)}
                          expiryDate={formatOrderDate(item.expiry_date ?? orderData.expiry_date)}
                          productDetails={itemProductDetails}
                        />
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
          <aside className="space-y-5">
            {!isKavachOnlyOrder && (
              <>
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl">Order status history</h2>
                <Truck className="size-5 text-primary" />
              </div>
              <div id="timeline" className="mt-6">
                {visibleHistory.map((event, index, events) => (
                  <div
                    key={`${event.title}-${index}`}
                    className="relative flex gap-4 pb-7 last:pb-0"
                  >
                    <div className="relative flex w-8 shrink-0 justify-center">
                      <span
                        className={cn(
                          "z-10 grid size-8 place-items-center rounded-full",
                          event.tone === "danger"
                            ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
                            : event.tone === "success"
                              ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                              : event.tone === "active"
                                ? "bg-sky-100 text-sky-800 ring-1 ring-sky-200"
                                : "border-2 border-border bg-background text-muted-foreground",
                        )}
                      >
                        {event.tone === "danger" ? (
                          <X className="size-4" />
                        ) : event.complete ? (
                          <Check className="size-4" />
                        ) : (
                          <Clock3 className="size-4" />
                        )}
                      </span>
                      {index < events.length - 1 && (
                        <span
                          className={cn(
                            "absolute top-8 h-[calc(100%-8px)] w-0.5",
                            index < lastComplete ? "bg-emerald-300" : "bg-border",
                          )}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3
                          className={cn(
                            "text-sm font-semibold",
                            event.tone === "danger"
                              ? "text-rose-700"
                              : event.tone === "active"
                                ? "text-sky-800"
                                : !event.complete && "text-muted-foreground",
                          )}
                        >
                          {event.title}
                        </h3>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {orderStatusInfo && (
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  <span className="text-xs font-medium text-muted-foreground">Current order status</span>
                  <StatusBadge label={orderStatusInfo.label} tone={orderStatusInfo.tone} />
                </div>
              )}
             
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">
                    Delivery details
                  </p>
                  <h2 className="mt-1 font-display text-xl">Shipping address</h2>
                </div>
                <ReceiptText className="size-5 text-primary" />
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                <InfoRow label="Full name" value={billingName} />
                <InfoRow label="Mobile number" value={billingMobile} />
                <InfoRow label="Email" value={billingEmail} />
                <InfoRow label="Address" value={billingAddress || order.address} />
                <InfoRow label="City" value={billingCity} />
                <InfoRow label="State" value={billingState} />
                <InfoRow label="Pincode" value={billingPincode} />
                <InfoRow label="Remarks (Delivery instructions)" value={deliveryRemarks} />
              </div>
              {!billingName &&
                !billingMobile &&
                !billingEmail &&
                !billingAddress &&
                !billingCity &&
                !billingState &&
                !billingPincode &&
                !deliveryRemarks && (
                  <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
                    No delivery details found
                  </p>
                )}
            </section>
              </>
            )}
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">
                Order total
              </p>
              <h2 className="mt-1 font-display text-xl">Amount summary</h2>
              <div className="mt-4 space-y-3 text-sm">
                <AmountRow label="Products" value={detailProductTotal ?? orderData.purchase_price} />
                <AmountRow label="Kavach" value={detailPackageTotal ?? orderData.package_price} />
                <AmountRow
                  label="Discount"
                  value={orderData.total_discount_price ?? orderData.kavach_discount}
                  prefix="−"
                />
                <AmountRow label="Delivery" value={orderData.kavach_delivery_charges} />
                <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="font-semibold">Payable total</span>
                  <span className="text-xl font-bold tabular-nums text-primary">
                    {formatOrderMoney(
                      orderData.payable_amount ??
                        orderData.kavach_payable ??
                        detailLineTotal ??
                        order.total.replace(/[^0-9.]/g, ""),
                    )}
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </PageShell>
  );
}

function KavachOrderPlan({
  planName,
  inputId,
  initialDuration,
  minimumDuration,
  deviceEligible,
  schedule,
  initialBuyback,
  initialPackagePrice,
  startDate,
  expiryDate,
  productDetails,
}: {
  planName: string;
  inputId: string;
  initialDuration: number;
  minimumDuration: number;
  deviceEligible: boolean;
  schedule: NonNullable<OrderRecord["kavach"]>["schedule"];
  initialBuyback?: string;
  initialPackagePrice?: string;
  startDate?: string;
  expiryDate?: string;
  productDetails?: Record<string, unknown>;
}) {
  const [duration, setDuration] = useState(initialDuration);
  const colors = orderPlanColors(planName);
  const activeSurface = colors.surface;
  const availableMonths = [
    ...new Set((schedule ?? []).map((row) => Number(row.month_number)).filter(Number.isFinite)),
  ].filter((month) => month >= minimumDuration && month >= 1 && month <= 24)
    .sort((a, b) => a - b);
  const monthKey = availableMonths.join(",");
  const sliderMin = availableMonths[0] ?? minimumDuration;
  const sliderMax = availableMonths.at(-1) ?? 24;
  useEffect(() => {
    if (availableMonths.length && !availableMonths.includes(duration)) {
      const closest = availableMonths.reduce(
        (best, month) => (Math.abs(month - duration) < Math.abs(best - duration) ? month : best),
        availableMonths[0]!,
      );
      setDuration(closest);
    } else if (!availableMonths.length) {
      setDuration(Math.min(24, Math.max(minimumDuration, initialDuration)));
    }
    // monthKey tracks schedule values without depending on a recreated array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, minimumDuration, initialDuration]);
  const currentQuote = schedule?.reduce<(typeof schedule)[number] | undefined>((closest, row) => {
    if (Number(row.month_number) === duration) return row;
    if (
      !closest ||
      Math.abs(Number(row.month_number) - duration) <
        Math.abs(Number(closest.month_number) - duration)
    )
      return row;
    return closest;
  }, undefined);
  const buybackAmount = currentQuote?.buyback_amount ?? initialBuyback;
  const packagePrice = currentQuote?.package_price ?? initialPackagePrice;

  return (
    <section className="mt-4 w-full min-w-0 ">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          {/* <p className="text-xs font-semibold uppercase tracking-[.15em] text-primary">
            Purchased Kavach
          </p> */}
          <h2 className="mt-1 font-display text-2xl sm:text-3xl">Your protection</h2>
        </div>
        {/* <span className="text-xs font-medium text-muted-foreground">
          This order includes one package
        </span> */}
      </div>
      <div className="relative mt-4 grid min-h-[60px] grid-cols-1 sm:min-h-[72px]">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-full z-0 h-4 w-full overflow-visible"
          viewBox="0 0 100 16"
          preserveAspectRatio="none"
        >
          <path d="M 0 0 C 0 8 0 8 0 16 L 100 16 C 100 8 100 8 100 0 Z" fill={activeSurface} />
        </svg>
        <div
          aria-current="true"
          className="package-active-tab relative z-20 flex min-h-[60px] items-center justify-center rounded-xl border-2 px-3 py-3 text-center sm:min-h-[72px] sm:rounded-2xl sm:px-4"
          style={{
            borderColor: "transparent",
            backgroundColor: activeSurface,
            backgroundImage: colors.gradient,
            color: colors.foreground,
            borderRadius: "1.25rem 1.25rem 0 0",
            boxShadow: `0 7px 14px color-mix(in srgb, ${activeSurface} 72%, transparent)`,
          }}
        >
          <span className="font-display text-sm font-semibold sm:text-base">{planName}</span>
          <span className="ml-2 rounded-full border border-current/15 bg-background/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            Purchased
          </span>
          <ShieldCheck className="absolute right-3 top-3 size-4" style={{ color: colors.accent }} />
        </div>
      </div>
      <div
        className="relative z-[1] mt-4 rounded-2xl border border-border p-4 sm:p-5"
        style={{
          backgroundColor: activeSurface,
          backgroundImage: colors.gradient,
          color: colors.foreground,
          borderRadius: "0 0 10px 10px",
          borderColor: "transparent",
        }}
      >
      
        {productDetails && <OldPhoneDetails productDetails={productDetails} />}
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-[.14em] sm:text-sm"
            style={{ color: colors.accent }}
          >
            Choose your duration
          </label>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background tabular-nums sm:text-sm">
            {duration} {duration === 1 ? "month" : "months"}
          </span>
        </div>
        {availableMonths.length > 1 ? (
          <>
            <input
              id={inputId}
              type="range"
              min="0"
              max={availableMonths.length - 1}
              step="1"
              disabled={!deviceEligible}
              value={Math.max(0, availableMonths.indexOf(duration))}
              onChange={(event) =>
                setDuration(availableMonths[Number(event.target.value)] ?? sliderMin)
              }
              aria-label={`Choose duration from ${sliderMin} to ${sliderMax} months`}
              className="mt-4 block h-8 w-full cursor-pointer touch-pan-x accent-primary"
              style={{ accentColor: colors.accent }}
            />
            <DurationScale
              months={availableMonths}
              selectedMonth={duration}
              accentColor={colors.accent}
              textColor={colors.foreground}
              className="mt-1"
            />
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-current/10 px-3 py-3 text-sm">
            {availableMonths.length
              ? `Month ${availableMonths[0]} is available in this schedule`
              : "Duration schedule is not available"}
          </div>
        )}
        {/* {deviceEligible ? (
          <p className="mt-2 text-[11px] leading-relaxed opacity-75">
            {availableMonths.length
              ? `Showing your purchased ${planName} plan values from the order depreciation schedule.`
              : `Based on your purchase date, the earliest available duration is month ${minimumDuration}.`}
          </p>
        ) : (
          <p role="alert" className="mt-2 text-xs font-semibold text-red-700">
            Sorry, Kavach is available only for devices up to 24 months old.
          </p>
        )} */}
        <div className="mt-4 grid min-w-0 gap-2 border-t border-current/10 pt-4 text-sm font-medium leading-relaxed sm:text-base">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            <strong
              className="text-2xl font-bold leading-tight tabular-nums sm:text-3xl"
              style={{ color: colors.accent }}
            >
              {formatRupees(buybackAmount)}
            </strong>
            <span className="text-xs font-medium text-current sm:text-sm">
              Assured buyback amount
            </span>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-3 border-t border-current/10 pt-3">
            <span className="text-xs opacity-80 sm:text-sm">Package price</span>
            <span className="text-lg font-semibold tabular-nums sm:text-2xl">
              {formatRupees(packagePrice)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatRupees(value?: string | number) {
  if (value === undefined || value === null || value === "") return "—";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : "—";
}

function formatOrderMoney(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return "—";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : "—";
}

function hasPositiveAmount(value: unknown) {
  if (value === undefined || value === null || value === "") return false;
  const amount = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(amount) && amount > 0;
}

function sumOrderAmounts(rows: OrderApiRecord[], field: "product_total" | "package_total" | "line_total") {
  let total = 0;
  let found = false;
  for (const row of rows) {
    const value = row[field];
    if (value === undefined || value === null || value === "") continue;
    const amount = Number(value);
    if (!Number.isFinite(amount)) continue;
    total += amount;
    found = true;
  }
  return found ? total : undefined;
}

function formatOrderDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  const dateValue = value.trim().slice(0, 10);
  const date = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(
        date,
      );
}

function formatPaymentStatus(value: unknown) {
  const status = String(value ?? "").trim();
  if (!status) return "Not provided";
  if (status === "2") return "Paid";
  if (status === "3") return "Failed";
  if (status === "1") return "Pending";
  if (status === "0") return "Not initiated";
  return status;
}

function nestedRecord(value: unknown): OrderApiRecord | undefined {
  let parsed = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return undefined;
    }
  }
  if (Array.isArray(parsed)) parsed = parsed[0];
  return parsed && typeof parsed === "object" ? (parsed as OrderApiRecord) : undefined;
}

function readProductDetails(value: unknown): Record<string, unknown> | undefined {
  let parsed = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return undefined;
    }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;
  const details = parsed as Record<string, unknown>;
  return Object.keys(details).length ? details : undefined;
}

function firstText(record: OrderApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if ((typeof value === "string" || typeof value === "number") && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
}

function firstTextAcross(records: OrderApiRecord[], keys: string[]) {
  for (const record of records) {
    const value = firstText(record, keys);
    if (value) return value;
  }
  return "";
}

type StatusTone = "success" | "active" | "danger" | "muted";
type OrderStatusEvent = OrderRecord["timeline"][number] & { tone: StatusTone };
type StatusInfo = { label: string; tone: StatusTone };

function getOrderStatusInfo(value: unknown): StatusInfo | null {
  const labels: Record<string, StatusInfo> = {
    "1": { label: "Pending", tone: "active" },
    "2": { label: "Confirmed", tone: "active" },
    "3": { label: "Dispatched", tone: "active" },
    "4": { label: "Delivered", tone: "success" },
    "5": { label: "Rejected", tone: "danger" },
    "6": { label: "Canceled", tone: "danger" },
  };
  return labels[String(value ?? "")] ?? null;
}

function getKavachOrderStatus(value: unknown): StatusInfo {
  const labels: Record<string, StatusInfo> = {
    "1": { label: "Active", tone: "active" },
    "2": { label: "Paid", tone: "success" },
    "3": { label: "Cancelled", tone: "danger" },
  };
  return labels[String(value ?? "")] ?? { label: "Not available", tone: "muted" };
}

function getKavachPaymentStatus(value: unknown): StatusInfo {
  const labels: Record<string, StatusInfo> = {
    "0": { label: "Not initiated", tone: "muted" },
    "1": { label: "Pending", tone: "active" },
    "2": { label: "Success", tone: "success" },
    "3": { label: "Failed", tone: "danger" },
  };
  return labels[String(value ?? "")] ?? { label: "Not available", tone: "muted" };
}

function getHistoryTone(title: string, complete: boolean): StatusTone {
  if (/reject|cancel|fail/i.test(title)) return "danger";
  if (/deliver|paid|success|complete|confirm/i.test(title)) return "success";
  return complete ? "success" : "active";
}

function buildOrderStatusHistory(
  currentStatus: string,
  orderData: OrderApiRecord,
  order: OrderRecord,
): OrderStatusEvent[] {
  const steps = ["Pending", "Confirmed", "Dispatched", "Delivered"];
  const terminal = currentStatus === "5" ? "Rejected" : currentStatus === "6" ? "Canceled" : "";
  const currentIndex = terminal ? 2 : Number(currentStatus) - 1;
  const statusDate = formatOrderDate(
    firstText(orderData, ["order_status_date", "status_updated_at", "updated_at", "c_date"]) ||
      String(orderData.purchase_date ?? orderData.start_date ?? ""),
  );
  const labels = terminal ? [...steps.slice(0, 2), terminal] : steps;
  if (currentIndex < 0 || currentIndex >= labels.length) {
    return [{
      title: order.status || "Order received",
      description: "Current order status",
      date: statusDate || order.placed,
      complete: true,
      tone: "active",
    }];
  }
  return labels.map((title, index) => {
    const isTerminal = Boolean(terminal && index === labels.length - 1);
    const isCurrent = index === currentIndex;
    const complete = index < currentIndex || (isCurrent && currentStatus === "4");
    const tone: StatusTone = isTerminal ? "danger" : complete ? "success" : isCurrent ? "active" : "muted";
    const descriptions: Record<string, string> = {
      Pending: "Your order has been received.",
      Confirmed: "Your order has been confirmed.",
      Dispatched: "Your order has been dispatched.",
      Delivered: "Your order has been delivered.",
      Rejected: "This order was rejected.",
      Canceled: "This order was canceled.",
    };
    return {
      title,
      description: descriptions[title] ?? "Order status",
      date: isCurrent || isTerminal ? statusDate || order.placed : "",
      complete,
      tone,
    };
  });
}

function StatusBadge({ label, tone }: StatusInfo) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", statusToneClasses(tone))}>
      {label}
    </span>
  );
}

function StatusSummary({ label, status }: { label: string; status: StatusInfo }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2">
      <span className="truncate text-xs text-muted-foreground">{label}</span>
      <StatusBadge {...status} />
    </div>
  );
}

function statusToneClasses(tone: StatusTone) {
  switch (tone) {
    case "success": return "bg-emerald-100 text-emerald-800";
    case "active": return "bg-sky-100 text-sky-800";
    case "danger": return "bg-rose-100 text-rose-800";
    default: return "bg-slate-100 text-slate-600";
  }
}

function readOrderHistory(value: unknown): OrderRecord["timeline"] {
  let parsed = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .flatMap((entry, index) => {
      if (!entry || typeof entry !== "object") return [];
      const item = entry as Record<string, unknown>;
      const title = String(
        item["status_text"] ?? item["order_status_text"] ?? item["status"] ?? item["title"] ?? "",
      ).trim();
      if (!title) return [];
      const description = String(
        item["description"] ?? item["remark"] ?? item["notes"] ?? "",
      ).trim();
      const rawDate = String(
        item["updated_at"] ?? item["created_at"] ?? item["c_date"] ?? item["date"] ?? "",
      ).trim();
      const parsedDate = rawDate ? new Date(rawDate.replace(" ", "T")) : null;
      const date =
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(
              parsedDate,
            )
          : rawDate || "—";
      const complete =
        item["complete"] === false || String(item["complete"]) === "0" ? false : true;
      return [
        { title, description: description || "Order status updated.", date, complete, key: index },
      ];
    })
    .map(({ key: _key, ...event }) => event);
}

function readOrderProductArray(value: unknown): OrderApiRecord[] {
  let parsed = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is OrderApiRecord => Boolean(item) && typeof item === "object");
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value?.trim()) return null;
  return (
    <div className="min-w-0 rounded-lg bg-muted/40 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words font-medium">{value}</p>
    </div>
  );
}

function OrderProductDetail({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function OldPhoneDetails({ productDetails }: { productDetails: Record<string, unknown> }) {
  const productName = [productDetails.brand_name, productDetails.model_name]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(" ");
  const productVariant = String(productDetails.product_variant ?? "").trim();
  return (
    <div className="mt-4 rounded-xl border border-border bg-muted/30 px-4 py-3 text-foreground">
      <h3 className="text-sm font-semibold">Customer Product Details</h3>
      {(productName || productVariant) && (
        <div className="mt-2">
          {productName && <p className="font-semibold">{productName}</p>}
          {productVariant && <p className="text-sm text-muted-foreground">{productVariant}</p>}
        </div>
      )}
      <div className="mt-3 grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {productDetails.invoice_date && (
          <OrderProductDetail label="Purchase date" value={formatOrderDate(String(productDetails.invoice_date))} />
        )}
        {hasPositiveAmount(productDetails.purchase_price) && (
          <OrderProductDetail label="Final purchase amount" value={formatOrderMoney(productDetails.purchase_price)} />
        )}
        {productDetails.invoice_number && (
          <OrderProductDetail label="Invoice number" value={String(productDetails.invoice_number)} />
        )}
        {productDetails.imei_number && (
          <OrderProductDetail label="IMEI number" value={String(productDetails.imei_number)} />
        )}
        {productDetails.serial_number && (
          <OrderProductDetail label="Serial number" value={String(productDetails.serial_number)} />
        )}
        {productDetails.remarks && (
          <OrderProductDetail label="Remarks" value={String(productDetails.remarks)} />
        )}
      </div>
    </div>
  );
}

function DetailLine({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value?: string;
  emphasis?: boolean;
}) {
  if (!value?.trim()) return null;
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "break-all text-right text-sm",
          emphasis ? "font-semibold text-foreground" : "font-medium",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function AmountRow({
  label,
  value,
  prefix = "",
}: {
  label: string;
  value?: unknown;
  prefix?: string;
}) {
  if (value === undefined || value === null || value === "") return null;
  const amount = Number(String(value).replace(/[^\d.-]/g, ""));
  if (Number.isFinite(amount) && amount === 0) return null;
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">
        {prefix}
        {formatOrderMoney(value)}
      </span>
    </div>
  );
}

function dateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function emptyOrder(id: string): OrderRecord {
  return {
    id,
    placed: "—",
    total: "—",
    status: "Order details",
    itemSlug: "",
    payment: "—",
    orderType: "Order",
    address: "",
    timeline: [
      {
        title: "Order details",
        description: "Order information will appear here when available.",
        date: "—",
        complete: true,
      },
    ],
  };
}

function orderPlanColors(name: string) {
  const theme = getPackageTheme(name);
  return {
    surface: theme.surface,
    foreground: theme.foreground,
    accent: theme.accent,
    gradient: theme.gradient,
  };
}
