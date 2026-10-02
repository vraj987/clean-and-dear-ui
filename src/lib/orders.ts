export type OrderRecord = {
  id: string;
  placed: string;
  total: string;
  status: "On the way" | "Delivered";
  itemSlug: string;
  payment: string;
  address: string;
  timeline: { title: string; description: string; date: string; complete: boolean }[];
};

/** Static UI examples only. Orders are not fetched or stored. */
export const demoOrders: OrderRecord[] = [
  {
    id: "BP-240926-01",
    placed: "26 Sep 2026",
    total: "₹49,999",
    status: "On the way",
    itemSlug: "galaxy-a57-5g",
    payment: "Easy EMI · ₹2,326/mo",
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
];
