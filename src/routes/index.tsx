import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronRight,
  CircleUserRound,
  Headphones,
  Heart,
  Laptop,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Truck,
  Watch,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import heroImage from "@/assets/bytepe-hero.jpg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BytePe — Smart Tech, Easy Monthly Plans" },
      {
        name: "description",
        content: "Shop phones, audio, wearables and laptops with simple monthly plans at BytePe.",
      },
      { property: "og:title", content: "BytePe — Smart Tech, Easy Monthly Plans" },
      {
        property: "og:description",
        content: "Discover popular tech with simple prices and flexible monthly plans.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Storefront,
});

type Product = {
  name: string;
  brand: string;
  category: string;
  price: string;
  mrp: string;
  monthly: string;
  discount: string;
  icon: typeof Smartphone;
  tone: string;
};

const categories = [
  { label: "For You", icon: Zap },
  { label: "Mobiles", icon: Smartphone },
  { label: "Audio", icon: Headphones },
  { label: "Wearables", icon: Watch },
  { label: "Laptops", icon: Laptop },
];

const products: Product[] = [
  { name: "Galaxy S26", brand: "Samsung", category: "Mobiles", price: "₹79,999", mrp: "₹89,999", monthly: "₹3,749/mo", discount: "11% off", icon: Smartphone, tone: "bg-product-coral" },
  { name: "iPhone 17 Air", brand: "Apple", category: "Mobiles", price: "₹94,900", mrp: "₹99,900", monthly: "₹4,395/mo", discount: "5% off", icon: Smartphone, tone: "bg-product-blue" },
  { name: "QuietComfort Ultra", brand: "Bose", category: "Audio", price: "₹29,999", mrp: "₹35,900", monthly: "₹1,399/mo", discount: "16% off", icon: Headphones, tone: "bg-product-sage" },
  { name: "Watch Series 11", brand: "Apple", category: "Wearables", price: "₹46,900", mrp: "₹49,900", monthly: "₹2,182/mo", discount: "6% off", icon: Watch, tone: "bg-product-lilac" },
  { name: "MacBook Air M5", brand: "Apple", category: "Laptops", price: "₹1,09,900", mrp: "₹1,19,900", monthly: "₹5,095/mo", discount: "8% off", icon: Laptop, tone: "bg-product-sky" },
  { name: "Buds 4 Pro", brand: "Samsung", category: "Audio", price: "₹14,999", mrp: "₹18,999", monthly: "₹699/mo", discount: "21% off", icon: Headphones, tone: "bg-product-sun" },
];

