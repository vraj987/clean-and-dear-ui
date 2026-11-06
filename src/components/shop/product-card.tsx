import { Link } from "@tanstack/react-router";
import { Check, LoaderCircle, ShoppingCart, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { CatalogItem } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { WishlistToggle } from "@/components/shop/wishlist-toggle";
import { Button } from "@/components/ui/button";
import { readAuthSession } from "@/services/api/auth";
import {
  addCartItem,
  listCart,
  removeCartProduct,
  type CartListResponse,
  type CartRecord,
} from "@/services/api/cart.service";
import { apiQueryKeys } from "@/services/api/query-keys";

export function ProductCard({
  product,
  onWishlistChange,
}: {
  product: CatalogItem;
  onWishlistChange?: () => void;
}) {
  const session = readAuthSession();
  const queryClient = useQueryClient();
  const cartKey = apiQueryKeys.cart(session?.accountId ?? "");
  const cartQuery = useQuery({
    queryKey: cartKey,
    queryFn: () => listCart({ user_id: session!.accountId }),
    enabled: Boolean(session?.accountId),
    staleTime: 30_000,
  });
  const [cartAction, setCartAction] = useState<"adding" | "removing" | null>(null);
  const [cartError, setCartError] = useState("");
  const cartRows = cartQuery.data?.result ?? [];
  const productCartRows = cartRows.filter(
    (row) => String(row.cart_product_id || row.product_id) === String(product.productId),
  );
  const isInCart = Boolean(product.productId && productCartRows.length);

  async function handleCartAction() {
    if (!product.productId || cartAction) return;
    if (!session) {
      setCartError("Please sign in to add this product to your cart.");
      return;
    }

    setCartAction(isInCart ? "removing" : "adding");
    setCartError("");
    try {
      if (isInCart) {
        await Promise.all(
          productCartRows.map((row) => removeCartProduct(row.cart_id, session.accountId)),
        );
        queryClient.setQueryData<CartListResponse>(cartKey, (current) => ({
          status: "1",
          error: "",
          ...current,
          result: (current?.result ?? []).filter(
            (row) => String(row.cart_product_id || row.product_id) !== String(product.productId),
          ),
        }));
      } else {
        const response = await addCartItem({
          user_id: session.accountId,
          product_id: product.productId,
          package_id: "0",
          duration: "0",
          qty: 1,
        });
        const optimisticRow = {
          cart_id: String(response.cart_id ?? `pending-${product.productId}`),
          cart_customer_id: session.accountId,
          cart_product_id: product.productId,
          product_id: product.productId,
          cart_qty: "1",
          cart_package_id: "0",
          cart_duration: "0",
        } as CartRecord;
        queryClient.setQueryData<CartListResponse>(cartKey, (current) => ({
          status: "1",
          error: "",
          ...current,
          result: [
            ...(current?.result ?? []).filter(
              (row) => String(row.cart_product_id || row.product_id) !== String(product.productId),
            ),
            optimisticRow,
          ],
        }));
      }
      void queryClient.invalidateQueries({ queryKey: cartKey });
    } catch (error) {
      setCartError(
        error instanceof Error
          ? error.message
          : `Could not ${isInCart ? "remove this product from" : "add this product to"} your cart.`,
      );
    } finally {
      setCartAction(null);
    }
  }

  return (
    <div className="group relative min-w-0">
      <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-card border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card">
        <Link to="/products/$slug" params={{ slug: product.slug }} className="flex flex-1 flex-col">
          <div
            className={cn(
              "relative grid aspect-[4/3] place-items-center overflow-hidden",
              product.tone,
            )}
          >
            {product.tag && (
              <span className="absolute left-2 top-2 z-10 rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">
                {product.tag}
              </span>
            )}
            {product.rating > 0 && (
              <span className="absolute right-2 top-2 z-10 flex items-center gap-1 text-xs font-semibold">
                <Star className="size-3 fill-current text-product-sun" />
                {product.rating}
              </span>
            )}
            {product.image && (
              <img
                src={product.image}
                alt={`${product.brand} ${product.name}`}
                loading="lazy"
                width={1600}
                height={1104}
                className="size-full object-contain p-3 transition duration-500"
                style={{
                  objectPosition: product.imagePosition ?? "center",
                  maxHeight: "190px",
                  maxWidth: "100%",
                  padding: "0px",
                  margin: "0px",
                }}
              />
            )}
          </div>
          <div className="flex flex-1 flex-col  text-sm" style={{padding:"10px 0px 10px 10px"}}>
            <h3 className="mt-1 min-h-5 truncate font-semibold">
              {product.modelName || product.name || "\u00a0"}
            </h3>
            <p className="min-h-4 truncate text-xs text-muted-foreground">
              {product.variant || product.storage.join(" · ") || "\u00a0"}
            </p>
            <p className="mt-1 min-h-6 font-semibold">
              {product.price || "\u00a0"}{" "}
              {product.mrp && (
                <s className="ml-1 text-xs font-normal text-muted-foreground">{product.mrp}</s>
              )}
            </p>
          </div>
        </Link>
        <div className="mt-auto min-h-[50px] px-4 pb-4">
          {product.productId ? (
            isInCart ? (
              <div className="flex min-h-12 items-center gap-2">
                <span className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-success-soft px-2 py-2 text-xs font-semibold text-success sm:text-sm">
                  <Check className="size-4 shrink-0" />
                  <span className="truncate">Added to cart</span>
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="shrink-0 rounded-xl px-2.5 sm:px-3"
                  disabled={cartAction !== null}
                  onClick={handleCartAction}
                  aria-label={`Remove ${product.name} from cart`}
                >
                  {cartAction === "removing" ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                className="w-full rounded-xl"
                disabled={cartAction !== null || cartQuery.isLoading}
                onClick={() => void handleCartAction()}
              >
                {cartAction === "adding" || cartQuery.isLoading ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <ShoppingCart className="size-4" />
                )}
                {cartAction === "adding"
                  ? "Adding…"
                  : cartQuery.isLoading
                    ? "Loading cart…"
                    : "Add to cart"}
              </Button>
            )
          ) : (
            <div aria-hidden="true" className="h-12" />
          )}
          {cartError && (
            <p role="status" className="mt-2 text-xs text-destructive">
              {cartError}
            </p>
          )}
        </div>
      </article>
      {product.productId && (
        <WishlistToggle
          productId={product.productId}
          wishlistId={product.wishlistId}
          onChange={onWishlistChange}
          className="absolute right-2 top-2 z-20"
        />
      )}
    </div>
  );
}
