import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Box, CheckCircle2, Heart, PackageCheck, Share2, ShieldCheck, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import phoneImage from "@/assets/galaxy-a57-product.png";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$slug")({
  beforeLoad: ({ params }) => { if (!params.slug) throw notFound(); },
  head: () => ({ meta: [
    { title: "Samsung Galaxy A57 5G — BytePe" },
    { name: "description", content: "Explore the Samsung Galaxy A57 5G, choose your configuration and buy on easy EMI." },
    { property: "og:title", content: "Samsung Galaxy A57 5G — BytePe" },
    { property: "og:description", content: "Premium 5G phone with flexible monthly EMI plans." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: ProductDetail,
});

const offers = ["Axis Bank", "ICICI Bank", "HDFC Bank"];
const features = ["6.7-inch FHD+ Super AMOLED display with 120 Hz refresh rate", "Efficient performance for multitasking and gaming", "Triple rear camera setup with a 50 MP main sensor", "5000 mAh battery with 45 W fast charging", "Slim premium design with water and dust resistance", "5G, Wi-Fi and Bluetooth connectivity"];

function ProductDetail() {
  const [color, setColor] = useState("Iceblue");
  const [ram, setRam] = useState("8GB");
  const [tab, setTab] = useState("Description");
  return <PageShell compactHeader>
    <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,1fr)]">
        <section className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative grid min-h-[430px] place-items-center rounded-card bg-muted p-6 md:min-h-[620px]"><img src={phoneImage} alt="Ice-blue Galaxy A57 5G shown from front and back" width={1200} height={1200} className="max-h-[570px] w-full object-contain" /><div className="absolute right-3 top-3 flex gap-2"><Button size="icon" variant="outline" aria-label="Share"><Share2 className="size-4" /></Button><Button size="icon" variant="outline" aria-label="Add to wishlist"><Heart className="size-4" /></Button></div></div>
          <div className="mt-3 flex justify-center gap-2"><span className="h-1.5 w-6 rounded-full bg-primary" /><span className="size-1.5 rounded-full bg-border" /><span className="size-1.5 rounded-full bg-border" /></div>
        </section>
        <section>
          <h1 className="font-display text-3xl">Samsung Galaxy A57 5G</h1><div className="mt-2 flex flex-wrap items-center gap-3"><b className="text-2xl">₹49,999</b><s className="text-muted-foreground">₹58,999</s><span className="rounded bg-success px-2 py-1 text-xs font-semibold text-primary-foreground">15% off</span></div><p className="mt-1 text-sm">EMI From <b className="text-primary">₹2,326/mo</b></p>
          <div className="mt-6"><p className="text-sm">Color - Awesome {color}</p><div className="mt-3 flex gap-3">{["Iceblue", "Lavender", "Graphite"].map((value) => <Button key={value} variant="outline" size="icon" onClick={() => setColor(value)} aria-label={value} className={cn("rounded-full", color === value && "ring-2 ring-primary")}><span className={cn("size-7 rounded-full", value === "Iceblue" ? "bg-product-blue" : value === "Lavender" ? "bg-product-lilac" : "bg-logo")} /></Button>)}</div></div>
          <div className="mt-5"><p className="text-sm">Storage</p><Button className="mt-2 rounded-full bg-logo hover:bg-logo">256GB</Button></div>
          <div className="mt-5"><p className="text-sm">RAM</p><div className="mt-2 flex gap-2">{["8GB", "12GB"].map((value) => <Button key={value} variant={ram === value ? "default" : "outline"} className={cn("rounded-full", ram === value && "bg-logo hover:bg-logo")} onClick={() => setRam(value)}>{value}</Button>)}</div></div>
          <div className="mt-7 rounded-card border border-primary p-4"><div className="flex justify-between text-sm"><span><b className="text-primary">●</b> EMI<br /><small className="ml-4 text-muted-foreground">No Cost EMI</small></span><b>₹2,326 x 24mo</b></div><div className="mt-4 grid gap-2 sm:grid-cols-3">{offers.map((offer) => <div key={offer} className="rounded-md border border-border p-3"><b>₹2,500 Off</b><p className="text-xs text-muted-foreground">{offer}</p><button className="mt-2 text-xs font-semibold text-primary">Apply</button></div>)}</div></div>
          <div className="mt-4 flex items-center justify-between border-y border-border py-5"><div><span className="text-xs text-muted-foreground">EMI</span><p className="text-xl font-semibold">₹2,326 x 24mo</p></div><Button asChild className="w-56 rounded-full"><Link to="/cart"><ShoppingCart className="size-4" />Buy Now</Link></Button></div>
          <div className="mt-6"><h2 className="font-display text-2xl">Delivery details</h2><p className="mt-2 text-sm text-muted-foreground">Orders are checked at delivery so you can verify the product is genuine, undamaged and in perfect working condition.</p><div className="mt-5 flex gap-4 rounded-card bg-muted p-5"><Box className="size-6 text-primary" /><div><b>Open Box Delivery for Your Peace of Mind</b><p className="mt-1 text-xs text-muted-foreground">Your order will be opened in your presence at delivery.</p></div></div></div>
          <div className="mt-5 rounded-card border border-primary p-5"><h3 className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-5 text-success" />BytePe Verified</h3><div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs"><div><ShieldCheck className="mx-auto mb-2 text-primary" />Authorised Seller</div><div><Star className="mx-auto mb-2 text-primary" />Top Rated</div><div><PackageCheck className="mx-auto mb-2 text-primary" />Brand New</div></div></div>
        </section>
      </div>
      <section className="mt-16"><h2 className="font-display text-2xl">All Details</h2><div className="mt-4 flex gap-6 border-b border-border">{["Description", "Specifications"].map((value) => <button key={value} onClick={() => setTab(value)} className={cn("border-b-2 pb-3 text-sm", tab === value ? "border-primary font-semibold" : "border-transparent text-muted-foreground")}>{value}</button>)}</div>{tab === "Description" ? <div className="py-5 text-sm"><p>The Samsung Galaxy A57 5G brings a premium mid-range experience with a smooth AMOLED display, improved performance and enhanced durability.</p><ul className="mt-5 list-disc space-y-1 pl-5">{features.map((feature) => <li key={feature}>{feature}</li>)}</ul></div> : <div className="grid gap-3 py-5 text-sm sm:grid-cols-2"><p><b>Display:</b> 6.7-inch AMOLED</p><p><b>Battery:</b> 5000 mAh</p><p><b>Storage:</b> 256GB</p><p><b>RAM:</b> {ram}</p></div>}</section>
    </main>
  </PageShell>;
}