function Storefront() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("For You");
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const inCategory = activeCategory === "For You" || product.category === activeCategory;
      const matchesQuery = !normalized || `${product.brand} ${product.name}`.toLowerCase().includes(normalized);
      return inCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 md:px-8">
          <a href="#top" aria-label="BytePe home" className="font-display flex size-12 shrink-0 items-center justify-center rounded-full bg-logo text-center text-xs font-bold leading-3 text-logo-foreground">
            Byte<br />Pe
          </a>
          <label className="relative flex min-w-0 flex-1 md:max-w-md">
            <span className="sr-only">Search products</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands…" className="h-11 w-full rounded-full bg-muted px-5 pr-11 text-sm outline-none ring-ring placeholder:text-muted-foreground focus:ring-2" />
            <Search className="pointer-events-none absolute right-4 top-3 size-5 text-muted-foreground" aria-hidden="true" />
          </label>
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
            <a className="text-sm font-semibold text-primary" href="#top">Home</a>
            <a className="text-sm font-medium text-muted-foreground hover:text-foreground" href="#products">Products</a>
            <a className="text-sm font-medium text-muted-foreground hover:text-foreground" href="#benefits">Why BytePe</a>
          </nav>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex" aria-label="Account"><CircleUserRound className="size-5" /></Button>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex" aria-label="Shopping bag"><ShoppingBag className="size-5" /></Button>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
        {menuOpen && (
          <nav className="border-t border-border px-4 py-4 lg:hidden" aria-label="Mobile navigation">
            <div className="mx-auto grid max-w-7xl gap-1">
              {["Home", "Products", "Why BytePe"].map((item) => <a key={item} href={item === "Home" ? "#top" : item === "Products" ? "#products" : "#benefits"} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-3 text-sm font-semibold hover:bg-muted">{item}</a>)}
            </div>
          </nav>
        )}
      </header>

      <main id="top">
        <div className="border-b border-border">
          <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-4 md:justify-center md:px-8">
            {categories.map(({ label, icon: Icon }) => {
              const active = activeCategory === label;
              return (
                <button key={label} onClick={() => setActiveCategory(label)} className={cn("flex min-w-22 flex-col items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors", active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                  <Icon className="size-5" aria-hidden="true" />{label}
                </button>
              );
            })}
          </div>
        </div>

        <section className="mx-auto max-w-7xl px-4 pb-6 pt-5 md:px-8 md:pt-8">
          <div className="relative min-h-105 overflow-hidden rounded-card bg-hero md:min-h-112">
            <img src={heroImage} alt="Coral smartphone and wireless earbuds" width={1536} height={864} className="absolute inset-0 size-full object-cover object-[68%_center] md:object-center" />
            <div className="absolute inset-0 bg-hero-overlay" />
            <div className="relative z-10 flex min-h-105 max-w-xl flex-col justify-center px-7 py-12 md:min-h-112 md:px-14">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">New on BytePe</p>
              <h1 className="font-display max-w-56 text-4xl font-semibold leading-tight md:max-w-none md:text-6xl">Big tech.<br />Smaller monthly plans.</h1>
              <p className="mt-4 max-w-55 text-base leading-7 text-foreground/70 md:max-w-sm">Get the latest phones and audio without paying it all at once.</p>
              <div className="mt-7 flex items-center gap-4">
                <Button onClick={() => document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" })}>Shop now <ChevronRight className="size-4" /></Button>
                <span className="text-sm font-semibold">From ₹699/mo</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12" id="products">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Curated for you</p><h2 className="font-display text-3xl font-semibold md:text-4xl">Popular right now</h2></div>
            <span className="hidden text-sm text-muted-foreground sm:block">{visibleProducts.length} products</span>
          </div>
          {visibleProducts.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {visibleProducts.map((product) => <ProductCard key={product.name} product={product} />)}
            </div>
          ) : (
            <div className="rounded-card border border-border py-20 text-center"><Search className="mx-auto mb-4 size-7 text-muted-foreground" /><p className="font-semibold">No products found</p><p className="mt-1 text-sm text-muted-foreground">Try another search or category.</p></div>
          )}
        </section>

        <section id="benefits" className="bg-muted">
          <div className="mx-auto grid max-w-7xl gap-px px-4 py-12 md:grid-cols-3 md:px-8">
            <Benefit icon={Zap} title="Zero-cost plans" text="Clear monthly payments with no surprises." />
            <Benefit icon={ShieldCheck} title="Protected purchases" text="Reliable support from order to delivery." />
            <Benefit icon={Truck} title="Fast delivery" text="Service across 100+ cities in India." />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <p className="font-display mb-7 text-center text-2xl font-semibold">Our partners</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-sm font-bold text-muted-foreground md:gap-x-16">
            <span>HDFC BANK</span><span>Uni</span><span>PayU</span><span>razorpay</span><span>LazyPay</span>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-9 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-3"><span className="font-display flex size-9 items-center justify-center rounded-full bg-logo text-xs font-bold text-logo-foreground">BP</span><span>Tech made easier.</span></div>
          <div className="flex flex-wrap gap-x-6 gap-y-2"><a href="#top" className="hover:text-foreground">About</a><a href="#top" className="hover:text-foreground">Privacy</a><a href="#top" className="hover:text-foreground">Support</a></div>
          <p>© 2026 BytePe</p>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const Icon = product.icon;
  return (
    <article className="group overflow-hidden rounded-card border border-border bg-card transition-shadow hover:shadow-card">
      <div className={cn("relative flex aspect-square items-center justify-center", product.tone)}>
        <Icon className="size-20 stroke-1 text-foreground/75 transition-transform duration-300 group-hover:scale-105 md:size-28" aria-hidden="true" />
        <span className="absolute left-3 top-3 rounded-full bg-success-soft px-2.5 py-1 text-xs font-bold text-success">{product.discount}</span>
        <Button variant="hero" size="icon" className="absolute right-3 top-3 size-9 rounded-full" aria-label={`Save ${product.name}`}><Heart className="size-4" /></Button>
      </div>
      <div className="p-4 md:p-5">
        <p className="text-xs font-medium text-muted-foreground">{product.brand}</p>
        <h3 className="mt-1 min-h-10 text-sm font-bold leading-5 md:text-base">{product.name}</h3>
        <div className="mt-3 flex flex-wrap items-baseline gap-2"><span className="text-sm font-bold md:text-base">{product.price}</span><span className="text-xs text-muted-foreground line-through">{product.mrp}</span></div>
        <p className="mt-2 text-xs font-bold text-primary">From {product.monthly}</p>
      </div>
    </article>
  );
}

function Benefit({ icon: Icon, title, text }: { icon: typeof Zap; title: string; text: string }) {
  return <div className="flex gap-4 border-b border-border py-6 md:border-b-0 md:border-r md:px-8 md:last:border-r-0"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><Icon className="size-5" /></span><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div></div>;
}