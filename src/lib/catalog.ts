import type { LucideIcon } from "lucide-react";
import { Headphones, Smartphone, Speaker } from "lucide-react";

export type CatalogItem = {
  brand: string;
  name: string;
  slug: string;
  monthly: string;
  price: string;
  mrp?: string;
  tag?: string;
  icon: LucideIcon;
  tone: string;
};

export const catalog: CatalogItem[] = [
  { brand: "Samsung", name: "Galaxy A57 5G", slug: "galaxy-a57-5g", monthly: "₹2,326/mo", price: "₹49,999", mrp: "₹58,999", tag: "15% off", icon: Smartphone, tone: "bg-product-blue" },
  { brand: "Apple", name: "iPhone 18 Pro", slug: "iphone-18-pro", monthly: "₹7,673/mo", price: "₹1,64,900", tag: "New Launch", icon: Smartphone, tone: "bg-product-coral" },
  { brand: "Google", name: "Pixel 11", slug: "pixel-11", monthly: "₹3,839/mo", price: "₹82,499", mrp: "₹89,999", icon: Smartphone, tone: "bg-product-sky" },
  { brand: "Sony", name: "WF-C510 Truly Wireless", slug: "sony-wf-c510", monthly: "₹209/mo", price: "₹4,500", mrp: "₹8,990", icon: Headphones, tone: "bg-muted" },
  { brand: "Marshall", name: "Emberton III", slug: "marshall-emberton-iii", monthly: "₹744/mo", price: "₹15,999", mrp: "₹17,999", icon: Speaker, tone: "bg-product-sage" },
];
