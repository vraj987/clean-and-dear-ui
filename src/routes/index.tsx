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
import { PageShell } from "@/components/shop/site-shell";
import { catalog, categories as categoriesData } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BytePe — Latest Tech on Easy EMI" },
      { name: "description", content: "Shop phones, audio, wearables, footwear and more on simple monthly EMI at BytePe." },
    ],
  }),
  component: Storefront,
});

const banners = [
  { title: "AirPods 5", price: "₹693/mo | ₹14,900", cta: "BUY NOW", tone: "bg-hero" },
  { title: "Women Ankle Strap Pumps", price: "From ₹1,416", cta: "SHOP NOW", tone: "bg-product-coral" },
  { title: "vivo T5X 5G", price: "From ₹28,999", cta: "SHOP NOW", tone: "bg-product-sky" },
];

const brands = ["Apple", "Samsung", "Google", "Marshall", "Nothing", "Sony"];

function Storefront() {
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

        {/* Categories */}
        <section className="mt-10">
          <h2 className="mb-5 font-display text-2xl">Shop by Category</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {categoriesData.map((c) => (
              <Link 
                key={c.value} 
                to="/products" 
                search={{ category: c.value }}
                className="flex min-w-[100px] flex-col items-center gap-2 transition-transform hover:scale-105"
              >
                <div className="grid size-16 place-items-center rounded-2xl bg-muted">
                  <c.icon className="size-8 text-primary" />
                </div>
                <span className="text-xs font-medium">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Brands */}
        <section className="mt-10">
          <h2 className="mb-5 font-display text-2xl">Top Brands</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {brands.map((b) => (
              <Link key={b} to="/products" search={{ brand: b }} className="grid size-28 shrink-0 place-items-center rounded-full bg-muted text-lg font-bold hover:bg-muted/80 transition-colors">
                {b}
              </Link>
            ))}
          </div>
        </section>

        {/* New Launches */}
        <section className="mt-12">
          <h2 className="mb-5 font-display text-3xl">New Launches</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {catalog.map((p) => (
              <Link key={p.slug} to="/products/$slug" params={{ slug: p.slug }} className="w-60 shrink-0">
                <article>
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
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <h2 className="mb-5 font-display text-3xl text-center">Why BytePe?</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Latest Phone, Lowest EMI", s: "Get the newest tech without the sting." },
              { t: "New Phone Every Year", s: "Upgrade cycle that keeps you current." },
              { t: "Zero Cost Store", s: "No hidden charges, just transparent EMIs." },
              { t: "Verified Products", s: "100% genuine with brand warranty." },
            ].map((d) => (
              <div key={d.t} className="rounded-2xl bg-muted p-6">
                <h3 className="text-lg font-bold">{d.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d.s}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
