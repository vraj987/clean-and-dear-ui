import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleDollarSign,
  CreditCard,
  FileText,
  HeartHandshake,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import subscriptionPhones from "@/assets/subscription-phones.jpg";
import deviceJourney from "@/assets/journey-device.svg";
import invoiceJourney from "@/assets/journey-invoice.gif";
import protectionJourney from "@/assets/journey-protection.svg";
import activationJourney from "@/assets/journey-activation.svg";
import checkoutJourney from "@/assets/journey-checkout.svg";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { getBanners } from "@/services/api/banner.service";
import { getPackages } from "@/services/api/catalog";
import { apiQueryKeys } from "@/services/api/query-keys";
import { SubscriptionEstimator } from "./subscription";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Kimaat Lock — Fix Your Phone’s Future Value" },
      {
        name: "description",
        content:
          "Learn how Kavach helps you check month-wise buyback values for the phone you already own.",
      },
      { property: "og:title", content: "About Kimaat Lock" },
      {
        property: "og:description",
        content:
          "Choose a Kavach package and see your phone’s assured buyback value month by month.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const steps = [
  {
    number: "01",
    title: "Start with the phone you own",
    copy: "Bought your phone from any store? Kavach is for your existing device, whether it is brand new or already several months old. We use its purchase date and details to check eligibility.",
    image: deviceJourney,
    alt: "A phone owner starting a Kavach value check",
    Icon: Smartphone,
    imageRight: true,
  },
  {
    number: "02",
    title: "Tell us about your phone",
    copy: "Select the phone brand, model and storage. Add its purchase date, final purchase amount, invoice number and IMEI. Upload an invoice image or PDF to scan the details, then review and correct them.",
    image: invoiceJourney,
    alt: "A phone ready for setup",
    Icon: FileText,
    imageRight: false,
  },
  {
    number: "03",
    title: "Choose Kavach and see every month’s value",
    copy: "Select a Kavach package and explore the available months from 1 to 24. See the package price and the assured buyback amount for each eligible month before you purchase.",
    image: protectionJourney,
    alt: "Devices and technology for everyday use",
    Icon: ShieldCheck,
    imageRight: true,
  },
  {
    number: "04",
    title: "Pay online and activate Kavach",
    copy: "Choose online payment and complete the payment for your selected Kavach package. Once the payment is verified, your Kavach plan is activated and its details are available in your orders.",
    image: activationJourney,
    alt: "Online payment verified and Kavach plan activated",
    Icon: CreditCard,
    imageRight: false,
  },
  {
    number: "05",
    title: "Come back when you’re ready to sell",
    copy: "When it is time to sell, return to Kimaat Lock in a month covered by your Kavach package. We show the applicable buyback value based on your selected package and month.",
    image: checkoutJourney,
    alt: "Kavach plan showing month-wise future buyback values",
    Icon: CircleDollarSign,
    imageRight: true,
  },
];

const benefits = [
  {
    Icon: Sparkles,
    title: "Simple by design",
    copy: "Enter your phone details and see clear package prices and month-wise buyback values.",
  },
  {
    Icon: RefreshCw,
    title: "Plan your sale",
    copy: "See the future value for each eligible month and choose when you may want to sell.",
  },
  {
    Icon: ShieldCheck,
    title: "Know your selling price",
    copy: "See the assured selling price for each eligible month before you decide.",
  },
  {
    Icon: HeartHandshake,
    title: "Built on clarity",
    copy: "Understand the package price and applicable buyback value before you purchase.",
  },
];

