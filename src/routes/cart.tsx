import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Minus, PackageX, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageShell, rememberAuthReturnPath } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { DurationScale } from "@/components/shop/duration-scale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { mapApiProduct } from "@/lib/catalog";
import { getPackageSurface, getPackageTheme } from "@/lib/package-theme";
import { getDurationMilestones } from "@/lib/kavach-duration";
import { cn } from "@/lib/utils";
import { readAuthSession } from "@/services/api/auth";
import {
  addCartItem,
  listCart,
  removeCartPackage,
  removeCartProduct,
  updateCartQuantity,
  type CartRecord,
  type CartSummary,
} from "@/services/api/cart.service";
import type { ProductPackageQuote } from "@/services/api/models";
import { getProducts } from "@/services/api/product.service";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Kimaat Lock" },
      { name: "description", content: "Review products and protection plans in your cart." },
    ],
  }),
  component: CartPage,
});

type CartRow = CartRecord & { packages: ProductPackageQuote[] };
type StagedPlan = { packageId: string; duration: number; quotes: ProductPackageQuote[] };
type RemoveTarget = { row: CartRow; kind: "package" | "product" };

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function money(value: string | number | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) && amount > 0
    ? `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : "—";
}

function summaryMoney(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function firstPositiveAmount(...values: Array<string | number | undefined>) {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;
    const amount = Number(value);
    if (Number.isFinite(amount) && amount > 0) return amount;
  }
  return 0;
}

function findSelectedQuote(row: CartRow, staged?: StagedPlan) {
  const packageId = staged?.packageId ?? row.cart_package_id;
  return (staged?.quotes ?? row.packages).find((quote) => quote.package_id === packageId);
}

function CartPage() {
  const [session, setSession] = useState<ReturnType<typeof readAuthSession>>(null);
  const [rows, setRows] = useState<CartRow[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [staged, setStaged] = useState<Record<string, StagedPlan>>({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);

  useEffect(() => {
    setSession(readAuthSession());
  }, []);

  const refreshCart = useCallback(async (silent = false) => {
    if (!session?.accountId) {
      setRows([]);
      setSummary(null);
      if (!silent) setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    setError("");
    try {
      const response = await listCart({ user_id: session.accountId });
      setSummary(response.summary ?? null);
      if (String(response.status) !== "1" && !response.error) {
        setRows([]);
        return;
      }
      if (String(response.status) !== "1")
        throw new Error(response.error || "Could not load your cart.");
      const baseRows = (response.result ?? []) as CartRecord[];
      const enriched = await Promise.all(
        baseRows.map(async (row) => {
          if (String(row.product_type ?? "") === "3") {
            return { ...row, cart_package_id: "0", cart_duration: "0", package_name: "", package_percentage: "0", packages: [] } as CartRow;
          }
          const price = row.retailer_price || row.purchase_price || row.original_price || "0";
          const duration = Math.max(1, Number(row.cart_duration) || 1);
          try {
            const calculated = await getProducts({
              product_id: row.cart_product_id || row.product_id,
              brand_id: row.brand_id || "",
              model_id: row.model_id || "",
              invoice_date: row.invoice_date || today(),
              purchase_price: price,
              duration: String(duration),
              package_id: "",
            });
            const matching = calculated.find(
              (item) => item.product_id === (row.cart_product_id || row.product_id),
            );
            const productType = row.product_type ?? matching?.product_type;
            if (String(productType ?? "") === "3") {
              return {
                ...row,
                product_type: productType,
                cart_package_id: "0",
                cart_duration: "0",
                package_name: "",
                package_percentage: "0",
                packages: [],
              } as CartRow;
            }
            return { ...row, product_type: productType, packages: matching?.packages ?? row.packages ?? [] } as CartRow;
          } catch {
            return { ...row, packages: row.packages ?? [] } as CartRow;
          }
        }),
      );
      setRows(enriched);
      setStaged({});
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load your cart.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [session?.accountId]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  async function changeQuantity(row: CartRow, quantity: number) {
    if (quantity < 1) return removeItem(row);
    setWorkingId(row.cart_id);
    setError("");
    const previousQuantity = row.cart_qty;
    setRows((current) =>
      current.map((item) =>
        item.cart_id === row.cart_id ? { ...item, cart_qty: String(quantity) } : item,
      ),
    );
    setSummary(null);
    try {
      await updateCartQuantity(row.cart_id, quantity);
    } catch (reason) {
      setRows((current) =>
        current.map((item) =>
          item.cart_id === row.cart_id ? { ...item, cart_qty: previousQuantity } : item,
        ),
      );
      setError(reason instanceof Error ? reason.message : "Could not update quantity.");
    } finally {
      setWorkingId("");
    }
  }

  async function removeItem(row: CartRow) {
    if (!session?.accountId) return;
    setWorkingId(row.cart_id);
    setError("");
    try {
      await removeCartProduct(row.cart_id, session.accountId);
      setRows((current) => current.filter((item) => item.cart_id !== row.cart_id));
      setStaged((current) => {
        const next = { ...current };
        delete next[row.cart_id];
        return next;
      });
      setNotice("Product and its protection package were removed from your cart.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not remove this item.");
    } finally {
      setWorkingId("");
    }
  }

  async function removePackage(row: CartRow) {
    if (!session?.accountId || !row.cart_package_id || row.cart_package_id === "0") return;
    setWorkingId(row.cart_id);
    setError("");
    try {
      await removeCartPackage({
        cart_id: row.cart_id,
        package_id: row.cart_package_id,
        user_id: session.accountId,
        product_id: row.cart_product_id || row.product_id,
        qty: Number(row.cart_qty) || 1,
      });
      await refreshCart();
      setNotice("Protection package removed. The product is still in your cart.");
    } catch (reason) {
      await refreshCart();
      setError(
        reason instanceof Error ? reason.message : "Could not remove the protection package.",
      );
    } finally {
      setWorkingId("");
    }
  }

  function changeDuration(row: CartRow, duration: number) {
    const existing = staged[row.cart_id] ?? {
      packageId: row.cart_package_id,
      duration: Number(row.cart_duration) || 1,
      quotes: row.packages,
    };
    setStaged((current) => ({ ...current, [row.cart_id]: { ...existing, duration } }));
    if (!session?.accountId) return;
    setWorkingId(row.cart_id);
    const price = row.retailer_price || row.purchase_price || row.original_price || "0";
    void getProducts({
      product_id: row.cart_product_id || row.product_id,
      brand_id: row.brand_id || "",
      model_id: row.model_id || "",
      invoice_date: row.invoice_date || today(),
      purchase_price: price,
      duration: String(duration),
      package_id: "",
    })
      .then((response) => {
        const updatedRow = response.find(
          (item) => item.product_id === (row.cart_product_id || row.product_id),
        );
        setStaged((current) => {
          const currentPlan = current[row.cart_id];
          if (!currentPlan || currentPlan.duration !== duration) return current;
          return {
            ...current,
            [row.cart_id]: { ...currentPlan, quotes: updatedRow?.packages ?? [] },
          };
        });
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : "Could not update the protection estimate.",
        ),
      )
      .finally(() => setWorkingId((current) => (current === row.cart_id ? "" : current)));
  }

  async function savePlan(row: CartRow) {
    const plan = staged[row.cart_id];
    if (!plan || !session?.accountId) return;
    setWorkingId(row.cart_id);
    setError("");
    setNotice("");
    try {
      // The endpoint only updates quantity. Add the chosen combination first, then remove the old row.
      const added = await addCartItem({
        user_id: session.accountId,
        product_id: row.cart_product_id || row.product_id,
        package_id: plan.packageId || "0",
        duration: plan.packageId === "0" ? "0" : String(plan.duration),
        qty: Number(row.cart_qty) || 1,
      });
      await removeCartProduct(row.cart_id, session.accountId);
      const newCartId = String(added.cart_id ?? "");
      if (!newCartId) {
        await refreshCart(true);
      } else {
        const selectedQuote = plan.quotes.find((quote) => quote.package_id === plan.packageId);
        const savedRow: CartRow = {
          ...row,
          cart_id: newCartId,
          cart_package_id: plan.packageId || "0",
          cart_duration: plan.packageId === "0" ? "0" : String(plan.duration),
          package_name: selectedQuote?.package_name ?? "",
          package_percentage: String(selectedQuote?.package_percentage ?? "0"),
          packages: plan.quotes,
        };
        setRows((current) => {
          const targetAlreadyListed = current.some(
            (item) => item.cart_id === newCartId && item.cart_id !== row.cart_id,
          );
          if (targetAlreadyListed) {
            return current
              .filter((item) => item.cart_id !== row.cart_id)
              .map((item) => item.cart_id === newCartId
                ? {
                    ...item,
                    cart_qty: String((Number(item.cart_qty) || 1) + (Number(row.cart_qty) || 1)),
                    cart_duration: savedRow.cart_duration,
                    cart_package_id: savedRow.cart_package_id,
                    package_name: savedRow.package_name,
                    package_percentage: savedRow.package_percentage,
                    packages: savedRow.packages,
                  }
                : item);
          }
          return current.map((item) => item.cart_id === row.cart_id ? savedRow : item);
        });
        setSummary(null);
        setStaged((current) => {
          const next = { ...current };
          delete next[row.cart_id];
          delete next[newCartId];
          return next;
        });
      }
      setNotice("Protection plan updated.");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? `${reason.message} Your original cart item is still available if the new plan could not be added.`
          : "Could not update this plan.",
      );
      void refreshCart(true);
    } finally {
      setWorkingId("");
    }
  }

  const fallbackSummary = useMemo(
    () => rows.reduce((totals, row) => {
      const quantity = Number(row.cart_qty) || 1;
      const productPrice = firstPositiveAmount(row.retailer_price, row.purchase_price, row.original_price);
      const selectedQuote = findSelectedQuote(row, staged[row.cart_id]);
      const packagePrice = Number(selectedQuote?.package_price ?? 0) || 0;
      totals.products += productPrice * quantity;
      totals.protection += packagePrice * quantity;
      return totals;
    }, { products: 0, protection: 0 }),
    [rows, staged],
  );
  const summaryView = {
    products: summary?.products_formatted || summaryMoney(fallbackSummary.products),
    protection: summary?.protection_packages_formatted || summaryMoney(fallbackSummary.protection),
    total: summary?.total_formatted || summaryMoney(fallbackSummary.products + fallbackSummary.protection),
  };
  return (
    <PageShell footer={false}>
      <main className="min-h-[60vh] bg-muted/40 pb-20">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 md:px-8">
          
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div>
            
              <h1 className="mt-1 font-display text-3xl font-semibold">Shopping cart</h1>
            </div>
            {!loading && rows.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {rows.length} {rows.length === 1 ? "item" : "items"}
              </p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}
          {notice && (
            <p
              role="status"
              className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              {notice}
            </p>
          )}

          {!session ? (
            <section className="mx-auto mt-10 max-w-lg rounded-3xl border bg-card p-8 text-center shadow-card">
              <ShoppingBag className="mx-auto size-10 text-primary" />
              <h2 className="mt-4 font-display text-2xl font-semibold">
                Sign in to view your cart
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your cart is saved to your account.
              </p>
              <Button asChild className="mt-5 rounded-full">
                <Link to="/profile" onClick={rememberAuthReturnPath}>Sign in</Link>
              </Button>
            </section>
          ) : loading ? (
            <section aria-label="Loading cart" className="mt-8 grid gap-4 lg:grid-cols-[1fr_340px]">
              <div className="h-64 animate-pulse rounded-3xl bg-card" />
              <div className="h-64 animate-pulse rounded-3xl bg-card" />
            </section>
          ) : rows.length === 0 ? (
            <section className="mx-auto mt-10 max-w-lg rounded-3xl border bg-card p-8 text-center shadow-card">
              <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
              <h2 className="mt-4 font-display text-2xl font-semibold">Your cart is empty</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Explore our devices and add a product to get started.
              </p>
              <Button asChild className="mt-5 rounded-full">
                <Link to="/products">Browse products</Link>
              </Button>
            </section>
          ) : (
            <div className="mt-7 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
              <section className="space-y-4">
                {rows.map((row) => {
                  const stagedPlan = staged[row.cart_id];
                  const supportsBuyback = String(row.product_type ?? "") !== "3";
                  const currentPlanId = stagedPlan?.packageId ?? row.cart_package_id ?? "0";
                  const duration = stagedPlan?.duration ?? (Number(row.cart_duration) || 1);
                  const packageOptions = [...(row.packages ?? [])].sort((first, second) => {
                    const order = ["silver", "gold", "platinum"];
                    return (
                      order.indexOf(first.package_name.toLowerCase()) -
                      order.indexOf(second.package_name.toLowerCase())
                    );
                  });
                  const hasPackageChoices = supportsBuyback && packageOptions.length > 0;
                  const activeQuote = findSelectedQuote(row, stagedPlan);
                  const activePackageName =
                    packageOptions.find((item) => item.package_id === currentPlanId)
                      ?.package_name ??
                    row.package_name ??
                    "Silver";
                  const activePackageTheme = getPackageTheme(activePackageName);
                  const activeSurface = getPackageSurface(
                    activePackageName,
                    activePackageTheme.surface,
                  );
                  const product = mapApiProduct(row);
                  const linkSlug = `product-${row.product_id}`;
                  const selectedPlanChanged = Boolean(
                    stagedPlan &&
                    (stagedPlan.packageId !== row.cart_package_id ||
                      stagedPlan.duration !== (Number(row.cart_duration) || 1)),
                  );
                  return (
                    <article
                      key={row.cart_id}
                      className="overflow-hidden rounded-3xl border border-border bg-card shadow-card"
                    >
                      <div
                        className="flex gap-4 p-4"
                        style={{
                          padding:
                            "calc(var(--spacing) * 5) calc(var(--spacing) * 5) calc(var(--spacing) * 1) calc(var(--spacing) * 5)",
                        }}
                      >
                        <Link
                          to="/products/$slug"
                          params={{ slug: linkSlug }}
                          className="grid size-24 shrink-0 place-items-center rounded-2xl bg-muted/50 sm:size-32"
                        >
                          <img
                            src={product.image}
                            alt={row.pro_name || row.product_variant}
                            className="max-h-full max-w-full object-contain"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              {/* <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                {row.brand_name || "Device"}
                                {row.model_name ? ` · ${row.model_name}` : ""}
                              </p> */}
                              <Link
                                to="/products/$slug"
                                params={{ slug: linkSlug }}
                                className="mt-1 line-clamp-2 font-semibold hover:underline"
                              >
                                {row.pro_name ||
                                  `${row.brand_name ?? ""} ${row.model_name ?? ""} ${row.product_variant}`}
                              </Link>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {row.product_variant}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                              disabled={workingId === row.cart_id}
                              onClick={() => setRemoveTarget({ row, kind: "product" })}
                              aria-label="Remove product"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                          <p className="mt-3 text-lg font-bold">
                            {money(row.retailer_price || row.purchase_price || row.original_price)}{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                              product price
                            </span>
                          </p>
                          <div
                            className="mt-3 flex w-full items-center justify-end gap-2"
                            aria-label="Quantity selector"
                          >
                            <span className="mr-1 text-xs text-muted-foreground">Qty</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 rounded-full"
                              disabled={workingId === row.cart_id}
                              onClick={() =>
                                void changeQuantity(row, (Number(row.cart_qty) || 1) - 1)
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus className="size-3.5" />
                            </Button>
                            <span className="min-w-7 text-center text-sm font-semibold tabular-nums">
                              {row.cart_qty || "1"}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 rounded-full"
                              disabled={workingId === row.cart_id}
                              onClick={() =>
                                void changeQuantity(row, (Number(row.cart_qty) || 1) + 1)
                              }
                              aria-label="Increase quantity"
                            >
                              <Plus className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {hasPackageChoices && <section aria-labelledby={`cart-buyback-${row.cart_id}`}>
                        <article
                          className="rounded-2xl bg-card p-4 "
                          style={{
                            padding:
                              "calc(var(--spacing) * 0) calc(var(--spacing) * 5) calc(var(--spacing) * 5) calc(var(--spacing) * 5)",
                          }}
                        >
                          <section className="mt-1 w-full min-w-0 rounded-3xl border border-[#dce1e8] bg-white p-4 shadow-sm sm:p-6">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                              <div>
                                
                                <h3 className="mt-1 font-display text-2xl sm:text-3xl">
                                   Assured Buyback
                                </h3>
                              </div>
                              <div className="flex items-center gap-3">
                                {workingId === row.cart_id && (
                                  <span className="text-xs text-muted-foreground">
                                    Updating estimate…
                                  </span>
                                )}
                                {row.cart_package_id !== "0" && (
                                  <button
                                    type="button"
                                    disabled={workingId === row.cart_id}
                                    className="text-xs font-medium text-destructive underline underline-offset-2 disabled:opacity-50"
                                    onClick={() => setRemoveTarget({ row, kind: "package" })}
                                  >
                                    Remove package
                                  </button>
                                )}
                                {currentPlanId === "0" && (
                                  <button
                                    type="button"
                                    aria-pressed="true"
                                    className="mt-3 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"
                                    onClick={() =>
                                      setStaged((current) => ({
                                        ...current,
                                        [row.cart_id]: {
                                          packageId: "0",
                                          duration,
                                          quotes: packageOptions,
                                        },
                                      }))
                                    }
                                  >
                                    No protection plan selected
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="relative mt-5 grid min-h-[60px] grid-cols-3 gap-2 sm:min-h-[72px] sm:gap-3">
                              {packageOptions.map((quote) => {
                                const selected = currentPlanId === quote.package_id;
                                const optionTheme = getPackageTheme(quote.package_name);
                                const optionSurface = getPackageSurface(
                                  quote.package_name,
                                  optionTheme.surface,
                                );
                                return (
                                  <button
                                    key={quote.package_id}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() =>
                                      setStaged((current) => ({
                                        ...current,
                                        [row.cart_id]: {
                                          packageId: quote.package_id,
                                          duration,
                                          quotes: stagedPlan?.quotes ?? packageOptions,
                                        },
                                      }))
                                    }
                                    className={cn(
                                      "relative z-10 flex min-h-[60px] items-center justify-center rounded-full border bg-transparent px-2 py-3 text-center transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none sm:min-h-[72px] sm:px-5",
                                      selected
                                        ? "package-active-tab z-20 border-2 text-foreground"
                                        : "border-border text-foreground",
                                    )}
                                    style={
                                      selected
                                        ? {
                                            borderColor: optionSurface,
                                            backgroundColor: optionSurface,
                                            backgroundImage: optionTheme.gradient,
                                            color: optionTheme.foreground,
                                            borderRadius: "9999px",
                                            boxShadow: `0 7px 14px color-mix(in srgb, ${optionSurface} 72%, transparent)`,
                                          }
                                        : {
                                            borderColor: "#E7E5E4",
                                            backgroundColor: "#FAFAF8",
                                            color: "#0B2A55",
                                            borderRadius: "9999px",
                                          }
                                    }
                                  >
                                    <span className="min-w-0">
                                      <span className="block font-display text-sm font-semibold sm:text-base">
                                        {quote.package_name}
                                      </span>
                                    </span>
                                   
                                  </button>
                                );
                              })}
                            </div>

                            {currentPlanId !== "0" && (
                              <div
                                className="relative z-[1] mt-4 rounded-2xl border border-white/20 p-4 shadow-[0_16px_36px_rgba(11,42,85,0.16)] transition-[background,box-shadow] duration-500 motion-reduce:transition-none sm:p-5"
                                style={{
                                  backgroundColor: activeSurface,
                                  backgroundImage: activePackageTheme.gradient,
                                  color: activePackageTheme.foreground,
                                  borderRadius: "16px",
                                  borderColor: "rgba(255,255,255,.24)",
                                }}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <p
                                    className="text-xs font-semibold uppercase tracking-[.14em] sm:text-sm"
                                    style={{ color: activePackageTheme.accent }}
                                  >
                                    Choose your duration
                                  </p>
                                  <span className="shrink-0 whitespace-nowrap text-xs font-semibold tabular-nums sm:text-base">
                                    {duration} {duration === 1 ? "month" : "months"}
                                  </span>
                                </div>
                                <input
                                  aria-label="Choose duration from 1 to 24 months"
                                  type="range"
                                  min="1"
                                  max="24"
                                  step="1"
                                  value={duration}
                                  onChange={(event) =>
                                    changeDuration(row, Number(event.target.value))
                                  }
                                  className="mt-5 block h-8 w-full min-w-0 cursor-pointer touch-pan-x accent-[var(--brand-saffron)]"
                                  style={{ accentColor: activePackageTheme.accent }}
                                />
                                <DurationScale
                                  months={getDurationMilestones(1)}
                                  selectedMonth={duration}
                                  accentColor={activePackageTheme.accent}
                                  textColor={activePackageTheme.foreground}
                                />
                                <div className="mt-4 grid min-w-0 grid-cols-2 gap-4 text-sm sm:gap-8">
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium text-current/80 sm:text-sm">Assured buyback amount</p>
                                    <p className="mt-1 break-words text-xl font-bold leading-tight tabular-nums sm:text-2xl" style={{ color: activePackageTheme.accent }}>
                                      {money(activeQuote?.buyback_amount)}
                                    </p>
                                  </div>
                                  <div className="min-w-0 text-right">
                                    <p className="text-xs font-medium text-current/80 sm:text-sm">Package price</p>
                                    <p className="mt-1 break-words text-xl font-bold leading-tight tabular-nums sm:text-2xl">
                                      {money(activeQuote?.package_price)}
                                    </p>
                                  </div>
                                </div>
                                <p className="mt-4 min-w-0 break-words text-sm font-medium leading-relaxed text-current sm:text-base">
                                  {row.brand_name} · {row.model_name} · {row.product_variant}
                                </p>
                              </div>
                            )}
                          </section>
                          {selectedPlanChanged && (
                            <div className="mt-5 flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-full"
                                disabled={workingId === row.cart_id}
                                onClick={() =>
                                  setStaged((current) => {
                                    const next = { ...current };
                                    delete next[row.cart_id];
                                    return next;
                                  })
                                }
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                className="rounded-full"
                                disabled={
                                  workingId === row.cart_id ||
                                  (currentPlanId !== "0" && !activeQuote)
                                }
                                onClick={() => void savePlan(row)}
                              >
                                {workingId === row.cart_id ? "Saving…" : "Save protection plan"}
                              </Button>
                            </div>
                          )}
                        </article>
                      </section>}
                    </article>
                  );
                })}
              </section>

              <aside className="sticky top-4 rounded-3xl border border-border bg-card p-5 shadow-card">
                <h2 className="font-display text-xl font-semibold">Order summary</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <p className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Products</span>
                    <b>{summaryView.products}</b>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Protection packages</span>
                    <b>{summaryView.protection}</b>
                  </p>
                  <p className="flex justify-between gap-3 border-t border-border pt-3 text-base">
                    <b>Total</b>
                    <b>{summaryView.total}</b>
                  </p>
                </div>
                
                <Button
                  asChild
                  className="mt-5 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary-hover"
                >
                  <Link to="/checkout/address">Continue</Link>
                </Button>
                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-success" />
                  Secure checkout
                </p>
              </aside>
            </div>
          )}
        </div>
      </main>
      <AlertDialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <AlertDialogContent className="overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl">
          <div
            className={cn(
              "p-5 sm:p-6",
              removeTarget?.kind === "package"
                ? "bg-gradient-to-br from-amber-50 via-white to-orange-50"
                : "bg-gradient-to-br from-rose-50 via-white to-red-50",
            )}
          >
            <AlertDialogHeader className="gap-3">
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl",
                  removeTarget?.kind === "package"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-700",
                )}
              >
                {removeTarget?.kind === "package" ? (
                  <PackageX className="size-6" />
                ) : (
                  <Trash2 className="size-6" />
                )}
              </div>
              <AlertDialogTitle className="text-xl">
                {removeTarget?.kind === "package"
                  ? "Remove protection package?"
                  : "Remove product from cart?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {removeTarget?.kind === "package"
                  ? "The package and its duration will be removed. The product will stay in your cart."
                  : "This removes the product and its attached protection package from your cart."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:space-x-0">
            <AlertDialogCancel
              className={cn(
                "mt-0 h-12 w-full rounded-xl border sm:mt-0",
                removeTarget?.kind === "package"
                  ? "border-sky-200 bg-gradient-to-r from-sky-100 to-indigo-100 text-indigo-950 shadow-sm hover:from-sky-200 hover:to-indigo-200"
                  : "border-sky-200 bg-gradient-to-r from-sky-100 to-indigo-100 text-indigo-950 shadow-sm hover:from-sky-200 hover:to-indigo-200",
              )}
              onClick={() => setRemoveTarget(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                "h-12 w-full rounded-xl",
                removeTarget?.kind === "package"
                  ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/25 hover:from-rose-700 hover:to-red-700"
                  : "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/25 hover:from-rose-700 hover:to-red-700",
              )}
              onClick={() => {
                if (!removeTarget) return;
                const target = removeTarget;
                setRemoveTarget(null);
                if (target.kind === "package") void removePackage(target.row);
                else void removeItem(target.row);
              }}
            >
              Yes, remove
            </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
