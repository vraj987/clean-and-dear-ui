import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase,
  Dumbbell,
  Footprints,
  Headphones,
  Laptop,
  Play,
  Plug,
  ShoppingBag,
  Smartphone,
  Speaker,
  Star,
  Watch,
  WashingMachine,
} from "lucide-react";
import { useEffect, useState } from "react";
import heroImage from "@/assets/bytepe-hero.jpg";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageShell } from "@/components/shop/site-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BytePe — Latest Tech on Easy EMI" },
      { name: "description", content: "Shop phones, audio, wearables, footwear and more on simple monthly EMI at BytePe." },
      { property: "og:title", content: "BytePe — Latest Tech on Easy EMI" },
      { property: "og:description", content: "Latest phone, lowest EMI. Upgrade anytime with BytePe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Storefront,
});

const categories = [
  { label: "For You", icon: ShoppingBag },
  { label: "Mobile", icon: Smartphone },
  { label: "Audio", icon: Speaker },
  { label: "Accessories", icon: Plug },
  { label: "Luggage", icon: Briefcase },
  { label: "Wearables", icon: Watch },
  { label: "Sports", icon: Dumbbell },
  { label: "Appliances", icon: WashingMachine },
  { label: "Electronics", icon: Laptop },
  { label: "Footwear", icon: Footprints },
];

const banners = [
  { title: "AirPods 5", price: "₹693/mo | ₹14,900", cta: "BUY NOW", tone: "bg-hero" },
  { title: "Women Ankle Strap Pumps", price: "From ₹1,416", cta: "SHOP NOW", tone: "bg-product-coral" },
  { title: "vivo T5X 5G", price: "From ₹28,999", cta: "SHOP NOW", tone: "bg-product-sky" },
];

const brands = ["Apple", "SAMSUNG", "Google", "Marshall", "NOTHING", "mokobara", "motorola", "vivo", "EDT", "Assembly"];

type Item = { brand: string; name: string; monthly: string; price: string; mrp?: string; tag?: string; icon: typeof Smartphone; tone: string };

const sections: { title: string; items: Item[] }[] = [
  {
    title: "New Launches",
    items: [
      { brand: "Apple", name: "iPhone 18 Pro", monthly: "₹7,673/mo", price: "₹1,64,900", tag: "New Launch", icon: Smartphone, tone: "bg-product-coral" },
      { brand: "Apple", name: "iPhone 18 Pro Max", monthly: "₹8,371/mo", price: "₹1,79,900", tag: "New Launch", icon: Smartphone, tone: "bg-product-coral" },
      { brand: "Apple", name: "AirPods 5", monthly: "₹693/mo", price: "₹14,900", tag: "New Launch", icon: Headphones, tone: "bg-muted" },
      { brand: "Google", name: "Pixel 11", monthly: "₹3,839/mo", price: "₹82,499", mrp: "₹89,999", icon: Smartphone, tone: "bg-product-blue" },
      { brand: "Samsung", name: "Galaxy S26", monthly: "₹4,374/mo", price: "₹93,999", mrp: "₹1,17,999", icon: Smartphone, tone: "bg-product-lilac" },
    ],
  },
  {
    title: "Iconic Sounds",
    items: [
      { brand: "Sony", name: "WF-C510 Truly Wireless", monthly: "₹209/mo", price: "₹4,500", mrp: "₹8,990", icon: Headphones, tone: "bg-muted" },
      { brand: "Sennheiser", name: "ACCENTUM Open", monthly: "₹279/mo", price: "₹5,990", mrp: "₹12,990", icon: Headphones, tone: "bg-product-sun" },
      { brand: "Marshall", name: "Emberton III", monthly: "₹744/mo", price: "₹15,999", mrp: "₹17,999", icon: Speaker, tone: "bg-product-sage" },
      { brand: "Marshall", name: "Major V", monthly: "₹605/mo", price: "₹12,999", mrp: "₹14,999", icon: Headphones, tone: "bg-product-coral" },
      { brand: "Samsung", name: "Galaxy Buds4", monthly: "₹791/mo", price: "₹16,999", mrp: "₹22,999", icon: Headphones, tone: "bg-product-sky" },
    ],
  },
  {
    title: "Stylish Footwear",
    items: [
      { brand: "Clog London", name: "Women Trendy Heels", monthly: "₹80/mo", price: "₹1,709", mrp: "₹2,799", icon: Footprints, tone: "bg-product-coral" },
      { brand: "Clog London", name: "Men's Solid Brown", monthly: "₹154/mo", price: "₹3,299", mrp: "₹5,699", icon: Footprints, tone: "bg-product-sun" },
      { brand: "Clog London", name: "Blue Sneakers", monthly: "₹80/mo", price: "₹1,729", mrp: "₹3,399", icon: Footprints, tone: "bg-product-blue" },
      { brand: "Clog London", name: "Women Kitten Heel", monthly: "₹73/mo", price: "₹1,574", mrp: "₹2,499", icon: Footprints, tone: "bg-product-lilac" },
      { brand: "Clog London", name: "Stylish Men's Sneaker", monthly: "₹80/mo", price: "₹1,729", mrp: "₹3,399", icon: Footprints, tone: "bg-product-sage" },
    ],
  },
];

