import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Footprints,
  Headphones,
  Play,
  ShieldCheck,
  Smartphone,
  Speaker,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import heroImage from "@/assets/bytepe-hero.jpg";
import subscriptionPhones from "@/assets/subscription-phones.jpg";
import laptopBanner from "@/assets/laptop-banner.jpg";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageShell } from "@/components/shop/site-shell";
import { catalog } from "@/lib/catalog";
import { getBanners } from "@/services/api/banner.service";
import { getBrands } from "@/services/api/brand.service";
import { getCategories } from "@/services/api/category.service";
import { getPackages } from "@/services/api/package.service";
import type { BannerRecord, BrandRecord, CategoryRecord, PackageRecord } from "@/services/api/models";
import { ApiStatusError } from "@/services/api/client";
import {
  checkSavedSession,
  clearAuthSession,
  clearSavedAccountData,
  readAuthSession,
} from "@/services/api/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BytePe — Latest Tech on Easy EMI" },
      {
        name: "description",
        content:
          "Shop phones, audio, wearables, footwear and more on simple monthly EMI at BytePe.",
      },
      { property: "og:title", content: "BytePe — Latest Tech on Easy EMI" },
      {
        property: "og:description",
        content: "Latest phone, lowest EMI. Upgrade anytime with BytePe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Storefront,
});

const banners = [
  {
    title: "AirPods 5",
    price: "₹693/mo | ₹14,900",
    cta: "BUY NOW",
    tone: "bg-hero",
    slug: "airpods-5",
  },
  {
    title: "Women Ankle Strap Pumps",
    price: "From ₹1,416",
    cta: "SHOP NOW",
    tone: "bg-product-coral",
    slug: "women-trendy-heels",
  },
  {
    title: "vivo T5X 5G",
    price: "From ₹28,999",
    cta: "SHOP NOW",
    tone: "bg-product-sky",
    slug: "vivo-t5x-5g",
  },
];

const middleBanners = [
  {
    title: "A little more freedom with every upgrade",
    copy: "Choose a phone plan that moves with you — upgrade, keep or return when it suits you.",
    image: subscriptionPhones,
    to: "/subscription" as const,
    cta: "Explore subscription",
  },
  {
    title: "Big-screen ideas, easy monthly plans",
    copy: "Find a laptop for your next project and bring home more without the big upfront spend.",
    image: laptopBanner,
    to: "/products" as const,
    cta: "Browse electronics",
  },
  {
    title: "Your next everyday essential is closer",
    copy: "Explore phones, audio, wearables and more from brands you already love.",
    image: heroImage,
    to: "/products" as const,
    cta: "Shop all products",
  },
];

const brands = [
  "Apple",
  "SAMSUNG",
  "Google",
  "Marshall",
  "NOTHING",
  "mokobara",
  "motorola",
  "vivo",
  "EDT",
  "Assembly",
];

const stealDealSlugs = [
  "iphone-18-pro",
  "iphone-18-pro-max",
  "airpods-5",
  "sony-wf-c510",
  "pixel-11",
  "galaxy-s26-ultra",
];

type Item = {
  brand: string;
  name: string;
  monthly: string;
  price: string;
  mrp?: string;
  tag?: string;
  icon: typeof Smartphone;
  tone: string;
};