export function AboutPage() {
  const pageRef = useRef<HTMLElement>(null);
  const bannersQuery = useQuery({
    queryKey: apiQueryKeys.banners,
    queryFn: getBanners,
    staleTime: 0,
    refetchOnMount: "always",
  });
  const packagesQuery = useQuery({
    queryKey: apiQueryKeys.packages,
    queryFn: getPackages,
    staleTime: 0,
    refetchOnMount: "always",
  });
  const subscriptionBanners = (bannersQuery.data ?? [])
    .filter(
      (banner) =>
        banner.banner_type?.trim().toLowerCase() === "subscription" &&
        Boolean(banner.banner_image_url?.trim()),
    )
    .sort((a, b) => Number(a.banner_priority) - Number(b.banner_priority));

  useEffect(() => {
    const nodes = pageRef.current?.querySelectorAll<HTMLElement>("[data-about-reveal]");
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
  }, []);

  return (
    <PageShell>
      <main ref={pageRef} className="about-journey">
        {/* <section className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 md:grid-cols-2 md:items-center md:px-8 md:py-16">
          <div data-about-reveal data-reveal-side="left">
            <p className="text-sm font-semibold uppercase tracking-[.16em] text-primary">Kavach by Kimaat Lock</p>
            <h1 className="mt-3 max-w-xl font-display text-5xl leading-tight md:text-6xl">Aaj phone lo, kal ki kimmat fix karo.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Already own a phone? Choose a Kavach package and see the buyback value available for your device month by month.
            </p>
            <Button asChild className="mt-7 rounded-full">
              <Link to="/">Check my phone’s value <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
          <div data-about-reveal data-reveal-side="right" className="overflow-hidden rounded-card">
            <img src={subscriptionPhones} alt="Smartphones displayed together" width={1600} height={1008} className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-[1.035]" />
          </div>
        </section> */}

        {!bannersQuery.isLoading && subscriptionBanners.length > 0 && (
          <section
            className="mx-auto max-w-[1400px] px-4 py-4 md:px-8 md:py-8"
            aria-label="Kavach subscription banners"
          >
            <Swiper
              modules={[Autoplay, Pagination]}
              pagination={{ clickable: true }}
              autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
              loop={subscriptionBanners.length > 1}
              className="home-banner-swiper overflow-hidden rounded-3xl bg-muted"
            >
              {subscriptionBanners.map((banner) => (
                <SwiperSlide key={banner.banner_id}>
                  {/^\d+$/.test(banner.banner_product_id?.trim() ?? "") ? (
                    <Link
                      to="/products/$slug"
                      params={{ slug: `product-${banner.banner_product_id!.trim()}` }}
                      aria-label={`View ${banner.banner_name || "featured product"}`}
                      className="block cursor-pointer"
                    >
                      <img
                        src={banner.banner_image_url}
                        alt={banner.banner_name || "Kavach subscription"}
                        className="block aspect-[458/190] w-full object-cover"
                        draggable={false}
                      />
                    </Link>
                  ) : (
                    <img
                      src={banner.banner_image_url}
                      alt={banner.banner_name || "Kavach subscription"}
                      className="block aspect-[458/190] w-full object-cover"
                      draggable={false}
                    />
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}

        <section
          id="home-estimate"
          aria-label="Your device details"
        >
          <div className="mx-auto w-full max-w-screen-2xl">
            <SubscriptionEstimator
              packages={packagesQuery.data ?? []}
              packagesLoading={packagesQuery.isLoading}
            />
          </div>
        </section>

        <section
          className="mx-auto w-full max-w-screen-2xl px-4 pb-4 pt-8 text-center md:px-8 md:pt-12"
          data-about-reveal
          data-reveal-side="up"
        >
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">
            Kavach for the phone you already own
          </p>
          <h2 className="mt-2 font-display text-4xl">How Kimaat Lock works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Check your phone’s future value, choose Kavach, and know what you can receive when you
            sell in an eligible month.
          </p>
        </section>

        <section
          className="mx-auto w-full max-w-screen-2xl space-y-8 px-4 py-8 md:px-8 md:py-12"
          aria-label="How the Kimaat Lock journey works"
        >
          {steps.map(({ number, title, copy, image, alt, Icon, imageRight }) => (
            <article
              key={number}
              data-about-reveal
              data-reveal-side={number === "02" || number === "04" ? "right" : "left"}
              className="group grid overflow-hidden rounded-3xl border border-border bg-card transition-[box-shadow,border-color] duration-300 hover:border-primary/30 hover:shadow-card md:min-h-[310px] md:grid-cols-2"
            >
              <div
                className={`flex flex-col justify-center p-6 sm:p-9 md:p-12 ${imageRight ? "md:order-1" : "md:order-2"}`}
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary shadow-sm transition duration-300 group-hover:scale-110 group-hover:rotate-[-6deg] group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <p className="mt-5 text-xs font-bold tracking-[.18em] text-primary">
                  STEP {number}
                </p>
                <h2 className="mt-2 font-display text-3xl">{title}</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{copy}</p>
                {number === "02" && (
                  <ul className="mt-4 grid gap-2 text-sm text-foreground sm:grid-cols-2">
                    {[
                      "Brand, model and storage",
                      "Purchase date",
                      "Final purchase amount",
                      "Invoice number",
                      "IMEI number",
                    ].map((field) => (
                      <li key={field} className="flex items-center gap-2">
                        <Check className="size-4 text-primary" />
                        {field}
                      </li>
                    ))}
                  </ul>
                )}
                {number === "04" && (
                  <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    <BadgeCheck className="size-5" />
                    Your Kavach activates after payment verification
                  </p>
                )}
              </div>
              <div
                className={`min-h-56 bg-muted md:min-h-full ${imageRight ? "md:order-2" : "md:order-1"}`}
              >
                <img
                  src={image}
                  alt={alt}
                  loading="lazy"
                  className="size-full min-h-56 object-cover transition-transform duration-500 group-hover:scale-[1.025] md:min-h-[310px]"
                />
              </div>
            </article>
          ))}
        </section>

        <section
          data-about-reveal
          data-reveal-side="left"
          className="mx-auto w-full max-w-screen-2xl px-4 py-14 md:px-8 md:py-16"
        >
          <h2 className="mt-2 max-w-3xl font-display text-4xl leading-tight">Why Kimaat Lock?</h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {benefits.map(({ Icon, title, copy }) => (
              <article
                key={title}
                data-about-reveal
                data-reveal-side="up"
                className="rounded-2xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card"
              >
                <Icon className="size-7 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