const trending = ["Fitbit Charge 6", "Yonex", "Pixel 11", "Galaxy Buds 4 Pro"];
const different = ["Latest Phone, Lowest EMI", "New Phone Every Year", "BytePe Subscription", "Always the Latest", "Zero Cost Store"];
const reviews = [
  { title: "Got my MacBook without financial stress", text: "The approval process was quick and seamless.", name: "Aanya Sharma" },
  { title: "Upgrade without the hassle", text: "With BytePe, I don't even think about it. Just upgrade and continue.", name: "Aditya Singh" },
  { title: "I bought my iPhone with pocket money", text: "Never thought I could afford an iPhone. BytePe EMIs made it vibe!", name: "Kshitiz" },
  { title: "Love the flexibility", text: "I can decide later if I want to keep, return, or upgrade.", name: "Richa" },
];

function Storefront() {
  const [active, setActive] = useState("For You");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, []);

  const banner = banners[slide] ?? banners[0]!;

  return (
    <PageShell>
      <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-8">
        {/* Banner */}
        <section className={cn("relative h-72 overflow-hidden rounded-3xl md:h-[330px]", banner.tone)}>
          {slide === 0 && <img src={heroImage} alt="" className="absolute inset-0 size-full object-cover" />}
          <div
            className="relative flex h-full flex-col justify-center gap-4 p-8 md:p-16"
            style={{ background: "var(--hero-overlay)" }}
          >
            <h2 className="text-3xl text-foreground md:text-4xl">{banner.title}</h2>
            <p className="text-2xl font-bold text-foreground md:text-4xl">{banner.price}</p>
            <Button asChild variant="hero" className="w-fit rounded-full px-8"><Link to="/products">{banner.cta}</Link></Button>
          </div>
        </section>
        <div className="mt-4 flex justify-center gap-1.5">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`}
              className={cn("h-1 rounded-full", i === slide ? "w-8 bg-primary" : "w-3 bg-border")} />
          ))}
        </div>

        {/* Brands */}
        <section className="mt-10 flex gap-4 overflow-x-auto pb-2">
          {brands.map((b) => (
            <div key={b} className="grid size-28 shrink-0 place-items-center rounded-full bg-muted text-lg font-bold">{b}</div>
          ))}
        </section>

        {sections.map((s) => (
          <section key={s.title} className="mt-12">
            <h2 className="mb-5 font-display text-3xl">{s.title}</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {s.items.map((p) => (
                <article key={p.name} className="w-60 shrink-0">
                  <div className={cn("relative grid h-52 place-items-center rounded-lg", p.tone)}>
                    {p.tag && <span className="absolute left-2 top-3 rounded-md bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">{p.tag}</span>}
                    <p.icon className="size-24 stroke-[1]" />
                  </div>
                  <div className="px-2 pt-3 text-sm">
                    <p className="truncate"><b>{p.brand}</b> {p.name}</p>
                    <p className="text-xs">From <span className="font-semibold text-primary">{p.monthly}</span></p>
                    <p className="text-xs font-semibold">{p.price} {p.mrp && <s className="font-normal text-muted-foreground">{p.mrp}</s>}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* Promo grid */}
        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { t: "iPhone 18 Pro", s: "Now on easy EMI", tone: "bg-product-coral", tall: true },
            { t: "Flip it, Fold 8", s: "Free Wireless Charging Pad", tone: "bg-product-lilac" },
            { t: "Macbook Air M5", s: "Upto Rs.30,000 off", tone: "bg-product-blue" },
          ].map((c) => (
            <div key={c.t} className={cn("flex h-72 items-end rounded-md p-5 md:h-96", c.tone)}>
              <div><h3 className="text-xl font-bold">{c.t}</h3><p className="text-sm">{c.s}</p></div>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="mb-5 font-display text-3xl">What's Trending</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {trending.map((t, i) => (
              <div key={t} className={cn("relative grid h-48 w-80 shrink-0 place-items-center rounded-2xl", ["bg-product-sage", "bg-muted", "bg-product-lilac", "bg-product-sky"][i])}>
                <span className="grid size-12 place-items-center rounded-full bg-hero-overlay text-primary-foreground"><Play className="size-5" /></span>
                <span className="absolute bottom-3 left-3 text-sm font-medium">{t}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-5 font-display text-3xl">Curious? Here's what makes us different</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {different.map((d, i) => (
              <div key={d} className={cn("relative grid h-96 w-64 shrink-0 place-items-center rounded-2xl", ["bg-product-sage", "bg-product-sun", "bg-product-coral", "bg-product-sky", "bg-product-lilac"][i])}>
                <span className="grid size-12 place-items-center rounded-full bg-hero-overlay text-primary-foreground"><Play className="size-5" /></span>
                <span className="absolute bottom-4 left-4 text-sm font-medium">{d}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-5 font-display text-3xl">Straight from the customers</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reviews.map((r) => (
              <div key={r.name} className="flex h-96 flex-col justify-end rounded-2xl bg-hero p-6 text-foreground">
                <h3 className="font-display text-2xl">{r.title}</h3>
                <p className="mt-2 text-xs opacity-80">{r.text}</p>
                <p className="mt-3 text-sm font-semibold">{r.name}</p>
                <div className="mt-1 flex gap-0.5 text-product-sun">{[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-current" />)}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
