export const DEMO_COD_ORDERS_KEY = "kimaat-lock-demo-cod-orders";

export type DemoCodOrder = {
  id: string;
  customerId: string;
  createdAt: string;
  total: string;
  address: string;
  products: {
    name: string;
    variant: string;
    quantity: number;
    image: string;
    packageName: string;
    duration: string;
    packagePrice: string;
    buybackAmount: string;
  }[];
};

export function readDemoCodOrders() {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(DEMO_COD_ORDERS_KEY) || "[]");
    return Array.isArray(value) ? (value as DemoCodOrder[]) : [];
  } catch {
    return [];
  }
}

export function saveDemoCodOrder(order: DemoCodOrder) {
  const orders = readDemoCodOrders();
  localStorage.setItem(DEMO_COD_ORDERS_KEY, JSON.stringify([order, ...orders]));
}
