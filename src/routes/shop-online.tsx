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
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
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
import { ProductCard } from "@/components/shop/product-card";
import { mapApiProduct } from "@/lib/catalog";
import { getBanners } from "@/services/api/banner.service";
import { getBrands } from "@/services/api/brand.service";
import { getCategories } from "@/services/api/category.service";
import { getPackages } from "@/services/api/package.service";
import { sortPackagesByTier } from "@/lib/package-theme";
import { getOfferProducts } from "@/services/api/offer.service";
import { getFaqs } from "@/services/api/faq.service";
import { ApiStatusError } from "@/services/api/client";
import { apiQueryKeys } from "@/services/api/query-keys";
import {
  checkSavedSession,
  clearAuthSession,
  clearSavedAccountData,
  readAuthSession,
} from "@/services/api/auth";

export const Route = createFileRoute("/shop-online")({
  head: () => ({
    meta: [
      { title: "Kimaat Lock — Technology made simple" },
      {
        name: "description",
        content:
          "Explore phones, audio, wearables and more with clear prices and flexible plans at Kimaat Lock.",
      },
      { property: "og:title", content: "Kimaat Lock — Technology made simple" },
      {
        property: "og:description",
        content: "Find your next device and explore protection options with Kimaat Lock.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopOnlinePage,
});

const middleBanners = [
  {
    title: "A little more freedom with every upgrade",
    copy: "Choose a phone plan that moves with you — upgrade, keep or return when it suits you.",
    image: subscriptionPhones,
    to: "/" as const,
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

export function ShopOnlinePage() {
  const [middleSlide, setMiddleSlide] = useState(0);
  const pageRef = useRef<HTMLElement>(null);
  const session = readAuthSession();
  const refreshOnEntry = { staleTime: 0, refetchOnMount: "always" as const };
  const bannersQuery = useQuery({ queryKey: apiQueryKeys.banners, queryFn: getBanners, ...refreshOnEntry });
  const brandsQuery = useQuery({ queryKey: apiQueryKeys.brands, queryFn: getBrands, ...refreshOnEntry });
  const categoriesQuery = useQuery({ queryKey: apiQueryKeys.categories, queryFn: getCategories, ...refreshOnEntry });
  const packagesQuery = useQuery({ queryKey: apiQueryKeys.packages, queryFn: getPackages, ...refreshOnEntry });
  const offersQuery = useQuery({
    queryKey: apiQueryKeys.offers(session?.accountId ?? ""),
    queryFn: () => getOfferProducts({ user_id: session?.accountId ?? "" }),
    ...refreshOnEntry,
  });
  const faqsQuery = useQuery({ queryKey: apiQueryKeys.faqs, queryFn: () => getFaqs(), ...refreshOnEntry });
  const apiBanners = bannersQuery.data ?? [];
  const apiBrands = brandsQuery.data ?? [];
  const apiCategories = categoriesQuery.data ?? [];
  const apiPackages = sortPackagesByTier(packagesQuery.data ?? []);
  const apiOffers = (offersQuery.data ?? []).filter((offer) => {
    if (Array.isArray(offer.offer_product_id_arr)) {
      return offer.offer_product_id_arr.length > 0;
    }
    if (typeof offer.offer_product_ids === "string") {
      return offer.offer_product_ids.split(",").some((productId) => productId.trim().length > 0);
    }
    return (offer.products?.length ?? 0) > 0;
  });
  const faqs = faqsQuery.data ?? [];
  const homeDataLoading = [bannersQuery, brandsQuery, categoriesQuery, packagesQuery, offersQuery].some((query) => query.isLoading);
  const faqsLoading = faqsQuery.isLoading;

  useEffect(() => {
    const savedSession = readAuthSession();
    if (savedSession) {
      void checkSavedSession(savedSession).catch((error: unknown) => {
        if (error instanceof ApiStatusError) {
          if (String(error.status) === "3") clearSavedAccountData();
          else clearAuthSession();
        }
      });
    }
  }, []);

  useEffect(() => {
    const nodes = pageRef.current?.querySelectorAll<HTMLElement>("[data-shop-reveal]");
    if (!nodes?.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.setAttribute("data-visible", "true"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.setAttribute("data-visible", entry.isIntersecting ? "true" : "false");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [
    bannersQuery.data,
    brandsQuery.data,
    categoriesQuery.data,
    packagesQuery.data,
    offersQuery.data,
    faqsQuery.data,
  ]);

  const homeBanners = [...apiBanners]
    .filter(
      (item) =>
        item.banner_type?.trim().toLowerCase() === "store" &&
        Boolean(item.banner_image_url?.trim()),
    )
    .sort((a, b) => Number(a.banner_priority) - Number(b.banner_priority))
    .map((item) => ({
      title: item.banner_name,
      image: item.banner_image_url,
      // The API may return this ID as either a string or a number.
      productId: String(item.banner_product_id ?? "").trim(),
    }));
  const visibleOffers = apiOffers
    .filter((offer) => (offer.products?.length ?? 0) > 0)
    .map((offer) => ({
      ...offer,
      displayProducts: (offer.products ?? []).map(mapApiProduct),
    }));

  return (
    <PageShell>
      <main ref={pageRef} className="shop-online-journey mx-auto max-w-[1400px] px-4 py-6 md:px-8">
        {/* Banner */}
        {!homeDataLoading && homeBanners.length > 0 && (
          <div data-shop-reveal data-reveal-side="up">
          <Swiper
            modules={[EffectFade, Pagination, Autoplay]}
            effect="fade"
            autoHeight
            spaceBetween={30}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            loop={homeBanners.length > 1}
            className="home-banner-swiper overflow-hidden rounded-3xl bg-muted"
          >
            {homeBanners.map((banner) => {
              return (
                <SwiperSlide key={banner.title}>
                  <div className="w-full">
                    {/^[1-9]\d*$/.test(banner.productId) ? (
                      <Link
                        to="/products/$slug"
                        params={{ slug: `product-${banner.productId}` }}
                        aria-label={`View ${banner.title}`}
                        className="block cursor-pointer"
                      >
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="block aspect-[458/190] w-full object-cover"
                          draggable={false}
                        />
                      </Link>
                    ) : (
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="block aspect-[458/190] w-full object-cover"
                        draggable={false}
                      />
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
          </div>
        )}
        {!homeDataLoading && homeBanners.length === 0 && <p data-shop-reveal data-reveal-side="up" className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">No data found</p>}

        {/* Brands */}
        {!homeDataLoading && <section data-shop-reveal data-reveal-side="left" className="mt-10" aria-labelledby="home-brands-title">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="home-brands-title" className="font-display text-2xl sm:text-3xl">
              Shop by brand
            </h2>
          </div>
          {apiBrands.length ? <HorizontalRail className="gap-3 sm:gap-4">
            {apiBrands.map((record) => {
              const b = record.brand_name;
              return (
                <Link
                  key={b}
                  to="/products"
                  search={{ brand: b, category: "All" }}
                  className="grid size-[68px] shrink-0 place-items-center rounded-full border border-border bg-card text-center text-xs font-bold transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-primary-soft hover:text-primary hover:shadow-card sm:size-20 sm:text-sm lg:size-28"
                >
                  {record?.brand_image_url ? (
                    <img
                      src={record.brand_image_url}
                      alt={b}
                      className="size-full rounded-full object-contain p-2.5 sm:p-3"
                    />
                  ) : (
                    b
                  )}
                </Link>
              );
            })}
          </HorizontalRail> : <p className="rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">No data found</p>}
        </section>}

        {!categoriesQuery.isLoading && <section data-shop-reveal data-reveal-side="right" className="mt-1" aria-labelledby="home-categories-title">
          <div className="mb-4 mt-4 flex items-end justify-between gap-4">
            <div>
              <h2 id="home-categories-title" className="font-display text-2xl sm:text-3xl">Shop by category</h2>
            </div>
            <Link to="/products" className="shrink-0 text-sm font-semibold text-primary transition-colors hover:text-primary-hover">View all</Link>
          </div>
          {apiCategories.length ? <HorizontalRail className="gap-4">
            {apiCategories.map((category) => (
              <Link
                key={category.product_category_id ?? category.category_id}
                to="/products"
                search={{ category: category.category_name }}
                className="group w-36 shrink-0 overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-card sm:w-44"
              >
                <div className="grid h-32 place-items-center bg-muted/40 p-4 sm:h-40">
                  {category.category_image_url ? <img src={category.category_image_url} alt={category.category_name} loading="lazy" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" /> : <Smartphone className="size-12 text-muted-foreground" aria-hidden="true" />}
                </div>
                <span className="block truncate px-4 py-3 text-sm font-semibold" title={category.category_name}>{category.category_name}</span>
              </Link>
            ))}
          </HorizontalRail> : <p className="rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">No data found</p>}
        </section>}

       

        {!homeDataLoading && visibleOffers.map((offer, index) => (
          <section
            key={offer.offer_id}
            data-shop-reveal
            data-reveal-side={index % 2 === 0 ? "left" : "right"}
            className="mt-2"
            aria-labelledby={`offer-${offer.offer_id}-title`}
          >
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 id={`offer-${offer.offer_id}-title`} className="font-display text-2xl sm:text-3xl">
                {offer.offer_name.trim()}
              </h2>
              <Link
                to="/products"
                className="shrink-0 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
              >
                View all
              </Link>
            </div>
            <HorizontalRail className="gap-3">
              {offer.displayProducts.map((product) => (
                <div key={product.productId ?? product.slug} className="w-[248px] shrink-0 sm:w-[258px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </HorizontalRail>
          </section>
        ))}

        {!homeDataLoading && (
          <section data-shop-reveal data-reveal-side="right" className="mt-12" aria-labelledby="home-plan-title">
            <div className="mx-auto max-w-2xl text-center">
              {/* <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">
                Choose what fits your life
              </p> */}
              <h2 id="home-plan-title" className="mt-2 font-display text-3xl md:text-4xl">
                Choose the plan that works for you
              </h2>
              {/* <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Compare plan options and see how your estimated buyback value changes with the
                device and duration you select.
              </p> */}
            </div>
            {apiPackages.length ? <div className="mt-8 grid gap-5 md:grid-cols-3">
              {apiPackages.map((item, index) => (
                <article
                  key={item.package_id}
                  data-shop-reveal
                  data-reveal-side={index % 2 === 0 ? "left" : "right"}
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
                    <a
                      href={`/?packageId=${encodeURIComponent(item.package_id)}#home-estimate`}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      Calculate your estimate
                      <ArrowRight className="size-4" />
                    </a>
                  </div>
                </article>
              ))}
            </div> : <p className="mt-8 rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">No data found</p>}
          </section>
        )}

      

        {/* Mid-page promotional carousel */}
        {/* <section
          aria-label="More from Kimaat Lock"
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
                A Kimaat Lock moment
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
        </section> */}

        {/* <section className="mt-12">
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
        </section> */}

       

        <section
          data-shop-reveal
          data-reveal-side="right"
          className="mt-14 rounded-3xl bg-muted px-4 py-8 sm:px-8 sm:py-10"
          aria-labelledby="home-faq-title"
          id="frequently-asked-questions"
        >
          <div className="mx-auto max-w-5xl">
           
            <h2 id="home-faq-title" className="mt-2 font-display text-3xl">
              Frequently Asked Questions
            </h2>
            {faqsLoading ? (
              <div className="mt-5 space-y-3" aria-label="Loading FAQs">
                {[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-background" />)}
              </div>
            ) : faqs.length > 0 ? (
            <Accordion type="single" collapsible className="mt-5 space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.faq_id}
                  value={faq.faq_id}
                  className="rounded-xl border-0 bg-background px-4"
                >
                  <AccordionTrigger className="py-4 text-left text-sm font-semibold hover:no-underline">
                    {index + 1}. {faq.faq_title}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                    {faq.faq_description}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            ) : (
              <p className="mt-5 rounded-xl bg-background px-4 py-5 text-sm text-muted-foreground">
                Help articles will appear here when available.
              </p>
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
        className={cn("pt-3 flex overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
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
