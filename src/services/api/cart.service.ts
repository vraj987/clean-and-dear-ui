import { postApi, type ApiEnvelope } from "./client";
import type { ProductPackageQuote, SubscriptionProduct } from "./models";
import { readAuthSession } from "./auth";

export type CartRecord = SubscriptionProduct & {
  cart_id: string;
  cart_customer_id?: string;
  cart_product_id: string;
  cart_qty: string;
  cart_package_id: string;
  cart_duration: string;
  package_name?: string;
  package_percentage?: string;
  packages?: ProductPackageQuote[];
};

export type CartSummary = {
  products: string;
  products_formatted: string;
  protection_packages: string;
  protection_packages_formatted: string;
  total: string;
  total_formatted: string;
};

export type CartListResponse = ApiEnvelope<CartRecord[]> & { summary?: CartSummary };

type CartEnvelope<T> = {
  status: string | number;
  error?: string;
  message?: string;
  cart_id?: string | number;
  result: T;
};

function requireSuccess<T>(response: CartEnvelope<T>) {
  if (String(response.status) !== "1") {
    throw new Error(response.error || response.message || "Cart request could not be completed.");
  }
  return response;
}

export function listCart(values: {
  user_id: string;
  cart_id?: string;
  product_id?: string;
  package_id?: string;
  invoice_date?: string;
  purchase_price?: string;
  duration?: string;
  filter_package_id?: string;
}) {
  // This endpoint supports GET for listing, but the storefront sends all API requests as POST.
  return postApi<CartRecord[]>("cart", { action: "list", ...values }) as Promise<CartListResponse>;
}

export async function addCartItem(values: {
  user_id: string;
  product_id: string;
  package_id: string;
  duration: string;
  qty: string | number;
}) {
  const response = await postApi<CartRecord[]>("cart", { action: "add", ...values });
  return requireSuccess(response as CartEnvelope<CartRecord[]>);
}

export async function addOrUpdateCartItem(values: {
  user_id: string;
  product_id: string;
  package_id: string;
  duration: string;
  qty: string | number;
}) {
  const response = await listCart({ user_id: values.user_id, product_id: values.product_id });
  const existingRows = (response.result ?? []).filter(
    (row) => String(row.cart_product_id || row.product_id) === values.product_id,
  );
  if (!existingRows.length) {
    await addCartItem(values);
    return;
  }

  const targetRows = existingRows.filter(
    (row) =>
      String(row.cart_package_id || "0") === values.package_id &&
      String(row.cart_duration || "0") === values.duration,
  );
  const totalQuantity = existingRows.reduce(
    (total, row) => total + Math.max(1, Number(row.cart_qty) || 1),
    0,
  );
  const keptTarget = targetRows[0];

  if (existingRows.length === 1 && keptTarget) return;

  const keptQuantity = keptTarget ? Math.max(1, Number(keptTarget.cart_qty) || 1) : 0;
  const quantityToAdd = Math.max(0, totalQuantity - keptQuantity);
  if (quantityToAdd > 0) {
    await addCartItem({ ...values, qty: quantityToAdd });
  }

  await Promise.all(
    existingRows
      .filter((row) => row.cart_id !== keptTarget?.cart_id)
      .map((row) => removeCartProduct(row.cart_id, values.user_id)),
  );
}

export async function updateCartQuantity(cart_id: string, qty: number) {
  const response = await postApi<CartRecord[]>("cart", { action: "update", cart_id, qty });
  return requireSuccess(response as CartEnvelope<CartRecord[]>);
}

export async function removeCartProduct(cart_id: string, user_id: string) {
  const response = await postApi<CartRecord[]>("cart", {
    action: "remove",
    cart_id,
    user_id,
  });
  return requireSuccess(response as CartEnvelope<CartRecord[]>);
}

export async function removeCartPackage(values: {
  cart_id: string;
  package_id: string;
  user_id: string;
  product_id: string;
  qty: number;
}) {
  // The deployed cart API has no package-only action. Preserve the product by
  // adding its no-package row, then remove the old product/package row.
  await addCartItem({
    user_id: values.user_id,
    product_id: values.product_id,
    package_id: "0",
    duration: "0",
    qty: values.qty,
  });
  const response = await postApi<CartRecord[]>("cart", {
    action: "remove",
    cart_id: values.cart_id,
    package_id: values.package_id,
    user_id: values.user_id,
  });
  return requireSuccess(response as CartEnvelope<CartRecord[]>);
}

export function getCurrentUserId() {
  return readAuthSession()?.accountId ?? "";
}