const sections: { title: string; items: Item[] }[] = [
  {
    title: "New Launches",
    items: [
      {
        brand: "Apple",
        name: "iPhone 18 Pro",
        monthly: "₹7,673/mo",
        price: "₹1,64,900",
        tag: "New Launch",
        icon: Smartphone,
        tone: "bg-product-coral",
      },
      {
        brand: "Apple",
        name: "iPhone 18 Pro Max",
        monthly: "₹8,371/mo",
        price: "₹1,79,900",
        tag: "New Launch",
        icon: Smartphone,
        tone: "bg-product-coral",
      },
      {
        brand: "Apple",
        name: "AirPods 5",
        monthly: "₹693/mo",
        price: "₹14,900",
        tag: "New Launch",
        icon: Headphones,
        tone: "bg-muted",
      },
      {
        brand: "Google",
        name: "Pixel 11",
        monthly: "₹3,839/mo",
        price: "₹82,499",
        mrp: "₹89,999",
        icon: Smartphone,
        tone: "bg-product-blue",
      },
      {
        brand: "Samsung",
        name: "Galaxy S26",
        monthly: "₹4,374/mo",
        price: "₹93,999",
        mrp: "₹1,17,999",
        icon: Smartphone,
        tone: "bg-product-lilac",
      },
    ],
  },
  {
    title: "Iconic Sounds",
    items: [
      {
        brand: "Sony",
        name: "WF-C510 Truly Wireless",
        monthly: "₹209/mo",
        price: "₹4,500",
        mrp: "₹8,990",
        icon: Headphones,
        tone: "bg-muted",
      },
      {
        brand: "Sennheiser",
        name: "ACCENTUM Open",
        monthly: "₹279/mo",
        price: "₹5,990",
        mrp: "₹12,990",
        icon: Headphones,
        tone: "bg-product-sun",
      },
      {
        brand: "Marshall",
        name: "Emberton III",
        monthly: "₹744/mo",
        price: "₹15,999",
        mrp: "₹17,999",
        icon: Speaker,
        tone: "bg-product-sage",
      },
      {
        brand: "Marshall",
        name: "Major V",
        monthly: "₹605/mo",
        price: "₹12,999",
        mrp: "₹14,999",
        icon: Headphones,
        tone: "bg-product-coral",
      },
      {
        brand: "Samsung",
        name: "Galaxy Buds4",
        monthly: "₹791/mo",
        price: "₹16,999",
        mrp: "₹22,999",
        icon: Headphones,
        tone: "bg-product-sky",
      },
    ],
  },
  {
    title: "Stylish Footwear",
    items: [
      {
        brand: "Clog London",
        name: "Women Trendy Heels",
        monthly: "₹80/mo",
        price: "₹1,709",
        mrp: "₹2,799",
        icon: Footprints,
        tone: "bg-product-coral",
      },
      {
        brand: "Clog London",
        name: "Men's Solid Brown",
        monthly: "₹154/mo",
        price: "₹3,299",
        mrp: "₹5,699",
        icon: Footprints,
        tone: "bg-product-sun",
      },
      {
        brand: "Clog London",
        name: "Blue Sneakers",
        monthly: "₹80/mo",
        price: "₹1,729",
        mrp: "₹3,399",
        icon: Footprints,
        tone: "bg-product-blue",
      },
      {
        brand: "Clog London",
        name: "Women Kitten Heel",
        monthly: "₹73/mo",
        price: "₹1,574",
        mrp: "₹2,499",
        icon: Footprints,
        tone: "bg-product-lilac",
      },
      {
        brand: "Clog London",
        name: "Stylish Men's Sneaker",
        monthly: "₹80/mo",
        price: "₹1,729",
        mrp: "₹3,399",
        icon: Footprints,
        tone: "bg-product-sage",
      },
    ],
  },
];

const trending = [
  { name: "Fitbit Charge 6", slug: "fitbit-charge-6" },
  { name: "Yonex", slug: "yonex-eclipsion" },
  { name: "Pixel 11", slug: "pixel-11" },
  { name: "Galaxy Buds4", slug: "galaxy-buds4" },
];
const different = [
  "Latest Phone, Lowest EMI",
  "New Phone Every Year",
  "BytePe Subscription",
  "Always the Latest",
  "Zero Cost Store",
];
const reviews = [
  {
    title: "Got my MacBook without financial stress",
    text: "The approval process was quick and seamless.",
    name: "Aanya Sharma",
  },
  {
    title: "Upgrade without the hassle",
    text: "With BytePe, I don't even think about it. Just upgrade and continue.",
    name: "Aditya Singh",
  },
  {
    title: "I bought my iPhone with pocket money",
    text: "Never thought I could afford an iPhone. BytePe EMIs made it vibe!",
    name: "Kshitiz",
  },
  {
    title: "Love the flexibility",
    text: "I can decide later if I want to keep, return, or upgrade.",
    name: "Richa",
  },
];

