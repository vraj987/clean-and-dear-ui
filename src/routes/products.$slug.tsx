import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Box,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Heart,
  Info,
  MapPin,
  Maximize2,
  PackageCheck,
  RefreshCw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import galaxyFront from "@/assets/galaxy-a57-product.png";
import phoneBlue from "@/assets/phone-blue-gallery.jpg";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { catalog, getProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$slug")({
  beforeLoad: ({ params }) => {
    if (!getProduct(params.slug)) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Product Details — BytePe" },
      {
        name: "description",
        content: "Explore product details, protection and flexible monthly EMI plans at BytePe.",
      },
      { property: "og:title", content: "Product Details — BytePe" },
      { property: "og:description", content: "Choose a device and make it yours with BytePe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductDetail,
});

const offers = ["Axis Bank", "ICICI Bank", "HDFC Bank"];
const features = [
  "Vibrant high-resolution display for work and entertainment",
  "Smooth performance for multitasking and everyday gaming",
  "Versatile camera system for crisp photos and videos",
  "All-day battery life with fast charging support",
  "Premium, durable design built for daily use",
  "Modern connectivity with 5G, Wi-Fi and Bluetooth",
];

function ProductDetail() {
  const { slug } = Route.useParams();
  const product = getProduct(slug)!;
  const [color, setColor] = useState("Iceblue");
  const [ram, setRam] = useState("8GB");
  const [storage, setStorage] = useState(product.storage[0] ?? "Standard");
  const [tab, setTab] = useState("Description");
  const [activeImage, setActiveImage] = useState(0);
  const [buybackMonth, setBuybackMonth] = useState(21);
  const [openBuybackFaq, setOpenBuybackFaq] = useState("lock-in");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerZoomed, setViewerZoomed] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [termsOpen, setTermsOpen] = useState(false);
  const isPhone = product.category === "Mobile";
  const gallery = useMemo(() => {
    const main = product.slug === "galaxy-a57-5g" ? phoneBlue : product.image;
    const alternates =
      product.slug === "galaxy-a57-5g"
        ? [galaxyFront, product.image, phoneBlue]
        : [product.image, product.image, product.image, product.image];
    return alternates.map((image, index) => ({
      image,
      position:
        product.slug === "galaxy-a57-5g"
          ? "center"
          : ([product.imagePosition ?? "center", "14% 20%", "76% 20%", "78% 82%"][index] ??
            "center"),
      label: ["Front view", "Rear view", "Side detail", "Design detail"][index] ?? "Product view",
    }));
  }, [product]);
  const currentImage = gallery[activeImage] ?? gallery[0]!;
  useEffect(() => {
    if (!viewerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setViewerOpen(false);
      if (event.key === "ArrowRight") setActiveImage((index) => (index + 1) % gallery.length);
      if (event.key === "ArrowLeft")
        setActiveImage((index) => (index - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gallery.length, viewerOpen]);
  const buybackMonths = [3, 6, 9, 12, 15, 18, 21, 24];
  const referenceValues = [88000, 80000, 68000, 56000, 52000, 48000, 44800, 40000];
  const listedPrice = Number(product.price.replace(/\D/g, "")) || 134999;
  const valueFactor = listedPrice / 134999;
  const buybackValue =
    Math.round(
      ((referenceValues[buybackMonths.indexOf(buybackMonth)] ?? 40000) * valueFactor) / 100,
    ) * 100;
  const formatRupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;

  return (
    <PageShell compactHeader>
      <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link to="/products" className="hover:text-primary">
            Products
          </Link>
          <ChevronRight className="size-3" />
          <span className="truncate text-foreground">{product.name}</span>
        </nav>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,.9fr)] lg:gap-12">
          <section className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="grid gap-3 lg:grid-cols-[72px_minmax(0,1fr)] lg:gap-4">
              <div
                className="order-2 flex w-full gap-2 overflow-x-auto pb-1 lg:order-1 lg:w-[72px] lg:flex-col lg:overflow-visible lg:pb-0"
                aria-label="Product images"
              >
                {gallery.map((image, index) => (
                  <button
                    key={`${image.label}-${index}`}
                    type="button"
                    onClick={() => {
                      setActiveImage(index);
                    }}
                    aria-label={`Show ${image.label}`}
                    aria-pressed={activeImage === index}
                    className={cn(
                      "size-[58px] shrink-0 overflow-hidden rounded-xl border-2 bg-muted p-1 transition hover:-translate-y-0.5 sm:size-[72px]",
                      activeImage === index ? "border-primary shadow-sm" : "border-transparent",
                    )}
                  >
                    <img
                      src={image.image}
                      alt=""
                      className="size-full rounded-lg object-cover"
                      style={{ objectPosition: image.position }}
                    />
                  </button>
                ))}
              </div>
              <div className="order-1 relative min-w-0 lg:order-2">
                <div className="group relative grid min-h-[340px] place-items-center overflow-hidden rounded-card bg-muted p-5 sm:min-h-[500px] md:min-h-[620px] md:p-8">
                  <button
                    type="button"
                    onClick={() => {
                      setViewerZoomed(false);
                      setViewerOpen(true);
                    }}
                    className="absolute inset-0 z-0 grid size-full place-items-center cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    aria-label={`View ${product.name} images full screen`}
                  >
                    <img
                      src={currentImage.image}
                      alt={`${product.brand} ${product.name} — ${currentImage.label}`}
                      width={1200}
                      height={1200}
                      className={cn(
                        "transition duration-500",
                        product.slug === "galaxy-a57-5g"
                          ? "max-h-[570px] w-full object-contain"
                          : "size-full min-h-[340px] object-cover sm:min-h-[500px] md:min-h-[620px]",
                      )}
                      style={{ objectPosition: currentImage.position }}
                    />
                  </button>
                  <div className="absolute right-3 top-3 flex gap-2">
                    <Button size="icon" variant="outline" aria-label="Share">
                      <Share2 className="size-4" />
                    </Button>
                    <Button size="icon" variant="outline" aria-label="Add to wishlist">
                      <Heart className="size-4" />
                    </Button>
                  </div>
                  <span className="pointer-events-none absolute left-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-background/85 text-foreground shadow-sm">
                    <Maximize2 className="size-4" />
                  </span>
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/85 px-3 py-1 text-[11px] text-muted-foreground opacity-0 transition group-hover:opacity-100">
                    Click to view images
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-center gap-2">
              {gallery.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show image ${index + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    activeImage === index ? "w-6 bg-primary" : "w-1.5 bg-border",
                  )}
                />
              ))}
            </div>
          </section>

          <section className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
              {product.brand} · {product.category}
            </p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl">{product.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                <Star className="size-3 fill-current" />
                {product.rating} <span className="font-normal">· Top rated</span>
              </span>
              {product.tag && (
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
                  {product.tag}
                </span>
              )}
            </div>
            <div className="mt-5 flex flex-wrap items-baseline gap-2">
              <b className="text-3xl">{product.price}</b>
              {product.mrp && <s className="text-muted-foreground">{product.mrp}</s>}
              {product.mrp && (
                <span className="text-xs font-semibold text-success">
                  You save{" "}
                  {`₹${(Number(product.mrp.replace(/\D/g, "")) - Number(product.price.replace(/\D/g, ""))).toLocaleString("en-IN")}`}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm">
              EMI From <b className="text-primary">{product.monthly}</b>{" "}
              <Link
                to="/subscription"
                className="ml-2 text-xs font-semibold text-primary underline-offset-4 hover:underline"
              >
                See plans
              </Link>
            </p>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-card p-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">Fulfilled by</p>
                <p className="truncate text-sm font-semibold">
                  {product.brand === "Apple"
                    ? "Apple Authorised Reseller"
                    : `${product.brand} Authorised Seller`}
                </p>
              </div>
              <CheckCircle2 className="ml-auto size-5 shrink-0 text-success" />
            </div>
            <div className="mt-4 rounded-xl border border-border p-4">
              <label
                htmlFor="delivery-pincode"
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <MapPin className="size-4 text-primary" /> Check delivery details
              </label>
              <div className="mt-3 flex gap-2">
                <input
                  id="delivery-pincode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={6}
                  value={pincode}
                  onChange={(event) => {
                    setPincode(event.target.value.replace(/\D/g, ""));
                    setPincodeMessage("");
                  }}
                  placeholder="Enter 6-digit pincode"
                  className="h-11 min-w-0 flex-1 rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-lg px-4"
                  onClick={() =>
                    setPincodeMessage(
                      /^\d{6}$/.test(pincode)
                        ? `Delivery details for ${pincode} are ready to review.`
                        : "Enter a valid 6-digit pincode.",
                    )
                  }
                >
                  Check
                </Button>
              </div>
              {pincodeMessage && (
                <p className="mt-2 text-xs text-muted-foreground" role="status">
                  {pincodeMessage}
                </p>
              )}
            </div>
            {isPhone && (
              <>
                <div className="mt-6">
                  <p className="text-sm">Color — Awesome {color}</p>
                  <div className="mt-3 flex gap-3">
                    {["Iceblue", "Lavender", "Graphite"].map((value) => (
                      <Button
                        key={value}
                        variant="outline"
                        size="icon"
                        onClick={() => setColor(value)}
                        aria-label={value}
                        aria-pressed={color === value}
                        className={cn("rounded-full", color === value && "ring-2 ring-primary")}
                      >
                        <span
                          className={cn(
                            "size-7 rounded-full",
                            value === "Iceblue"
                              ? "bg-product-blue"
                              : value === "Lavender"
                                ? "bg-product-lilac"
                                : "bg-logo",
                          )}
                        />
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="mt-5">
                  <p className="text-sm">Storage</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.storage.map((value) => (
                      <Button
                        key={value}
                        variant={storage === value ? "default" : "outline"}
                        className={cn("rounded-full", storage === value && "bg-logo hover:bg-logo")}
                        onClick={() => setStorage(value)}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="mt-5">
                  <p className="text-sm">RAM</p>
                  <div className="mt-2 flex gap-2">
                    {["8GB", "12GB"].map((value) => (
                      <Button
                        key={value}
                        variant={ram === value ? "default" : "outline"}
                        className={cn("rounded-full", ram === value && "bg-logo hover:bg-logo")}
                        onClick={() => setRam(value)}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="mt-7 rounded-card border border-primary/60 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <b className="text-primary">●</b> Easy EMI
                  <br />
                  <small className="ml-4 text-muted-foreground">Flexible monthly payments</small>
                </span>
                <b className="text-right">{product.monthly.replace("/mo", " x 24mo")}</b>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {offers.map((offer) => (
                  <div key={offer} className="rounded-md border border-border p-3">
                    <b>₹2,500 Off</b>
                    <p className="text-xs text-muted-foreground">{offer}</p>
                    <button className="mt-2 text-xs font-semibold text-primary">View offer</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-y border-border py-5">
              <div>
                <span className="text-xs text-muted-foreground">Starting at</span>
                <p className="text-xl font-semibold">{product.monthly}</p>
              </div>
              <Button asChild className="w-full rounded-full sm:w-56">
                <Link to="/cart">
                  <ShoppingCart className="size-4" />
                  Buy Now
                </Link>
              </Button>
            </div>
            <div className="mt-6">
              <h2 className="font-display text-2xl">Delivery details</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Orders are checked at delivery so you can verify the product is genuine, undamaged
                and in perfect working condition.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Orders placed for resale, commercial use or in bulk may be cancelled under the
                applicable order policy.
              </p>
              <div className="mt-5 flex gap-4 rounded-card bg-muted p-5">
                <Box className="size-6 shrink-0 text-primary" />
                <div>
                  <b>Open Box Delivery for Your Peace of Mind</b>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your order will be opened in your presence at delivery.
                  </p>
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-border bg-background">
                <button
                  type="button"
                  aria-expanded={termsOpen}
                  onClick={() => setTermsOpen((value) => !value)}
                  className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold transition-colors hover:text-primary"
                >
                  Terms &amp; Conditions
                  <ChevronDown
                    className={cn("size-4 transition-transform", termsOpen && "rotate-180")}
                  />
                </button>
                {termsOpen && (
                  <p className="border-t border-border px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                    Open Box Delivery lets you inspect the device at delivery before accepting it.
                    Delivery timing and order eligibility depend on the selected address and the
                    applicable BytePe order policies.
                  </p>
                )}
              </div>
            </div>
            <div className="mt-5 rounded-card border border-primary/40 p-5">
              <h3 className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="size-5 text-success" />
                BytePe Verified
              </h3>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
                <div>
                  <ShieldCheck className="mx-auto mb-2 text-primary" />
                  Authorised Seller
                </div>
                <div>
                  <Star className="mx-auto mb-2 text-primary" />
                  Top Rated
                </div>
                <div>
                  <PackageCheck className="mx-auto mb-2 text-primary" />
                  Brand New
                </div>
              </div>
            </div>
            <section aria-labelledby="protection-title" className="mt-7 space-y-4">
              <h2 id="protection-title" className="font-display text-2xl">
                Protection Plan &amp; Assured Buyback
              </h2>
              <article className="rounded-2xl border border-sky-200 bg-slate-50 p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-full bg-white text-primary shadow-sm">
                    <ShieldCheck className="size-5" />
                  </span>
                  <h3 className="font-semibold">Protection Plan</h3>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary bg-white px-3 py-3.5 sm:px-4">
                  <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                    <span>12 mo Device Protection</span>
                    <Info
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-label="Plan information"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground line-through">
                      {formatRupees(Math.max(9999, Math.round(listedPrice * 0.074)))}
                    </span>
                    <b>{formatRupees(1)}</b>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="size-3.5" /> Included
                  </span>
                </div>
              </article>

              <article className="rounded-2xl border border-sky-200 bg-slate-50 p-4 sm:p-5">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-full bg-white text-primary shadow-sm">
                      <RefreshCw className="size-5" />
                    </span>
                    <h3 className="font-semibold">Assured buyback</h3>
                  </div>
                  <div className="text-right">
                    <b className="text-lg">{formatRupees(buybackValue)}</b>
                    <span className="block text-xs text-muted-foreground">{buybackMonth} mo</span>
                  </div>
                </div>
                <div className="rounded-xl border border-sky-100 bg-white p-3 sm:p-4">
                  <div className="mb-2 flex justify-between text-[11px] font-semibold text-foreground sm:text-xs">
                    <span>{formatRupees(Math.round(88000 * valueFactor))}</span>
                    <span>{formatRupees(Math.round(56000 * valueFactor))}</span>
                    <span>{formatRupees(Math.round(40000 * valueFactor))}</span>
                  </div>
                  <input
                    aria-label="Choose buyback month"
                    type="range"
                    min="0"
                    max="7"
                    step="1"
                    value={buybackMonths.indexOf(buybackMonth)}
                    onChange={(event) =>
                      setBuybackMonth(buybackMonths[Number(event.target.value)] ?? 21)
                    }
                    className="h-2 w-full cursor-pointer accent-primary"
                  />
                  <div className="mt-2 grid grid-cols-8 text-center text-[10px] text-muted-foreground sm:text-xs">
                    {buybackMonths.map((month) => (
                      <span
                        key={month}
                        className={cn(
                          "tabular-nums",
                          month === buybackMonth && "font-bold text-foreground",
                        )}
                      >
                        {month}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-muted-foreground sm:text-xs">
                    <span>Estimated value varies by selected month</span>
                    <span className="shrink-0 font-semibold text-primary">
                      {buybackMonth} months
                    </span>
                  </div>
                </div>
                <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
                  {[
                    {
                      id: "ownership",
                      title: "Do I own the phone?",
                      answer:
                        "Yes. The phone is yours to use throughout the plan. The buyback option is available if you choose to return or upgrade your device.",
                    },
                    {
                      id: "lock-in",
                      title: "Is there any lock-in period?",
                      answer:
                        "No, there is no lock-in period. You can return or upgrade your device anytime and claim the assured buyback value applicable for that month.",
                    },
                  ].map((faq) => (
                    <div key={faq.id}>
                      <button
                        type="button"
                        aria-expanded={openBuybackFaq === faq.id}
                        onClick={() => setOpenBuybackFaq(openBuybackFaq === faq.id ? "" : faq.id)}
                        className="flex min-h-11 w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm font-medium transition-colors hover:text-primary sm:px-4"
                      >
                        <span>{faq.title}</span>
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 transition-transform",
                            openBuybackFaq === faq.id && "rotate-180",
                          )}
                        />
                      </button>
                      {openBuybackFaq === faq.id && (
                        <p className="bg-rose-50/70 px-3 py-3 text-xs leading-relaxed text-muted-foreground sm:px-4 sm:text-sm">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </article>
              <p className="px-1 text-xs leading-relaxed text-muted-foreground">
                Illustrative buyback estimate for the selected month. Final eligibility and value
                are subject to device condition and plan terms.
              </p>
            </section>
          </section>

          {viewerOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${product.name} image viewer`}
              className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between gap-3 p-3 sm:p-5">
                <p className="truncate text-sm font-medium sm:text-base">
                  {product.name}{" "}
                  <span className="text-white/60">
                    · {activeImage + 1} / {gallery.length}
                  </span>
                </p>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => setViewerZoomed((value) => !value)}
                    aria-label={viewerZoomed ? "Zoom out" : "Zoom in"}
                  >
                    {viewerZoomed ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => setViewerOpen(false)}
                    aria-label="Close image viewer"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 pb-4 sm:px-16">
                <button
                  type="button"
                  onClick={() =>
                    setActiveImage((index) => (index - 1 + gallery.length) % gallery.length)
                  }
                  className="absolute left-2 z-10 grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 sm:left-5 sm:size-12"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <div className="flex size-full items-center justify-center overflow-auto">
                  <img
                    src={currentImage.image}
                    alt={`${product.brand} ${product.name} — ${currentImage.label}`}
                    className={cn(
                      "max-h-full max-w-full object-contain transition-transform duration-300",
                      viewerZoomed && "scale-150 cursor-zoom-out",
                    )}
                    style={{ objectPosition: currentImage.position }}
                    onClick={() => setViewerZoomed((value) => !value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setActiveImage((index) => (index + 1) % gallery.length)}
                  className="absolute right-2 z-10 grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 sm:right-5 sm:size-12"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-6" />
                </button>
              </div>
              <div className="flex justify-center gap-2 overflow-x-auto px-3 pb-4 sm:pb-6">
                {gallery.map((image, index) => (
                  <button
                    key={`viewer-${image.label}-${index}`}
                    type="button"
                    onClick={() => {
                      setActiveImage(index);
                      setViewerZoomed(false);
                    }}
                    className={cn(
                      "size-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white/10 p-1 transition sm:size-16",
                      activeImage === index
                        ? "border-primary"
                        : "border-white/20 hover:border-white/60",
                    )}
                    aria-label={`View ${image.label}`}
                    aria-pressed={activeImage === index}
                  >
                    <img src={image.image} alt="" className="size-full rounded object-contain" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <section className="mt-16 border-t border-border pt-10">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
            Everything you need to know
          </p>
          <h2 className="mt-2 font-display text-3xl">All Details</h2>
          <div className="mt-4 flex gap-6 border-b border-border">
            {["Description", "Specifications"].map((value) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={cn(
                  "border-b-2 pb-3 text-sm",
                  tab === value
                    ? "border-primary font-semibold"
                    : "border-transparent text-muted-foreground",
                )}
              >
                {value}
              </button>
            ))}
          </div>
          {tab === "Description" ? (
            <div className="py-5 text-sm">
              <p>
                The {product.brand} {product.name} brings a thoughtful everyday experience with a
                beautiful design, reliable performance and features made to keep up with your
                routine.
              </p>
              <h3 className="mt-5 font-semibold">Key Features</h3>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="grid gap-3 py-5 text-sm sm:grid-cols-2">
              <p>
                <b>Brand:</b> {product.brand}
              </p>
              <p>
                <b>Category:</b> {product.category}
              </p>
              {isPhone && (
                <>
                  <p>
                    <b>Storage:</b> {storage}
                  </p>
                  <p>
                    <b>RAM:</b> {ram}
                  </p>
                  <p>
                    <b>Colour:</b> {color}
                  </p>
                </>
              )}
            </div>
          )}
        </section>

        <section aria-labelledby="product-gallery-title" className="mt-10 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
              A closer look
            </p>
            <h2 id="product-gallery-title" className="mt-1 font-display text-3xl">
              Made for every moment
            </h2>
          </div>
          <div className="space-y-4">
            {gallery.map((image, index) => (
              <figure
                key={`full-detail-${image.label}-${index}`}
                className={cn(
                  "group relative min-h-[260px] overflow-hidden rounded-card sm:min-h-[380px] lg:min-h-[480px]",
                  index % 2 ? "bg-primary-soft" : "bg-product-blue",
                )}
              >
                <img
                  src={image.image}
                  alt={`${product.brand} ${product.name} — ${image.label}`}
                  className="absolute inset-0 size-full object-contain p-5 transition duration-700 group-hover:scale-[1.025] sm:p-8"
                  style={{ objectPosition: image.position }}
                  loading="lazy"
                />
                <figcaption className="absolute bottom-4 left-4 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow-sm sm:bottom-6 sm:left-6">
                  {image.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
                Keep exploring
              </p>
              <h2 className="mt-1 font-display text-3xl">You may also like</h2>
            </div>
            <Link to="/products" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {catalog
              .filter((item) => item.slug !== product.slug && item.category === product.category)
              .slice(0, 4)
              .map((item) => (
                <Link
                  key={item.slug}
                  to="/products/$slug"
                  params={{ slug: item.slug }}
                  className="group overflow-hidden rounded-card border border-border transition hover:-translate-y-1 hover:shadow-card"
                >
                  <div className={cn("aspect-square overflow-hidden", item.tone)}>
                    <img
                      src={item.image}
                      alt={`${item.brand} ${item.name}`}
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                      style={{ objectPosition: item.imagePosition ?? "center" }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground">{item.brand}</p>
                    <p className="mt-1 line-clamp-1 text-sm font-semibold">{item.name}</p>
                    <p className="mt-2 text-xs font-semibold text-primary">{item.price}</p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function RefreshCwIcon() {
  return <PackageCheck className="size-5 text-primary" />;
}
