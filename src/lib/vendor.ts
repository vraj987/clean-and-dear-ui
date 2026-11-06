import { catalog } from "@/lib/catalog";

export type VendorOrder = {
  id: string;
  invoiceNo: string;
  orderDate: string;
  customer: string;
  mobile: string;
  items: { productSlug: string; quantity: number; unitPrice: number }[];
  baseTotal: number;
  discountTotal: number;
  couponDiscount: number;
  status: string;
  deliveryDate: string;
  address: string;
  paymentMethod: string;
  paymentStatus: string;
};

function dateFromToday(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export const vendorOrders: VendorOrder[] = [
  {
    id: "ST-261005-018",
    invoiceNo: "INV-261005-018",
    orderDate: dateFromToday(0),
    customer: "Aanya Sharma",
    mobile: "98765 43210",
    items: [
      { productSlug: "airpods-5", quantity: 1, unitPrice: 14900 },
      { productSlug: "pixel-11", quantity: 1, unitPrice: 82499 },
    ],
    baseTotal: 97399,
    discountTotal: 2500,
    couponDiscount: 1000,
    status: "Processing",
    deliveryDate: "2026-10-09",
    address: "Aanya Sharma, 21 Lake View Road, Bengaluru, Karnataka 560001",
    paymentMethod: "UPI",
    paymentStatus: "Paid",
  },
  {
    id: "ST-261004-012",
    invoiceNo: "INV-261004-012",
    orderDate: dateFromToday(-1),
    customer: "Rohan Mehta",
    mobile: "98250 13579",
    items: [{ productSlug: "galaxy-a57-5g", quantity: 2, unitPrice: 1999 }],
    baseTotal: 3998,
    discountTotal: 0,
    couponDiscount: 0,
    status: "Ready to ship",
    deliveryDate: "2026-10-07",
    address: "Rohan Mehta, 8 Sunrise Apartments, Ahmedabad, Gujarat 380015",
    paymentMethod: "Cash on delivery",
    paymentStatus: "Pending",
  },
];

export const vendorOrderStatuses = ["Order received", "Processing", "Ready to ship", "Shipped", "Out for delivery", "Delivered", "Cancelled"];
export const vendorPaymentStatuses = ["Pending", "Paid", "Partially paid", "Refunded"];

export const accessoryCategories = ["Cases & Covers", "Screen Protectors", "Chargers & Cables", "Audio Accessories", "Other Accessories"] as const;

export type VendorProduct = {
  id: string;
  categoryId?: string;
  brandId?: string;
  modelId?: string;
  brandName?: string;
  modelName?: string;
  name: string;
  variant: string;
  category: string;
  mrp: string;
  offerPrice: string;
  shortDescription: string;
  longDescription: string;
  specifications: string;
  imageNames: string[];
  detailImageNames: string[];
  active: boolean;
  imageUrl?: string;
  mainImagePath?: string;
};

export const initialVendorProducts: VendorProduct[] = [
  {
    id: "VP-001",
    name: "Clear MagSafe Phone Case",
    variant: "iPhone 17 Pro · Clear",
    category: "Cases & Covers",
    mrp: "1999",
    offerPrice: "1499",
    shortDescription: "Slim transparent case with magnetic wireless charging support.",
    longDescription: "Protective clear case with a comfortable grip and raised camera edges.",
    specifications: "Material: TPU and polycarbonate\nCompatibility: iPhone 17 Pro\nFinish: Clear",
    imageNames: [],
    detailImageNames: [],
    active: true,
  },
  {
    id: "VP-002",
    name: "65W USB-C Fast Charger",
    variant: "65W · White",
    category: "Chargers & Cables",
    mrp: "2999",
    offerPrice: "2199",
    shortDescription: "Compact USB-C fast charger for compatible phones and tablets.",
    longDescription: "A compact travel charger with intelligent power delivery and thermal protection.",
    specifications: "Output: Up to 65W\nPort: USB-C\nColour: White",
    imageNames: [],
    detailImageNames: [],
    active: true,
  },
];

export function vendorProductForOrder(slug: string) {
  return catalog.find((product) => product.slug === slug) ?? catalog[0]!;
}
