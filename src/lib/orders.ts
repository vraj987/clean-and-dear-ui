import { readOrderDepreciation, type OrderApiRecord } from "@/services/api/order.service";

export type OrderRecord = {
  id: string;
  placed: string;
  deliveryDate?: string;
  total: string;
  status: string;
  itemSlug: string;
  payment: string;
  orderType: string;
  kavach?: {
    packageName: string;
    duration: number;
    purchaseDate: string;
    purchasePrice?: string;
    buybackAmount?: string;
    packagePrice?: string;
    packagePercentage?: string;
    schedule?: ReturnType<typeof readOrderDepreciation>;
  };
  deviceName?: string;
  variant?: string;
  image?: string;
  productCount?: number;
  productTotal?: string;
  kavachTotal?: string;
  discountTotal?: string;
  payableTotal?: string;
  paymentStatus?: string;
  products?: {
    name: string;
    variant: string;
    image: string;
    price: string;
    packageName: string;
    duration: number;
    packagePrice: string;
    buybackAmount: string;
  }[];
  address: string;
  timeline: { title: string; description: string; date: string; complete: boolean }[];
};

function displayDate(value?: string) {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function mapApiOrder(record: OrderApiRecord): OrderRecord {
  const productRows = readOrderProductArray(record.products ?? record.product_array ?? record.product_arr ?? record.order_products);
  const primaryProduct = productRows[0] ?? {};
  const id = String(record.kavach_order_id ?? record.order_id ?? record.kavach_order_detail_id ?? record.order_detail_id ?? "");
  const brand = String(record.brand_name ?? primaryProduct.brand_name ?? "").trim();
  const model = String(record.model_name ?? primaryProduct.model_name ?? "").trim();
  const variant = String(record.product_variant ?? primaryProduct.product_variant ?? "").trim();
  const isKavach = Boolean(
    productRows.some((item) => String(item.package_name ?? "").trim() && String(item.package_id ?? "0") !== "0") ||
    (String(record.package_name ?? "").trim() && String(record.package_id ?? "0") !== "0"),
  );
  const explicitOrderType = String(record.order_type ?? "");
  const orderType = explicitOrderType === "1"
    ? "Product purchase"
    : explicitOrderType === "2"
      ? "Product + Kavach"
      : explicitOrderType === "3"
        ? "Kavach purchase"
        : productRows.length
          ? isKavach ? "Product + Kavach" : "Product purchase"
          : isKavach ? "Kavach purchase" : "Order";
  const status = String(record.order_status_text ?? record.order_status ?? "Order received");
  const duration = Number(record.duration ?? 1) || 1;
  const explicitTotal = record.payable_amount ?? record.kavach_payable;
  const itemAmount = Number(record.purchase_price ?? 0);
  const planAmount = Number(record.package_price ?? 0);
  const total = explicitTotal ?? (itemAmount || planAmount ? itemAmount + planAmount : "");
  const packageName = String(record.package_name ?? "").trim();
  const purchaseDate = String(record.invoice_date ?? record.purchase_date ?? "").slice(0, 10);
  const rawDeliveryDate = String(record.delivery_date ?? "").trim();
  const deliveryDate = rawDeliveryDate && !rawDeliveryDate.startsWith("0000-00-00")
    ? displayDate(rawDeliveryDate)
    : "";
  const products = productRows.map((item) => {
    const productBrand = String(item.brand_name ?? "").trim();
    const productModel = String(item.model_name ?? "").trim();
    const productVariant = String(item.product_variant ?? "").trim();
    const explicitName = String(item.pro_name ?? item.product_name ?? "").trim();
    const productPrice = item.purchase_price ?? item.original_price ?? "";
    const name = explicitName || [productBrand, productModel].filter(Boolean).join(" ") || productVariant || "Order item";
    return {
      name,
      variant: productModel ? productVariant : "",
      image: String(item.product_image_url ?? item.product_image ?? item.image ?? item.model_image_url ?? "").trim(),
      price: productPrice === "" ? "" : `₹${Number(productPrice).toLocaleString("en-IN")}`,
      packageName: String(item.package_name ?? "").trim(),
      duration: Number(item.duration ?? 0) || 0,
      packagePrice: String(item.package_price ?? ""),
      buybackAmount: String(item.buyback_amount ?? ""),
    };
  });
  const formatOptionalMoney = (value: unknown) => {
    if (value === undefined || value === null || value === "") return "";
    const amount = Number(value);
    return Number.isFinite(amount) ? `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "";
  };
  const productTotal = formatOptionalMoney(record.purchase_price);
  const kavachTotal = formatOptionalMoney(record.package_price);
  const discountTotal = formatOptionalMoney(record.total_discount_price ?? record.kavach_discount);
  const payableTotal = formatOptionalMoney(record.payable_amount ?? record.kavach_payable ?? total);
  return {
    id,
    placed: displayDate(String(record.purchase_date ?? record.start_date ?? record.invoice_date ?? "")),
    ...(deliveryDate ? { deliveryDate } : {}),
    total: total === "" ? "—" : `₹${Number(total).toLocaleString("en-IN")}`,
    status,
    itemSlug: "",
    payment: String(record.payment_status ?? "Kavach plan"),
    orderType,
    deviceName: [brand, model].filter(Boolean).join(" ") || (isKavach ? "Kavach device" : "Order item"),
    variant,
    image: String(record.image ?? primaryProduct["product_image_url"] ?? primaryProduct["product_image"] ?? "").trim(),
    ...(productRows.length ? { productCount: productRows.length } : {}),
    ...(products.length ? { products } : {}),
    ...(productTotal ? { productTotal } : {}),
    ...(kavachTotal ? { kavachTotal } : {}),
    ...(discountTotal ? { discountTotal } : {}),
    ...(payableTotal ? { payableTotal } : {}),
    paymentStatus: String(record.order_status_text ?? record.payment_status ?? ""),
    ...(isKavach
      ? {
        kavach: {
          packageName: packageName || "Kavach",
          duration,
          purchaseDate,
          purchasePrice: String(record.purchase_price ?? ""),
          buybackAmount: String(record.buyback_amount ?? ""),
          packagePrice: String(record.package_price ?? ""),
          packagePercentage: String(record.package_percentage ?? ""),
          schedule: readOrderDepreciation(record.depreciation_json),
        }
      }
      : {}),
    address: "",
    timeline: [
      {
        title: status,
        description: packageName ? `${packageName} plan · ${duration} months` : "Order status from your account",
        date: displayDate(String(record.start_date ?? record.purchase_date ?? "")),
        complete: true,
      },
    ],
  };
}

function readOrderProductArray(value: unknown): OrderApiRecord[] {
  let parsed = value;
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed) as unknown; } catch { return []; }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is OrderApiRecord => Boolean(item) && typeof item === "object");
}

/** Static UI examples only. Orders are not fetched or stored. */
export const demoOrders: OrderRecord[] = [
  {
    id: "BP-240926-01",
    placed: "26 Sep 2026",
    total: "₹49,999",
    status: "On the way",
    itemSlug: "galaxy-a57-5g",
    payment: "Easy EMI · ₹2,326/mo",
    orderType: "Product purchase",
    address: "Aanya Sharma, 21 Lake View Road, Bengaluru, Karnataka 560001",
    timeline: [
      {
        title: "Order placed",
        description: "Your order has been confirmed.",
        date: "26 Sep · 10:42 AM",
        complete: true,
      },
      {
        title: "Preparing your order",
        description: "Your device is being carefully packed.",
        date: "26 Sep · 2:15 PM",
        complete: true,
      },
      {
        title: "Out for delivery",
        description: "Your delivery partner is on the way.",
        date: "27 Sep · 9:10 AM",
        complete: true,
      },
      {
        title: "Delivered",
        description: "Open-box verification at your doorstep.",
        date: "Expected today",
        complete: false,
      },
    ],
  },
  {
    id: "BP-240921-14",
    placed: "21 Sep 2026",
    total: "₹14,900",
    status: "Delivered",
    itemSlug: "airpods-5",
    payment: "Paid in full",
    orderType: "Kavach purchase",
    kavach: { packageName: "Gold", duration: 12, purchaseDate: "2026-08-01" },
    address: "Aanya Sharma, 21 Lake View Road, Bengaluru, Karnataka 560001",
    timeline: [
      {
        title: "Order placed",
        description: "Your order has been confirmed.",
        date: "21 Sep · 11:08 AM",
        complete: true,
      },
      {
        title: "Preparing your order",
        description: "Your device is packed and ready.",
        date: "21 Sep · 1:40 PM",
        complete: true,
      },
      {
        title: "Out for delivery",
        description: "Your delivery partner was on the way.",
        date: "22 Sep · 8:35 AM",
        complete: true,
      },
      {
        title: "Delivered",
        description: "Open-box delivery completed.",
        date: "22 Sep · 12:18 PM",
        complete: true,
      },
    ],
  },
  {
    id: "BP-240919-08",
    placed: "19 Sep 2026",
    total: "₹52,499",
    status: "Delivered",
    itemSlug: "iphone-18-pro",
    payment: "Easy EMI · ₹2,916/mo",
    orderType: "Product + Kavach",
    kavach: { packageName: "Platinum", duration: 18, purchaseDate: "2026-09-19" },
    address: "Aanya Sharma, 21 Lake View Road, Bengaluru, Karnataka 560001",
    timeline: [
      { title: "Order placed", description: "Your order has been confirmed.", date: "19 Sep · 9:30 AM", complete: true },
      { title: "Preparing your order", description: "Your device is packed and ready.", date: "19 Sep · 1:15 PM", complete: true },
      { title: "Delivered", description: "Open-box delivery completed.", date: "20 Sep · 11:45 AM", complete: true },
    ],
  },
  {
    id: "BP-240917-03",
    placed: "17 Sep 2026",
    total: "₹0",
    status: "Delivered",
    itemSlug: "galaxy-a57-5g",
    payment: "Return pickup · No payment due",
    orderType: "Product return",
    address: "Aanya Sharma, 21 Lake View Road, Bengaluru, Karnataka 560001",
    timeline: [
      { title: "Return requested", description: "Your return request is confirmed.", date: "17 Sep · 10:20 AM", complete: true },
      { title: "Device collected", description: "The device was collected from your address.", date: "18 Sep · 3:00 PM", complete: true },
      { title: "Return completed", description: "Your return has been processed.", date: "19 Sep · 12:00 PM", complete: true },
    ],
  },
  {
    id: "BP-240915-11",
    placed: "15 Sep 2026",
    total: "₹18,000 payable",
    status: "On the way",
    itemSlug: "iphone-18-pro",
    payment: "Exchange · ₹18,000 balance due",
    orderType: "Return + exchange",
    address: "Aanya Sharma, 21 Lake View Road, Bengaluru, Karnataka 560001",
    timeline: [
      { title: "Exchange requested", description: "Your old device has been reviewed.", date: "15 Sep · 2:10 PM", complete: true },
      { title: "New device preparing", description: "Your replacement device is being prepared.", date: "16 Sep · 9:00 AM", complete: true },
      { title: "Out for delivery", description: "Your exchange order is on the way.", date: "Expected today", complete: false },
    ],
  },
  {
    id: "BP-240912-06",
    placed: "12 Sep 2026",
    total: "₹12,500 payable",
    status: "On the way",
    itemSlug: "iphone-18-pro",
    payment: "Exchange · ₹12,500 balance due",
    orderType: "Return + exchange + Kavach",
    kavach: { packageName: "Silver", duration: 12, purchaseDate: "2026-09-12" },
    address: "Aanya Sharma, 21 Lake View Road, Bengaluru, Karnataka 560001",
    timeline: [
      { title: "Exchange and Kavach confirmed", description: "Your new device and Kavach plan are confirmed.", date: "12 Sep · 11:10 AM", complete: true },
      { title: "Preparing your order", description: "Your device is being prepared for delivery.", date: "13 Sep · 2:00 PM", complete: true },
      { title: "Out for delivery", description: "Your exchange order is on the way.", date: "Expected today", complete: false },
    ],
  },
];

