import catalogProducts from "@/assets/catalog-products.jpg";
import phoneBlue from "@/assets/phone-blue-gallery.jpg";

export type CatalogItem = {
  brand: string;
  name: string;
  slug: string;
  category: "Mobile" | "Audio" | "Electronics";
  monthly: string;
  price: string;
  mrp?: string;
  tag?: string;
  rating: number;
  image: string;
  imagePosition?: string;
  tone: string;
  storage: string[];
};

export const catalog: CatalogItem[] = [
  { brand: "Samsung", name: "Galaxy A57 5G", slug: "galaxy-a57-5g", category: "Mobile", monthly: "₹2,326/mo", price: "₹49,999", mrp: "₹58,999", tag: "15% off", rating: 4.8, image: phoneBlue, tone: "bg-product-blue", storage: ["128GB", "256GB"] },
  { brand: "Apple", name: "iPhone 18 Pro", slug: "iphone-18-pro", category: "Mobile", monthly: "₹7,673/mo", price: "₹1,64,900", tag: "New Launch", rating: 4.9, image: catalogProducts, imagePosition: "14% 20%", tone: "bg-product-coral", storage: ["256GB", "512GB", "1TB"] },
  { brand: "Google", name: "Pixel 11", slug: "pixel-11", category: "Mobile", monthly: "₹3,839/mo", price: "₹82,499", mrp: "₹89,999", rating: 4.7, image: catalogProducts, imagePosition: "76% 20%", tone: "bg-product-sky", storage: ["128GB", "256GB"] },
  { brand: "Sony", name: "WF-C510 Truly Wireless", slug: "sony-wf-c510", category: "Audio", monthly: "₹209/mo", price: "₹4,500", mrp: "₹8,990", tag: "49% off", rating: 4.6, image: catalogProducts, imagePosition: "22% 82%", tone: "bg-muted", storage: ["Standard"] },
  { brand: "Marshall", name: "Emberton III", slug: "marshall-emberton-iii", category: "Audio", monthly: "₹744/mo", price: "₹15,999", mrp: "₹17,999", rating: 4.8, image: catalogProducts, imagePosition: "78% 82%", tone: "bg-product-sage", storage: ["Standard"] },
  { brand: "Samsung", name: "Galaxy S26 Ultra", slug: "galaxy-s26-ultra", category: "Mobile", monthly: "₹6,282/mo", price: "₹1,34,999", mrp: "₹1,49,999", tag: "10% off", rating: 4.9, image: catalogProducts, imagePosition: "76% 20%", tone: "bg-muted", storage: ["256GB", "512GB"] },
  { brand: "Apple", name: "MacBook Neo", slug: "macbook-neo", category: "Electronics", monthly: "₹3,252/mo", price: "₹69,999", tag: "Popular", rating: 4.7, image: catalogProducts, imagePosition: "14% 20%", tone: "bg-product-sun", storage: ["256GB", "512GB"] },
  { brand: "Nothing", name: "Phone 4a", slug: "nothing-phone-4a", category: "Mobile", monthly: "₹1,912/mo", price: "₹41,099", rating: 4.5, image: catalogProducts, imagePosition: "76% 20%", tone: "bg-product-lilac", storage: ["128GB", "256GB"] },
];

export const brands = ["Apple", "Samsung", "Google", "Marshall", "Sony", "Nothing"];
export const categories = ["Mobile", "Audio", "Electronics"] as const;

export function getProduct(slug: string) {
  return catalog.find((product) => product.slug === slug);
}