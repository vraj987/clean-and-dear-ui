import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  LoaderCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Smartphone,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import subscriptionPhones from "@/assets/subscription-phones.jpg";
import heroImage from "@/assets/bytepe-hero.jpg";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getBrands,
  getModels,
  getPackages,
  getSubscriptionProducts,
  type BrandRecord,
  type ModelRecord,
  type PackageRecord,
  type SubscriptionProduct,
} from "@/services/api/catalog";

export const Route = createFileRoute("/subscription")({
  head: () => ({
    meta: [
      { title: "BytePe Subscription — BytePe" },
      {
        name: "description",
        content: "Get the latest phone every year with a simple monthly BytePe subscription.",
      },
      { property: "og:title", content: "BytePe Subscription — BytePe" },
      {
        property: "og:description",
        content: "Get the latest phone every year with a simple monthly BytePe subscription.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packagesError, setPackagesError] = useState("");

  useEffect(() => {
    let current = true;
    void getPackages()
      .then((records) => {
        if (current) setPackages(records);
      })
      .catch((error: unknown) => {
        if (current)
          setPackagesError(error instanceof Error ? error.message : "Unable to load packages.");
      })
      .finally(() => {
        if (current) setPackagesLoading(false);
      });
    return () => {
      current = false;
    };
  }, []);

  return (
    <PageShell>
      <main>
        <section className="relative isolate overflow-hidden bg-logo text-logo-foreground">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-logo via-logo/90 to-logo/35" />
          <img
            src={subscriptionPhones}
            alt="A selection of modern smartphones"
            className="absolute inset-0 -z-20 size-full object-cover opacity-50"
          />
          <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-14 md:grid-cols-[1fr_.8fr] md:items-center md:px-8 md:py-20">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[.18em] text-primary-soft">
                <Sparkles className="size-4" />
                BytePe subscription
              </p>
              <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
                Get more value when it’s time to upgrade.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
                Buying a new phone at a store or already have one? Choose one of three monthly plans
                and set a duration to see your month-wise estimated buyback value, or Kimmat Lock.
                When you are ready to sell or upgrade, your selected plan could help you get extra
                value back.
              </p>
              <a
                href="#plans"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary-hover"
              >
                Explore plans
                <ArrowRight className="size-4" />
              </a>
            </div>
            <div className="hidden md:block">
              <img
                src={heroImage}
                alt="Modern phone ready for everyday use"
                className="ml-auto aspect-[4/3] w-full max-w-[510px] rounded-3xl object-cover shadow-2xl"
              />
            </div>
          </div>
        </section>

        <section id="plans" className="mx-auto max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">
              Choose what fits your life
            </p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">
              Choose the plan that works for you
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Compare three plan options and see how your estimated buyback value changes with the
              device and duration you select.
            </p>
          </div>
          {packagesError && (
            <p role="status" className="mt-6 text-center text-sm text-destructive">
              {packagesError}
            </p>
          )}
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {packagesLoading ? (
              <div className="col-span-full flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" /> Loading plans…
              </div>
            ) : (
              packages.map((item, index) => (
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
                    <img
                      src={item.package_image_url}
                      alt={item.package_name}
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
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
                      {packageDescriptionText(item.package_description)}
                    </p>
                    <a
                      href="#estimate"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      Calculate your estimate
                      <ArrowRight className="size-4" />
                    </a>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section id="estimate" className="bg-muted/60 px-4 py-12 md:px-8 md:py-16">
          <SubscriptionEstimator packages={packages} packagesLoading={packagesLoading} />
        </section>
        <section className="mx-auto grid max-w-[1400px] gap-5 px-4 py-12 md:grid-cols-3 md:px-8">
          {[
            [
              "01",
              "Choose your plan",
              "Select a plan whether you are buying a new phone or already own your device.",
            ],
            [
              "02",
              "Set your duration",
              "Choose a month-by-month duration and compare the estimate.",
            ],
            [
              "03",
              "Choose what’s next",
              "See the estimated extra value you could receive when you sell or upgrade.",
            ],
          ].map(([number, title, description]) => (
            <article
              key={number}
              className="flex gap-4 rounded-2xl border border-border p-5 transition hover:-translate-y-1 hover:shadow-card"
            >
              <span className="font-display text-3xl text-primary">{number}</span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
    </PageShell>
  );
}

function packageDescriptionText(description: string | undefined) {
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

// Heritage metallic palette backup:
// Silver #E8DCC8, Gold #C6A75E, Platinum #1F2A44.
const packageThemes = {
  Silver: {
    surface: "#F8FAFC",
    idle: "#EEF2F6",
    accent: "#64748B",
    foreground: "#64748B",
    gradient: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 42%, #E2E8F0 72%, #FFFFFF 100%)",
  },
  Gold: {
    surface: "#FFFDF0",
    idle: "#F8F0D2",
    accent: "#CA8A04",
    foreground: "#713F12",
    gradient: "linear-gradient(135deg, #FFF8DB 0%, #FFFDF0 42%, #F4D98B 72%, #FFF8DB 100%)",
  },
  Platinum: {
    surface: "#0F172A",
    idle: "#1E293B",
    accent: "#E2E8F0",
    foreground: "#E2E8F0",
    gradient: "linear-gradient(135deg, #24324D 0%, #0F172A 42%, #080F1E 72%, #1D2A43 100%)",
  },
} as const;

const fallbackPackageTheme = {
  surface: "#F8FAFC",
  idle: "#EEF2F6",
  accent: "#64748B",
  foreground: "#64748B",
  gradient: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 42%, #E2E8F0 72%, #FFFFFF 100%)",
};

function getPackageTheme(name: string) {
  const normalizedName = name.trim().toLowerCase();
  if (normalizedName === "silver") return packageThemes.Silver;
  if (normalizedName === "gold") return packageThemes.Gold;
  if (normalizedName === "platinum") return packageThemes.Platinum;
  return fallbackPackageTheme;
}

function SubscriptionEstimator({
  packages,
  packagesLoading,
}: {
  packages: PackageRecord[];
  packagesLoading: boolean;
}) {
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [brand, setBrand] = useState<BrandRecord | null>(null);
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [model, setModel] = useState<ModelRecord | null>(null);
  const [storageOptions, setStorageOptions] = useState<SubscriptionProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SubscriptionProduct | null>(null);
  const [packageId, setPackageId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const [duration, setDuration] = useState(4);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [storageLoading, setStorageLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [estimate, setEstimate] = useState<SubscriptionProduct | null>(null);
  const packagePickerRef = useRef<HTMLDivElement>(null);
  const packageButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [packageHighlight, setPackageHighlight] = useState({
    left: 0,
    width: 0,
    leftPercent: 0,
    rightPercent: 0,
  });
  const sortedPackages = [...packages].sort(
    (first, second) => Number(first.package_percentage) - Number(second.package_percentage),
  );
  const activePackage = sortedPackages.find((item) => item.package_id === packageId);
  const activeTheme = getPackageTheme(activePackage?.package_name ?? "");
  const activePlanName = activePackage?.package_name.toLowerCase() ?? "";
  const selectedPlanSurfaces: Record<string, string> = {
    silver: "rgb(250 251 253)",
    gold: "#F8F0D2",
    platinum: "rgb(7 16 30)",
  };
  const activeSurface = selectedPlanSurfaces[activePlanName] ?? activeTheme.surface;
  const usesSolidPlanSurface = activePlanName in selectedPlanSurfaces;
  const amount = Number(finalAmount.replace(/[^\d.]/g, "")) || 0;
  const activeQuote = estimate?.packages?.find((item) => item.package_id === packageId);
  const canGenerate = Boolean(
    brand &&
    model &&
    selectedProduct &&
    purchaseDate &&
    amount > 0 &&
    activeQuote,
  );

  useEffect(() => {
    let current = true;
    setBrandsLoading(true);
    void getBrands()
      .then((records) => {
        if (current) setBrands(records);
      })
      .catch((error: unknown) => {
        if (current)
          setDataError(error instanceof Error ? error.message : "Unable to load phone brands.");
      })
      .finally(() => {
        if (current) setBrandsLoading(false);
      });
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    if (!brand) {
      setModels([]);
      return;
    }
    let current = true;
    setModelsLoading(true);
    setDataError("");
    void getModels(brand.brand_id)
      .then((records) => {
        if (current) setModels(records);
      })
      .catch((error: unknown) => {
        if (current)
          setDataError(error instanceof Error ? error.message : "Unable to load phone models.");
      })
      .finally(() => {
        if (current) setModelsLoading(false);
      });
    return () => {
      current = false;
    };
  }, [brand]);

  useEffect(() => {
    if (!brand || !model) {
      setStorageOptions([]);
      return;
    }
    let current = true;
    setStorageLoading(true);
    setDataError("");
    setStorageOptions([]);
    void getSubscriptionProducts({
      brand_id: brand.brand_id,
      model_id: model.model_id,
      product_id: "",
      category_id: "",
      invoice_date: "",
      purchase_price: "",
      duration: "",
      package_id: "",
    })
      .then((records) => {
        if (current) setStorageOptions(records);
      })
      .catch((error: unknown) => {
        if (current)
          setDataError(error instanceof Error ? error.message : "Unable to load storage options.");
      })
      .finally(() => {
        if (current) setStorageLoading(false);
      });
    return () => {
      current = false;
    };
  }, [brand, model]);

  useEffect(() => {
    const orderedPackages = [...packages].sort(
      (first, second) => Number(first.package_percentage) - Number(second.package_percentage),
    );
    if (!orderedPackages.length) return;
    if (!orderedPackages.some((item) => item.package_id === packageId)) {
      const preferred = orderedPackages.find((item) => item.package_name.toLowerCase() === "gold");
      setPackageId(preferred?.package_id ?? orderedPackages[0]!.package_id);
    }
  }, [packages, packageId]);

  useEffect(() => {
    const picker = packagePickerRef.current;
    if (!picker) return;
    const orderedPackages = [...packages].sort(
      (first, second) => Number(first.package_percentage) - Number(second.package_percentage),
    );
    const updateHighlight = () => {
      const activeIndex = orderedPackages.findIndex((item) => item.package_id === packageId);
      const activeButton = packageButtonRefs.current[activeIndex];
      const pickerWidth = picker.clientWidth;
      if (activeButton && pickerWidth > 0) {
        const left = activeButton.offsetLeft;
        const width = activeButton.offsetWidth;
        setPackageHighlight({
          left,
          width,
          leftPercent: (left / pickerWidth) * 100,
          rightPercent: ((left + width) / pickerWidth) * 100,
        });
      }
    };
    updateHighlight();
    const observer = new ResizeObserver(updateHighlight);
    observer.observe(picker);
    return () => observer.disconnect();
  }, [packageId, packages]);

  useEffect(() => {
    if (!brand || !model || !selectedProduct || !purchaseDate || amount <= 0 || !packageId) {
      setEstimate(null);
      return;
    }
    let current = true;
    const timer = window.setTimeout(() => {
      void getSubscriptionProducts({
        brand_id: brand.brand_id,
        model_id: model.model_id,
        product_id: selectedProduct.product_id,
        category_id: "",
        invoice_date: purchaseDate,
        purchase_price: String(amount),
        duration: String(duration),
        package_id: packageId,
      })
        .then((records) => {
          if (!current) return;
          const matching = records.find(
            (record) => record.product_id === selectedProduct.product_id,
          );
          if (!matching) throw new Error("No estimate was returned for this selection.");
          if (!matching.packages?.some((item) => item.package_id === packageId))
            throw new Error("No package estimate was returned for this selection.");
          setEstimate(matching);
        })
        .catch((error: unknown) => {
          if (current) console.error("Unable to calculate estimate.", error);
        });
    }, 250);
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [brand, model, selectedProduct, purchaseDate, amount, duration, packageId]);

  function formatPrice(value: string | number | null | undefined) {
    const numeric = Number(value);
    return value === undefined || value === null || value === "" || !Number.isFinite(numeric)
      ? "—"
      : `₹${Math.round(numeric).toLocaleString("en-IN")}`;
  }

  function selectBrand(value: string) {
    const selected = brands.find((item) => item.brand_id === value) ?? null;
    setBrand(selected);
    setModel(null);
    setStorageOptions([]);
    setSelectedProduct(null);
    setDataError("");
  }

  function selectModel(value: string) {
    const selected = models.find((item) => item.model_id === value);
    if (!selected) return;
    setModel(selected);
    setSelectedProduct(null);
  }

  function selectStorage(value: string) {
    setSelectedProduct(storageOptions.find((item) => item.product_id === value) ?? null);
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1100px] overflow-x-clip">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">
          Personalise your plan
        </p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl">Build your monthly estimate</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Choose your device and purchase details. Compare package prices and buyback estimates as
          you adjust the duration.
        </p>
      </div>

      <div className="mt-8 w-full min-w-0 rounded-3xl border border-border bg-background p-4 shadow-card sm:p-7">
        <div className="space-y-8">
          <section className="w-full min-w-0" aria-labelledby="device-selection-title">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-primary-soft text-primary">
                <Smartphone className="size-5" />
              </span>
              <div>
                <h3 id="device-selection-title" className="font-display text-2xl">
                  Your device details
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  All choices stay together on this page.
                </p>
              </div>
            </div>
            <div className="min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-5">
              <SearchablePicker
                label="Phone brand"
                placeholder={brandsLoading ? "Loading phone brands…" : "Search or choose a brand"}
                selectedLabel={brand?.brand_name ?? ""}
                options={brands.map((item) => ({
                  label: item.brand_name,
                  value: item.brand_id,
                }))}
                onSelect={selectBrand}
                loading={brandsLoading}
              />
              {brand && (
                <SearchablePicker
                  label="Phone model"
                  placeholder={modelsLoading ? "Loading models…" : "Search or choose a model"}
                  selectedLabel={model?.model_name ?? ""}
                  options={models.map((item) => ({
                    label: item.model_name,
                    value: item.model_id,
                  }))}
                  onSelect={selectModel}
                  loading={modelsLoading}
                />
              )}
            </div>
            {model && (
              <fieldset className="mt-5">
                <legend className="mb-2 text-sm font-semibold">Select storage</legend>
                {storageLoading ? (
                  <p className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                    <LoaderCircle className="size-4 animate-spin" /> Loading available storage…
                  </p>
                ) : storageOptions.length ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {storageOptions.map((item) => (
                      <button
                        key={item.product_id}
                        type="button"
                        aria-pressed={selectedProduct?.product_id === item.product_id}
                        onClick={() => selectStorage(item.product_id)}
                        className={cn(
                          "rounded-xl border px-3 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary-soft/50",
                          selectedProduct?.product_id === item.product_id
                            ? "border-primary bg-primary-soft text-primary shadow-sm"
                            : "border-border",
                        )}
                      >
                        {item.product_variant}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="py-3 text-sm text-muted-foreground">
                    Choose a model to see its available storage.
                  </p>
                )}
              </fieldset>
            )}
            {dataError && (
              <p role="status" className="mt-3 text-sm text-destructive">
                {dataError}
              </p>
            )}
            <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="min-w-0">
                <span className="mb-1.5 block text-sm font-semibold">Purchase date</span>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(event) => {
                    setPurchaseDate(event.target.value);
                  }}
                  className="h-12 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <label className="min-w-0">
                <span className="mb-1.5 block text-sm font-semibold">Final purchase amount</span>
                <span className="flex h-12 items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                  <span className="text-sm text-muted-foreground">₹</span>
                  <input
                    inputMode="numeric"
                    value={finalAmount}
                    onChange={(event) => {
                      setFinalAmount(event.target.value.replace(/[^\d.]/g, ""));
                    }}
                    placeholder="Enter invoice total"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                </span>
              </label>
            </div>
          </section>

          <section
            aria-labelledby="packages-title"
            className="w-full min-w-0 rounded-3xl border border-[#dce1e8] bg-[#7775806e] p-4 shadow-sm sm:p-6"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.15em] text-primary">
                  Compare Packages
                </p>
                <h3 id="packages-title" className="mt-1 font-display text-2xl sm:text-3xl">
                  Pick your protection
                </h3>
              </div>
            </div>

            <div
              ref={packagePickerRef}
              className="relative mt-5 grid min-h-[60px] grid-cols-3 gap-2 sm:min-h-[72px] sm:gap-3"
            >
             
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-full z-0 h-4 w-full overflow-visible"
                viewBox="0 0 100 16"
                preserveAspectRatio="none"
              >
                <path
                  d={`M ${packageHighlight.leftPercent} 0 C ${packageHighlight.leftPercent} 8 0 8 0 16 L 100 16 C 100 8 ${packageHighlight.rightPercent} 8 ${packageHighlight.rightPercent} 0 Z`}
                  fill={activeSurface}
                />
              </svg>
              {packagesLoading ? (
                <p className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" /> Loading packages…
                </p>
              ) : (
                sortedPackages.map((item, index) => {
                  const selected = packageId === item.package_id;
                  const itemTheme = getPackageTheme(item.package_name);
                  return (
                    <button
                      key={item.package_id}
                      ref={(element) => {
                        packageButtonRefs.current[index] = element;
                      }}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setPackageId(item.package_id);
                      }}
                      className={cn(
                        "relative z-10 flex min-h-[60px] items-center justify-center rounded-xl border bg-transparent px-2 py-3 text-center transition-colors duration-300 motion-reduce:transition-none sm:min-h-[72px] sm:rounded-2xl sm:px-4 sm:py-3",
                        selected
                          ? "package-active-tab z-20 border-2 text-foreground"
                          : "border-border text-foreground",
                      )}
                      style={
                        selected
                          ? {
                              borderColor: "transparent",
                              backgroundColor: activeSurface,
                              color: activeTheme.foreground,
                              borderRadius: "1.25rem 1.25rem 0 0",
                              boxShadow: `0 7px 14px color-mix(in srgb, ${activeSurface} 72%, transparent)`,
                            }
                          : {
                              borderColor: itemTheme.surface,
                              backgroundColor: itemTheme.idle,
                              color: itemTheme.foreground,
                            }
                      }
                    >
                      <span className="min-w-0">
                        <span className="block font-display text-sm font-semibold sm:text-base">
                          {item.package_name}
                        </span>
                      </span>
                      {selected && (
                        <Check
                          className="absolute right-2 top-2 size-3.5 sm:right-3 sm:top-3 sm:size-4"
                          style={{ color: activeTheme.accent }}
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div
              className="mt-4 rounded-2xl border border-border p-4 transition-colors duration-500 motion-reduce:transition-none sm:p-5"
              style={{
                backgroundColor: activeSurface,
                backgroundImage: usesSolidPlanSurface ? undefined : activeTheme.gradient,
                color: activeTheme.foreground,
                borderRadius: "0px 0px 10px 10px",
                borderColor: "transparent",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <p
                  className="text-xs font-semibold uppercase tracking-[.14em] sm:text-sm"
                  style={{ color: activeTheme.accent }}
                >
                  Choose your duration
                </p>
                <span className="shrink-0 whitespace-nowrap text-xs font-semibold tabular-nums text-current sm:text-base">
                  {duration} {duration === 1 ? "month" : "months"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                step="1"
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
                aria-label="Choose duration from 1 to 24 months"
                className="mt-5 block h-8 w-full min-w-0 cursor-pointer touch-pan-x accent-[#e65b31]"
                style={{ accentColor: activeTheme.accent }}
              />
              <div className="mt-2 flex justify-between text-[11px] font-medium sm:text-xs">
                {[1, 6, 12, 18, 24].map((month) => (
                  <span
                    key={month}
                    className={cn(month === duration && "font-bold")}
                    style={{ color: month === duration ? activeTheme.accent : activeTheme.foreground }}
                  >
                    {month}
                  </span>
                ))}
              </div>
              <div className="mt-3 grid min-w-0 gap-2 text-sm font-medium leading-relaxed sm:text-base">
                {model ? (
                  <p className="min-w-0 break-words text-current">
                    {brand?.brand_name} · {model.model_name} ·{" "}
                    {selectedProduct?.product_variant ?? "Choose storage"}
                  </p>
                ) : (
                  <p className="min-w-0 break-words text-current">
                    Select your brand, model and storage above
                  </p>
                )}
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                  <strong
                    className="text-2xl font-bold leading-tight tabular-nums sm:text-3xl"
                    style={{ color: activeTheme.accent }}
                  >
                    {formatPrice(activeQuote?.buyback_amount)}
                  </strong>
                  <span className="text-xs font-medium text-current sm:text-sm">
                    Assured buyback amount
                  </span>
                </div>
              </div>

              <div className="mt-4 flex min-w-0 items-center justify-between gap-2 sm:gap-4">
                <div className="min-w-0 shrink">
                  <p
                    className="text-xs opacity-80 sm:text-sm"
                    style={{ color: activeTheme.foreground }}
                  >
                    Package price
                  </p>
                  <p
                    className="mt-0.5 break-words text-lg font-semibold tabular-nums sm:text-2xl"
                    style={{ color: activeTheme.foreground }}
                  >
                    {formatPrice(activeQuote?.package_price)}
                  </p>
                </div>
                {canGenerate ? (
                  <Button
                    asChild
                    className="h-auto min-h-10 max-w-[62%] shrink-0 whitespace-normal rounded-full bg-[#e65b31] px-3 py-2 text-center text-xs leading-tight text-white hover:bg-[#cf4925] sm:max-w-none sm:px-5 sm:text-sm"
                  >
                    <Link to="/cart">
                      Proceed to checkout <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="h-auto min-h-10 max-w-[62%] shrink-0 whitespace-normal rounded-full bg-[#e65b31] px-3 py-2 text-center text-xs leading-tight text-white opacity-60 sm:max-w-none sm:px-5 sm:text-sm"
                  >
                    Proceed to checkout <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SearchablePicker({
  label,
  placeholder,
  selectedLabel,
  options,
  onSelect,
  loading = false,
}: {
  label: string;
  placeholder: string;
  selectedLabel: string;
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
  loading?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const listId = `picker-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="relative mt-5 w-full min-w-0">
      <label htmlFor={`${listId}-input`} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      <div className="flex h-12 min-w-0 items-center gap-3 rounded-xl border border-border bg-background px-4 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
        {loading ? (
          <LoaderCircle className="size-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <Search className="size-4 shrink-0 text-muted-foreground" />
        )}
        <input
          id={`${listId}-input`}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          disabled={loading}
          value={open ? query : selectedLabel}
          placeholder={placeholder}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onBlur={() => setOpen(false)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Enter" && filtered[0]) {
              event.preventDefault();
              onSelect(filtered[0].value);
              setQuery("");
              setOpen(false);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </div>
      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-2 max-h-60 overflow-auto rounded-xl border border-border bg-card p-1.5 shadow-xl"
        >
          {filtered.length ? (
            filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selectedLabel === option.label}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(option.value);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex min-h-11 w-full min-w-0 items-center break-words rounded-lg px-3 py-2 text-left text-sm transition hover:bg-primary-soft hover:text-primary focus:bg-primary-soft focus:outline-none"
              >
                {option.label}
              </button>
            ))
          ) : (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              No matches. Try another search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
