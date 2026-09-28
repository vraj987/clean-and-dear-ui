import type { LucideIcon } from "lucide-react";
import { Headphones, Smartphone, Speaker, Watch, Laptop, Footprints } from "lucide-react";

export type CatalogItem = {
  brand: string;
  name: string;
  slug: string;
  category: "mobile" | "audio" | "wearables" | "electronics" | "footwear";
  monthly: string;
  price: string;
  mrp?: string;
  tag?: string;
  icon: LucideIcon;
  tone: string;
  images: string[];
  description: string;
  features: string[];
};

export const catalog: CatalogItem[] = [
  {
    brand: "Samsung",
    name: "Galaxy A57 5G",
    slug: "galaxy-a57-5g",
    category: "mobile",
    monthly: "₹2,326/mo",
    price: "₹49,999",
    mrp: "₹58,999",
    tag: "15% off",
    icon: Smartphone,
    tone: "bg-product-blue",
    images: ["/src/assets/galaxy-a57-product.png", "/src/assets/galaxy-a57-product.png", "/src/assets/galaxy-a57-product.png"],
    description: "The Samsung Galaxy A57 5G brings a premium mid-range experience with a smooth AMOLED display, improved performance and enhanced durability.",
    features: [
      "6.7-inch FHD+ Super AMOLED display with 120 Hz refresh rate",
      "Efficient performance for multitasking and gaming",
      "Triple rear camera setup with a 50 MP main sensor",
      "5000 mAh battery with 45 W fast charging",
      "Slim premium design with water and dust resistance",
      "5G, Wi-Fi and Bluetooth connectivity"
    ]
  },
  {
    brand: "Apple",
    name: "iPhone 18 Pro",
    slug: "iphone-18-pro",
    category: "mobile",
    monthly: "₹7,673/mo",
    price: "₹1,64,900",
    tag: "New Launch",
    icon: Smartphone,
    tone: "bg-product-coral",
    images: ["/src/assets/galaxy-a57-product.png"],
    description: "The ultimate iPhone with Titanium design and the fastest chip ever.",
    features: ["A19 Pro chip", "Pro Motion display", "48MP Main camera"]
  },
  {
    brand: "Sony",
    name: "WF-C510 Truly Wireless",
    slug: "sony-wf-c510",
    category: "audio",
    monthly: "₹209/mo",
    price: "₹4,500",
    mrp: "₹8,990",
    icon: Headphones,
    tone: "bg-muted",
    images: ["/src/assets/galaxy-a57-product.png"],
    description: "Compact, lightweight and high-quality sound for everyday listening.",
    features: ["DSEE™ upscaling", "360 Reality Audio", "IPX4 water resistance"]
  }
];

export const brands = ["Samsung", "Apple", "Google", "Sony", "Marshall", "Nothing"];
export const categories = [
  { label: "Mobile", icon: Smartphone, value: "mobile" },
  { label: "Audio", icon: Speaker, value: "audio" },
  { label: "Wearables", icon: Watch, value: "wearables" },
  { label: "Electronics", icon: Laptop, value: "electronics" },
  { label: "Footwear", icon: Footprints, value: "footwear" },
];