function homePackageDescription(description: string | undefined) {
  return (description ?? "")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<\/p\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function Storefront() {
  const [slide, setSlide] = useState(0);
  const [middleSlide, setMiddleSlide] = useState(0);
  const [apiBanners, setApiBanners] = useState<BannerRecord[]>([]);
  const [apiBrands, setApiBrands] = useState<BrandRecord[]>([]);
  const [apiCategories, setApiCategories] = useState<CategoryRecord[]>([]);
  const [apiPackages, setApiPackages] = useState<PackageRecord[]>([]);

  useEffect(() => {
    let active = true;
    void Promise.allSettled([getBanners(), getBrands(), getCategories(), getPackages()]).then((results) => {
      if (!active) return;
      if (results[0]?.status === "fulfilled") setApiBanners(results[0].value);
      if (results[1]?.status === "fulfilled") setApiBrands(results[1].value);
      if (results[2]?.status === "fulfilled") setApiCategories(results[2].value);
      if (results[3]?.status === "fulfilled") setApiPackages(results[3].value);
    });
    const session = readAuthSession();
    if (session) {
      void checkSavedSession(session).catch((error: unknown) => {
        if (error instanceof ApiStatusError) {
          if (String(error.status) === "3") clearSavedAccountData();
          else clearAuthSession();
        }
      });
    }
    return () => {
      active = false;
    };
  }, []);

  const homeBanners = apiBanners.length
    ? [...apiBanners]
        .sort((a, b) => Number(a.banner_priority) - Number(b.banner_priority))
        .map((item) => ({
          title: item.banner_name,
          price: "Explore the latest collection",
          cta: "SHOP NOW",
          tone: "bg-hero",
          slug: "iphone-18-pro",
          image: item.banner_image_url,
        }))
    : banners.map((item) => ({ ...item, image: "" }));

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % homeBanners.length), 4000);
    return () => clearInterval(t);
  }, [homeBanners.length]);

  const banner = homeBanners[slide] ?? homeBanners[0]!;

  return (
    <PageShell>
      <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-8">
        {/* Banner */}
        <section
          className={cn("relative h-72 overflow-hidden rounded-3xl md:h-[330px]", banner.tone)}
        >
          {(banner.image || slide === 0) && (
            <img
              src={banner.image || heroImage}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          )}
          <div
            className="relative flex h-full flex-col justify-center gap-4 p-8 md:p-16"
            style={{ background: "var(--hero-overlay)" }}
          >
            <h2 className="text-3xl text-foreground md:text-4xl">{banner.title}</h2>
            <p className="text-2xl font-bold text-foreground md:text-4xl">{banner.price}</p>
            <Button asChild variant="hero" className="w-fit rounded-full px-8">
              <Link to="/products/$slug" params={{ slug: banner.slug }}>
                {banner.cta}
              </Link>
            </Button>
          </div>
        </section>
        <div className="mt-4 flex justify-center gap-1.5">
          {homeBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Slide ${i + 1}`}
              className={cn("h-1 rounded-full", i === slide ? "w-8 bg-primary" : "w-3 bg-border")}
            />
          ))}
        </div>

        {/* Brands */}
        <section className="mt-10" aria-labelledby="home-brands-title">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="home-brands-title" className="font-display text-2xl sm:text-3xl">
              Shop by brand
            </h2>
          </div>
          <HorizontalRail className="gap-4">
            {(apiBrands.length ? apiBrands.map((brand) => brand.brand_name) : brands).map((b) => {
              const record = apiBrands.find((brand) => brand.brand_name === b);
              return (
                <Link
                  key={b}
                  to="/products"
                  search={{ brand: b, category: "All" }}
                  className="grid size-24 shrink-0 place-items-center rounded-full border border-border bg-card text-center text-sm font-bold transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-primary-soft hover:text-primary hover:shadow-card sm:size-28"
                >
                  {record?.brand_image_url ? (
                    <img
                      src={record.brand_image_url}
                      alt={b}
                      className="size-full rounded-full object-cover p-3"
                    />
                  ) : (
                    b
                  )}
                </Link>
              );
            })}
          </HorizontalRail>
        </section>

        {/* {apiCategories.length > 0 && (
          <section className="mt-10" aria-labelledby="home-categories-title">
            <h2 id="home-categories-title" className="mb-4 font-display text-2xl sm:text-3xl">
              Shop by category
            </h2>
            <HorizontalRail className="gap-4">
              {apiCategories.map((category) => (
                <Link
                  key={category.category_id}
                  to="/products"
                  search={{ category: category.category_name, brand: "All" }}
                  className="group w-52 shrink-0 overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-card"
                >
                  <img
                    src={category.category_image_url}
                    alt={category.category_name}
                    loading="lazy"
                    className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="block px-4 py-3 font-semibold">{category.category_name}</span>
                </Link>
              ))}
            </HorizontalRail>
          </section>
        )} */}

        <section className="mt-10" aria-labelledby="steal-deals-title">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 id="steal-deals-title" className="font-display text-2xl sm:text-3xl">
                Steal Deals
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fresh picks at easy monthly prices
              </p>
            </div>
            <Link
              to="/products"
              className="shrink-0 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              View all
            </Link>
          </div>
          <HorizontalRail className="gap-3">
            {stealDealSlugs
              .map((slug) => catalog.find((product) => product.slug === slug))
              .filter((product) => product !== undefined)
              .map((product) => (
                <Link
                  key={product.slug}
                  to="/products/$slug"
                  params={{ slug: product.slug }}
                  className="group w-[248px] shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-[258px]"
                >
                  <article className="overflow-hidden rounded-xl transition duration-300 group-hover:-translate-y-1 group-hover:shadow-card">
                    <div className="relative h-[205px] overflow-hidden rounded-xl bg-[#f5f5f6]">
                      <span className="absolute left-0 top-3 z-10 rounded-r-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground shadow-sm">
                        {product.tag ?? "Steal Deal"}
                      </span>
                      <img
                        src={product.image}
                        alt={`${product.brand} ${product.name}`}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        style={{ objectPosition: product.imagePosition ?? "center" }}
                      />
                    </div>
                    <div className="px-2.5 pb-3 pt-2 text-sm">
                      <p className="truncate">
                        <b>{product.brand}</b> {product.name}
                      </p>
                      <p className="mt-0.5 text-xs">
                        From <span className="font-semibold text-primary">{product.monthly}</span>
                      </p>
                      <p className="mt-0.5 text-xs font-semibold">
                        {product.price}{" "}
                        {product.mrp && (
                          <s className="font-normal text-muted-foreground">{product.mrp}</s>
                        )}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
          </HorizontalRail>
        </section>

        {apiPackages.length > 0 && (
          <section className="mt-12" aria-labelledby="home-plan-title">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">
                Choose what fits your life
              </p>
              <h2 id="home-plan-title" className="mt-2 font-display text-3xl md:text-4xl">
                Choose the plan that works for you
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Compare plan options and see how your estimated buyback value changes with the
                device and duration you select.
              </p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {apiPackages.map((item, index) => (
                <article
                  key={item.package_id}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card"
                >
                  <div
                    className={cn(
                      "relative h-48 overflow-hidden",
                      index === 0
                        ? "bg-product-blue"
                        : index === 1
                          ? "bg-product-sage"
                          : "bg-product-lilac",
                    )}
                  >
                    {item.package_image_url && (
                      <img
                        src={item.package_image_url}
                        alt={item.package_name}
                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold tracking-wider">
                      PROTECTION PLAN
                    </span>
                    <span className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-background text-primary shadow">
                      <ShieldCheck className="size-5" />
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-sm font-semibold text-primary">Protection package</p>
                    <h3 className="mt-1 font-display text-2xl">{item.package_name}</h3>
                    <p className="mt-3 min-h-32 text-sm leading-relaxed text-muted-foreground">
                      {homePackageDescription(item.package_description)}
                    </p>
                    <Link
                      to="/subscription"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      Calculate your estimate
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {sections.map((s) => (
          <section key={s.title} className="mt-12">
            <h2 className="mb-5 font-display text-3xl">{s.title}</h2>
            <HorizontalRail className="gap-3">
              {s.items.map((p) => {
                const product = catalog.find(
                  (item) => item.brand === p.brand && item.name === p.name,
                )!;
                return (
                  <Link
                    key={p.name}
                    to="/products/$slug"
                    params={{ slug: product.slug }}
                    className="group w-60 shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <article className="overflow-hidden rounded-lg border border-transparent transition duration-300 group-hover:-translate-y-1 group-hover:border-border group-hover:bg-card group-hover:shadow-card">
                      <div
                        className={cn(
                          "relative grid h-52 place-items-center overflow-hidden rounded-lg",
                          p.tone,
                        )}
                      >
                        {p.tag && (
                          <span className="absolute left-2 top-3 z-10 rounded-md bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                            {p.tag}
                          </span>
                        )}
                        <img
                          src={product.image}
                          alt={`${p.brand} ${p.name}`}
                          loading="lazy"
                          className="size-full object-cover transition duration-500 group-hover:scale-105"
                          style={{ objectPosition: product.imagePosition ?? "center" }}
                        />
                      </div>
                      <div className="px-2 pb-3 pt-3 text-sm">
                        <p className="truncate">
                          <b>{p.brand}</b> {p.name}
                        </p>
                        <p className="text-xs">
                          From <span className="font-semibold text-primary">{p.monthly}</span>
                        </p>
                        <p className="text-xs font-semibold">
                          {p.price}{" "}
                          {p.mrp && <s className="font-normal text-muted-foreground">{p.mrp}</s>}
                        </p>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </HorizontalRail>
          </section>
        ))}

        {/* Mid-page promotional carousel */}
        <section
          aria-label="More from BytePe"
          className="relative mt-12 overflow-hidden rounded-3xl bg-logo text-logo-foreground"
        >
          <img
            src={middleBanners[middleSlide]?.image ?? subscriptionPhones}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-45 transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-logo via-logo/80 to-transparent" />
          <div className="relative flex min-h-[270px] items-end justify-between gap-4 p-6 sm:min-h-[320px] sm:p-10 md:items-center md:p-14">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary-soft">
                A BytePe moment
              </p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl">
                {middleBanners[middleSlide]?.title}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75">
                {middleBanners[middleSlide]?.copy}
              </p>
              <Button asChild className="mt-5 rounded-full">
                <Link to={middleBanners[middleSlide]?.to ?? "/products"}>
                  {middleBanners[middleSlide]?.cta}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous banner"
                className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() =>
                  setMiddleSlide(
                    (value) => (value + middleBanners.length - 1) % middleBanners.length,
                  )
                }
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next banner"
                className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => setMiddleSlide((value) => (value + 1) % middleBanners.length)}
              >
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
          <div className="absolute bottom-4 right-5 flex gap-1.5 sm:bottom-6 sm:right-10">
            {middleBanners.map((item, index) => (
              <button
                key={item.title}
                onClick={() => setMiddleSlide(index)}
                aria-label={`Show promotional banner ${index + 1}`}
                aria-pressed={middleSlide === index}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  middleSlide === index ? "w-8 bg-white" : "w-2 bg-white/50",
                )}
              />
            ))}
          </div>
        </section>

        {/* Promo grid */}
        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              t: "iPhone 18 Pro",
              s: "Now on easy EMI",
              tone: "bg-product-coral",
              slug: "iphone-18-pro",
            },
            {
              t: "Flip it, Fold 8",
              s: "Free Wireless Charging Pad",
              tone: "bg-product-lilac",
              slug: "galaxy-z-fold-8",
            },
            {
              t: "Macbook Air M5",
              s: "Upto Rs.30,000 off",
              tone: "bg-product-blue",
              slug: "macbook-air-m5",
            },
          ].map((c) => (
            <Link
              key={c.t}
              to="/products/$slug"
              params={{ slug: c.slug }}
              className={cn(
                "group flex h-72 items-end rounded-md p-5 transition duration-300 hover:-translate-y-1 hover:shadow-card md:h-96",
                c.tone,
              )}
            >
              <div>
                <h3 className="text-xl font-bold">{c.t}</h3>
                <p className="text-sm">{c.s}</p>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="mb-5 font-display text-3xl">What's Trending</h2>
          <HorizontalRail className="gap-4">
            {trending.map((t, i) => (
              <HoverVideoCard
                key={t.name}
                title={t.name}
                image={catalog.find((item) => item.slug === t.slug)?.image ?? heroImage}
                toProduct={t.slug}
                className={cn(
                  "h-48 w-80",
                  ["bg-product-sage", "bg-muted", "bg-product-lilac", "bg-product-sky"][i],
                )}
              />
            ))}
          </HorizontalRail>
        </section>

        <section className="mt-12">
          <h2 className="mb-5 font-display text-3xl">Curious? Here's what makes us different</h2>
          <HorizontalRail className="gap-4">
            {different.map((d, i) => (
              <HoverVideoCard
                key={d}
                title={d}
                image={
                  [subscriptionPhones, heroImage, laptopBanner, subscriptionPhones, heroImage][i] ??
                  heroImage
                }
                className="h-96 w-64"
              />
            ))}
          </HorizontalRail>
        </section>

        <section className="mt-12">
          <h2 className="mb-5 font-display text-3xl">Straight from the customers</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reviews.map((r) => (
              <div
                key={r.name}
                className="flex h-96 flex-col justify-end rounded-2xl bg-hero p-6 text-foreground"
              >
                <h3 className="font-display text-2xl">{r.title}</h3>
                <p className="mt-2 text-xs opacity-80">{r.text}</p>
                <p className="mt-3 text-sm font-semibold">{r.name}</p>
                <div className="mt-1 flex gap-0.5 text-product-sun">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          className="mt-14 rounded-3xl bg-muted px-4 py-8 sm:px-8 sm:py-10"
          aria-labelledby="home-faq-title"
        >
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
              Here to help
            </p>
            <h2 id="home-faq-title" className="mt-2 font-display text-3xl">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="mt-5 space-y-3">
              {(
                [
                  [
                    "catch",
                    "What is the catch?",
                    "There is no catch. Choose a device and plan, review the costs and terms, and decide what works best for you.",
                  ],
                  [
                    "upgrade",
                    "What happens at the time of upgrade?",
                    "At the end of your selected period, explore the available options to upgrade, return or keep your device.",
                  ],
                  [
                    "keep",
                    "What if I want to keep my device?",
                    "You can review the keep option and any remaining amount shown with your selected plan.",
                  ],
                  [
                    "delivery",
                    "How does delivery work?",
                    "Your order details and delivery updates are available from the orders area after checkout.",
                  ],
                ] as const
              ).map(([id, question, answer], index) => (
                <AccordionItem
                  key={id}
                  value={id}
                  className="rounded-xl border-0 bg-background px-4"
                >
                  <AccordionTrigger className="py-4 text-left text-sm font-semibold hover:no-underline">
                    {index + 1}. {question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                    {answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-6 flex justify-center">
              <Button variant="outline" asChild className="rounded-full">
                <Link to="/about">
                  View more <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-10 mb-4" aria-labelledby="home-partners-title">
          <h2 id="home-partners-title" className="mb-5 px-2 font-display text-2xl sm:text-3xl">
            Our Partners
          </h2>
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-4 lg:grid-cols-7 lg:p-6">
            {["HDFC BANK", "Unicorn", "PayU", "Razorpay", "Kosh", "LazyPay", "InstaCred"].map(
              (name, index) => (
                <div
                  key={name}
                  className="flex min-h-14 items-center justify-center rounded-xl bg-muted/50 px-3 py-3 text-center font-semibold tracking-tight transition hover:-translate-y-0.5 hover:bg-primary-soft hover:text-primary"
                >
                  <span
                    className={cn(
                      "text-sm sm:text-base",
                      index === 0 && "text-blue-800",
                      index === 2 && "text-emerald-700",
                      index === 3 && "italic text-blue-700",
                      index === 4 && "text-emerald-600",
                    )}
                  >
                    {name}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function HorizontalRail({ children, className }: { children: ReactNode; className?: string }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(true);

  function updateScrollButtons() {
    const rail = railRef.current;
    if (!rail) return;
    setCanGoBack(rail.scrollLeft > 2);
    setCanGoForward(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2);
  }

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, []);

  function scroll(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(240, rail.clientWidth * 0.78), behavior: "smooth" });
  }

  return (
    <div className="group/rail relative">
      <div
        ref={railRef}
        onScroll={updateScrollButtons}
        className={cn("flex overflow-x-auto scroll-smooth pb-3", className)}
      >
        {children}
      </div>
      {canGoBack && (
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Scroll products left"
          className="absolute left-2 top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/95 shadow-md transition hover:scale-105 hover:bg-primary hover:text-primary-foreground md:grid"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      {canGoForward && (
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Scroll products right"
          className="absolute right-2 top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/95 shadow-md transition hover:scale-105 hover:bg-primary hover:text-primary-foreground md:grid"
        >
          <ChevronRight className="size-5" />
        </button>
      )}
    </div>
  );
}

function HoverVideoCard({
  title,
  image,
  toProduct,
  className,
  videoSrc,
}: {
  title: string;
  image: string;
  toProduct?: string;
  className: string;
  videoSrc?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function startPreview() {
    setPlaying(true);
    if (videoSrc && videoRef.current) void videoRef.current.play().catch(() => setPlaying(false));
  }

  function stopPreview() {
    setPlaying(false);
    videoRef.current?.pause();
    if (videoRef.current) videoRef.current.currentTime = 0;
  }

  const content = (
    <div
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      onFocus={startPreview}
      onBlur={stopPreview}
      className={cn(
        "group relative grid shrink-0 place-items-center overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:shadow-card",
        className,
      )}
    >
      <img
        src={image}
        alt=""
        loading="lazy"
        className={cn(
          "absolute inset-0 size-full object-cover transition duration-700",
          playing ? "scale-110" : "scale-100",
        )}
      />
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={image}
          muted
          loop
          playsInline
          preload="none"
          aria-label={`${title} video preview`}
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/5" />
      <span
        className={cn(
          "relative z-10 grid size-12 place-items-center rounded-full bg-hero-overlay text-primary-foreground shadow-lg transition-all duration-300",
          playing ? "scale-90 opacity-70" : "group-hover:scale-110",
        )}
      >
        <Play className="size-5 fill-current" />
      </span>
      <span className="absolute bottom-3 left-3 right-3 z-10 text-left text-sm font-semibold text-white">
        {title}
      </span>
      {playing && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          {videoSrc ? "Playing" : "Video preview"}
        </span>
      )}
    </div>
  );

  return toProduct ? (
    <Link to="/products/$slug" params={{ slug: toProduct }} className="shrink-0">
      {content}
    </Link>
  ) : (
    content
  );
}
