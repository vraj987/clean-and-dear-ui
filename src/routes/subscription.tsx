import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleCheck,
  CircleAlert,
  FileImage,
  LoaderCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import subscriptionPhones from "@/assets/subscription-phones.jpg";
import heroImage from "@/assets/bytepe-hero.jpg";
import { PageShell, rememberAuthReturnPath } from "@/components/shop/site-shell";
import { DurationScale } from "@/components/shop/duration-scale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getDurationMilestones,
  getKavachDeviceAgeMonths,
  getMinimumKavachDuration,
} from "@/lib/kavach-duration";
import {
  getPackageCtaStyle,
  getPackageSurface,
  getPackageTheme,
  packageCtaClassName,
  sortPackagesByTier,
} from "@/lib/package-theme";
import { readSubscriptionCache, writeSubscriptionCache } from "@/lib/subscription-cache";
import {
  getBrands,
  getModels,
  getPackages,
  getProductVariants,
  getSubscriptionProducts,
  type BrandRecord,
  type ModelRecord,
  type PackageRecord,
  type SubscriptionProduct,
} from "@/services/api/catalog";
import { apiQueryKeys } from "@/services/api/query-keys";
import { readAuthSession } from "@/services/api/auth";
import { purchaseKavach, type KavachPurchaseRecord } from "@/services/api/purchase-kavach.service";
import {
  lookupCustomerForStaff,
  saveCustomerForStaff,
} from "@/services/api/staff-customer.service";
import { apiConfig } from "@/services/api/config";
import { useCompanyDetails } from "@/services/api/company.service";
import {
  verifyKavachRazorpayPayment,
  type KavachRazorpayVerificationValues,
} from "@/services/api/kavach-razorpay-verify.service";
import { openRazorpayCheckout } from "@/services/razorpay";
import {
  installSubscriptionDiagnostics,
  logSubscriptionDiagnostic,
} from "@/lib/subscription-diagnostics";

export const Route = createFileRoute("/subscription")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "home-estimate" });
  },
  head: () => ({
    meta: [
      { title: "Kimaat Lock Subscription — Kimaat Lock" },
      {
        name: "description",
        content: "Get the latest phone every year with a simple monthly Kimaat Lock subscription.",
      },
      { property: "og:title", content: "Kimaat Lock Subscription — Kimaat Lock" },
      {
        property: "og:description",
        content: "Get the latest phone every year with a simple monthly Kimaat Lock subscription.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubscriptionPage,
});

async function runSubscriptionRequest<T>(
  name: string,
  request: () => Promise<T>,
  getCount?: (value: T) => number,
) {
  const startedAt = performance.now();
  logSubscriptionDiagnostic("api-start", { api: name });
  const pendingTimer =
    typeof window === "undefined"
      ? undefined
      : window.setTimeout(() => {
          logSubscriptionDiagnostic("api-still-pending", {
            api: name,
            elapsedMs: Math.round(performance.now() - startedAt),
          });
        }, 8000);
  try {
    const value = await request();
    logSubscriptionDiagnostic("api-success", {
      api: name,
      durationMs: Math.round(performance.now() - startedAt),
      ...(getCount ? { resultCount: getCount(value) } : {}),
    });
    return value;
  } catch (error) {
    logSubscriptionDiagnostic("api-failure", {
      api: name,
      durationMs: Math.round(performance.now() - startedAt),
      message: error instanceof Error ? error.message : "Unknown API error",
    });
    throw error;
  } finally {
    if (pendingTimer !== undefined) window.clearTimeout(pendingTimer);
  }
}

const DEVICE_DETAILS_STORAGE_KEY = "kimaat_subscription_device_details_v1";

type SavedDeviceDetails = {
  brandId: string;
  modelId: string;
  productId: string;
  purchaseDate: string;
  finalAmount: string;
  invoiceNumber: string;
  imeiNumber: string;
  serialNumber: string;
};

function SubscriptionPage() {
  useEffect(() => installSubscriptionDiagnostics(), []);
  const cachedPackages = readSubscriptionCache<PackageRecord[]>("packages");
  const packagesQuery = useQuery({
    queryKey: apiQueryKeys.packages,
    initialData: cachedPackages?.data,
    initialDataUpdatedAt: cachedPackages?.updatedAt,
    queryFn: () =>
      runSubscriptionRequest(
        "package.php",
        async () => {
          const result = await getPackages();
          writeSubscriptionCache("packages", result);
          return result;
        },
        (result) => result.length,
      ),
  });
  const packages = packagesQuery.data ?? [];
  const packagesLoading = packagesQuery.isLoading;
  const packagesError = packagesQuery.error instanceof Error ? packagesQuery.error.message : "";

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
                Kimaat Lock subscription
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
            ) : packages.length ? (
              sortPackagesByTier(packages).map((item, index) => (
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
                      {packageDescriptionText(item.package_description)}
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
              ))
            ) : (
              <p className="col-span-full rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
                No data found
              </p>
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

export function SubscriptionEstimator({
  packages,
  packagesLoading,
}: {
  packages: PackageRecord[];
  packagesLoading: boolean;
}) {
  const companyQuery = useCompanyDetails();
  const navigate = useNavigate();
  const staffSession = readAuthSession();
  const accountId = staffSession?.accountId ?? "";
  const isStaffUser =
    staffSession?.accountType === "vendor" || staffSession?.accountType === "employee";
  const [brand, setBrand] = useState<BrandRecord | null>(null);
  const [model, setModel] = useState<ModelRecord | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<SubscriptionProduct | null>(null);
  const [packageId, setPackageId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceScan, setInvoiceScan] = useState<{ progress: number; message: string } | null>(
    null,
  );
  const [invoiceScanError, setInvoiceScanError] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [imeiNumber, setImeiNumber] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [staffCustomerMobile, setStaffCustomerMobile] = useState("");
  const [staffCustomerName, setStaffCustomerName] = useState("");
  const [staffCustomerId, setStaffCustomerId] = useState("");
  const [staffCustomerLookupStatus, setStaffCustomerLookupStatus] = useState<
    "idle" | "loading" | "found" | "not-found" | "error"
  >("idle");
  const [staffCustomerLookupMessage, setStaffCustomerLookupMessage] = useState("");
  const [staffCustomerLookupAttempt, setStaffCustomerLookupAttempt] = useState(0);
  const estimatorRef = useRef<HTMLDivElement>(null);
  const invoiceScanId = useRef(0);
  const [duration, setDuration] = useState(4);
  const [dataError, setDataError] = useState("");
  const [estimate, setEstimate] = useState<SubscriptionProduct | null>(null);
  const [estimateError, setEstimateError] = useState("");
  const requestedPackageApplied = useRef(false);
  const [confirmPurchaseOpen, setConfirmPurchaseOpen] = useState(false);
  const [purchaseBusy, setPurchaseBusy] = useState(false);
  const [purchaseCreatedWithoutGatewayOrder, setPurchaseCreatedWithoutGatewayOrder] =
    useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseResult, setPurchaseResult] = useState<KavachPurchaseRecord | null>(null);
  const [purchaseSuccessOpen, setPurchaseSuccessOpen] = useState(false);
  const [purchaseFailureOpen, setPurchaseFailureOpen] = useState(false);
  const [purchaseFailureMessage, setPurchaseFailureMessage] = useState("");
  const [verificationPendingOpen, setVerificationPendingOpen] = useState(false);
  const [pendingVerification, setPendingVerification] =
    useState<KavachRazorpayVerificationValues | null>(null);
  const [verificationMessage, setVerificationMessage] = useState("");
  const savedDeviceDetailsRef = useRef<SavedDeviceDetails | null>(null);
  const restoreStageRef = useRef(0);
  const [deviceDetailsRestored, setDeviceDetailsRestored] = useState(false);

  const handleInvoiceFileChange = async (file: File | null) => {
    const scanId = ++invoiceScanId.current;
    setInvoiceFile(file);
    setInvoiceScanError("");
    setInvoiceScan(null);
    if (!file) return;

    setInvoiceScan({ progress: 0, message: "Preparing invoice scan…" });
    try {
      const { scanInvoiceFile } = await import("@/services/invoice-ocr/custom-invoice-scanner");
      const fields = await scanInvoiceFile(file, (progress, message) => {
        if (invoiceScanId.current === scanId) setInvoiceScan({ progress, message });
      });
      if (invoiceScanId.current !== scanId) return;

      if (fields.purchaseDate) setPurchaseDate(fields.purchaseDate);
      if (fields.finalAmount) setFinalAmount(fields.finalAmount);
      if (fields.invoiceNumber) setInvoiceNumber(fields.invoiceNumber);
      if (fields.imeiNumber) setImeiNumber(fields.imeiNumber);
      if (fields.serialNumber) setSerialNumber(fields.serialNumber);

      const found = [
        fields.purchaseDate,
        fields.finalAmount,
        fields.invoiceNumber,
        fields.imeiNumber,
        fields.serialNumber,
      ].filter(Boolean).length;
      setInvoiceScan({
        progress: 100,
        message: found
          ? `Invoice scanned. ${found} field${found === 1 ? "" : "s"} filled; review the values below.`
          : "Invoice scanned, but no fields were recognized. Enter the details below.",
      });
    } catch (error) {
      if (invoiceScanId.current !== scanId) return;
      setInvoiceScan(null);
      setInvoiceScanError(
        error instanceof Error
          ? `${error.message} You can still enter the details below.`
          : "Could not scan this invoice. You can still enter the details below.",
      );
    }
  };

  useEffect(() => {
    const revealItems =
      estimatorRef.current?.querySelectorAll<HTMLElement>("[data-estimate-reveal]");
    if (!revealItems?.length) return;
    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.setAttribute("data-visible", "true"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.setAttribute("data-visible", entry.isIntersecting ? "true" : "false");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" },
    );
    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  const brandsQuery = useQuery({
    queryKey: apiQueryKeys.brands,
    queryFn: () =>
      runSubscriptionRequest(
        "brand.php",
        () => getBrands(),
        (result) => result.length,
      ),
    staleTime: 0,
    refetchOnMount: "always",
  });
  const brands = brandsQuery.data ?? [];
  const modelsQuery = useQuery({
    queryKey: apiQueryKeys.models(brand?.brand_id ?? ""),
    queryFn: () =>
      runSubscriptionRequest(
        "model.php",
        () => getModels(brand!.brand_id),
        (result) => result.length,
      ),
    enabled: Boolean(brand?.brand_id),
    staleTime: 0,
    refetchOnMount: "always",
  });
  const models = modelsQuery.data ?? [];
  const storageQuery = useQuery({
    queryKey: apiQueryKeys.productVariants(brand?.brand_id ?? "", model?.model_id ?? ""),
    queryFn: () =>
      runSubscriptionRequest(
        "product_variant.php (storage options)",
        () => getProductVariants(brand!.brand_id, model!.model_id),
        (result) => result.length,
      ),
    enabled: Boolean(brand?.brand_id && model?.model_id),
    staleTime: 0,
    refetchOnMount: "always",
  });
  const storageOptions = useMemo(() => {
    const optionsByProductId = new Map<string, SubscriptionProduct>();
    for (const product of storageQuery.data ?? []) {
      if (brand?.brand_id && product.brand_id && product.brand_id !== brand.brand_id) continue;
      if (model?.model_id && product.model_id && product.model_id !== model.model_id) continue;
      const variants = product.product_varient?.length ? product.product_varient : [product];
      for (const variant of variants) {
        const productId = String(variant.product_id || product.product_id);
        if (!productId || optionsByProductId.has(productId)) continue;
        optionsByProductId.set(productId, {
          ...product,
          product_id: productId,
          product_variant: variant.product_variant || product.product_variant,
          ...(variant.mrp !== undefined ? { mrp: variant.mrp } : {}),
          ...(variant.retailer_price !== undefined
            ? { retailer_price: variant.retailer_price }
            : {}),
          ...(variant.product_image !== undefined ? { product_image: variant.product_image } : {}),
          ...(variant.product_image_url !== undefined
            ? { product_image_url: variant.product_image_url }
            : {}),
        });
      }
    }
    return [...optionsByProductId.values()];
  }, [brand?.brand_id, model?.model_id, storageQuery.data]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DEVICE_DETAILS_STORAGE_KEY);
      savedDeviceDetailsRef.current = saved ? (JSON.parse(saved) as SavedDeviceDetails) : null;
      if (!savedDeviceDetailsRef.current) setDeviceDetailsRestored(true);
    } catch {
      savedDeviceDetailsRef.current = null;
      setDeviceDetailsRestored(true);
    }
  }, []);

  useEffect(() => {
    const saved = savedDeviceDetailsRef.current;
    if (!saved || restoreStageRef.current !== 0 || !brandsQuery.data) return;
    setPurchaseDate(saved.purchaseDate ?? "");
    setFinalAmount(saved.finalAmount ?? "");
    setInvoiceNumber(saved.invoiceNumber ?? "");
    setImeiNumber(saved.imeiNumber ?? "");
    setSerialNumber(saved.serialNumber ?? "");
    const restoredBrand = brands.find((item) => item.brand_id === saved.brandId);
    if (!restoredBrand) {
      restoreStageRef.current = 3;
      setDeviceDetailsRestored(true);
      return;
    }
    restoreStageRef.current = 1;
    setBrand(restoredBrand);
  }, [brands, brandsQuery.data]);

  useEffect(() => {
    const saved = savedDeviceDetailsRef.current;
    if (
      !saved ||
      restoreStageRef.current !== 1 ||
      !brand ||
      (modelsQuery.data === undefined && !modelsQuery.isError)
    )
      return;
    const restoredModel = models.find((item) => item.model_id === saved.modelId);
    if (!restoredModel) {
      restoreStageRef.current = 3;
      setDeviceDetailsRestored(true);
      return;
    }
    restoreStageRef.current = 2;
    setModel(restoredModel);
  }, [brand, models, modelsQuery.data, modelsQuery.isError]);

  useEffect(() => {
    const saved = savedDeviceDetailsRef.current;
    if (
      !saved ||
      restoreStageRef.current !== 2 ||
      !model ||
      (storageQuery.data === undefined && !storageQuery.isError)
    )
      return;
    const restoredProduct = storageOptions.find((item) => item.product_id === saved.productId);
    if (restoredProduct) setSelectedProduct(restoredProduct);
    restoreStageRef.current = 3;
    setDeviceDetailsRestored(true);
  }, [model, storageOptions, storageQuery.data, storageQuery.isError]);

  useEffect(() => {
    if (!deviceDetailsRestored) return;
    const details: SavedDeviceDetails = {
      brandId: brand?.brand_id ?? "",
      modelId: model?.model_id ?? "",
      productId: selectedProduct?.product_id ?? "",
      purchaseDate,
      finalAmount,
      invoiceNumber,
      imeiNumber,
      serialNumber,
    };
    if (Object.values(details).every((value) => !value)) {
      window.localStorage.removeItem(DEVICE_DETAILS_STORAGE_KEY);
      savedDeviceDetailsRef.current = null;
      return;
    }
    try {
      window.localStorage.setItem(DEVICE_DETAILS_STORAGE_KEY, JSON.stringify(details));
      savedDeviceDetailsRef.current = details;
    } catch {
      // Keep the estimator usable if browser storage is unavailable or full.
    }
  }, [
    deviceDetailsRestored,
    brand,
    model,
    selectedProduct,
    purchaseDate,
    finalAmount,
    invoiceNumber,
    imeiNumber,
    serialNumber,
  ]);
  const brandOptions = useMemo(
    () => brands.map((item) => ({ label: item.brand_name, value: item.brand_id })),
    [brands],
  );
  const modelOptions = useMemo(
    () => models.map((item) => ({ label: item.model_name, value: item.model_id })),
    [models],
  );
  const brandsLoading = brandsQuery.isLoading;
  const modelsLoading = Boolean(brand) && modelsQuery.isLoading;
  const storageLoading = Boolean(model) && storageQuery.isLoading;
  const queryDataError = [brandsQuery.error, modelsQuery.error, storageQuery.error].find(
    (error) => error instanceof Error,
  );
  const sortedPackages = [...packages].sort(
    (first, second) => Number(first.package_percentage) - Number(second.package_percentage),
  );
  const activePackage = sortedPackages.find((item) => item.package_id === packageId);
  const activeTheme = getPackageTheme(activePackage?.package_name ?? "");
  const activePlanName = activePackage?.package_name.toLowerCase() ?? "";
  const activeSurface = getPackageSurface(activePlanName, activeTheme.surface);
  const amount = Number(finalAmount.replace(/[^\d.]/g, "")) || 0;
  const activeQuote = estimate?.packages?.find((item) => item.package_id === packageId);
  const deviceAgeMonths = getKavachDeviceAgeMonths(purchaseDate);
  const minimumDuration = getMinimumKavachDuration(purchaseDate);
  const deviceEligible = deviceAgeMonths <= 24;
  const durationEligible = deviceEligible && duration >= minimumDuration;
  const deviceSelectionComplete = Boolean(brand && model && selectedProduct);
  const packageSectionReady = Boolean(deviceSelectionComplete && purchaseDate && amount > 0);
  const canGenerate = Boolean(
    brand &&
    model &&
    selectedProduct &&
    purchaseDate &&
    amount > 0 &&
    invoiceNumber.trim() &&
    imeiNumber.trim() &&
    activeQuote &&
    durationEligible &&
    (!isStaffUser ||
      (/^\d{10}$/.test(staffCustomerMobile) &&
        staffCustomerName.trim() &&
        (staffCustomerLookupStatus === "found" || staffCustomerLookupStatus === "not-found"))) &&
    !pendingVerification,
  );
  const checkoutDisabledReasons = [
    !brand && "Phone brand",
    !model && "Phone model",
    !selectedProduct && "Storage",
    !purchaseDate && "Purchase date",
    amount <= 0 && "Final purchase amount",
    !invoiceNumber.trim() && "Invoice number",
    !imeiNumber.trim() && "IMEI number",
    !packageId && "Kavach package",
    purchaseDate &&
      !deviceEligible &&
      "device eligibility (purchase date must be within 24 months)",
    purchaseDate &&
      deviceEligible &&
      duration < minimumDuration &&
      `an eligible duration (month ${minimumDuration} or later)`,
    !activeQuote && !estimateError && "month-wise estimate",
    isStaffUser && !/^\d{10}$/.test(staffCustomerMobile) && "Customer number (10 digits)",
    isStaffUser && !staffCustomerName.trim() && "Customer name",
    isStaffUser &&
      /^\d{10}$/.test(staffCustomerMobile) &&
      !["found", "not-found"].includes(staffCustomerLookupStatus) &&
      (staffCustomerLookupStatus === "error"
        ? "customer number check (use Retry)"
        : "customer number verification"),
    pendingVerification && "current payment verification",
  ].filter((reason): reason is string => Boolean(reason));

  useEffect(() => {
    if (!isStaffUser || !staffSession) return;
    if (!/^\d{10}$/.test(staffCustomerMobile)) {
      setStaffCustomerLookupStatus("idle");
      setStaffCustomerLookupMessage("");
      setStaffCustomerId("");
      setStaffCustomerName("");
      return;
    }

    let cancelled = false;
    setStaffCustomerLookupStatus("loading");
    setStaffCustomerLookupMessage("Checking customer number…");
    const timer = window.setTimeout(() => {
      void lookupCustomerForStaff(staffSession, staffCustomerMobile)
        .then((customer) => {
          if (cancelled) return;
          if (customer) {
            setStaffCustomerId(customer.customer_id);
            setStaffCustomerName(customer.customer_name);
            setStaffCustomerLookupStatus("found");
            setStaffCustomerLookupMessage("Customer found. You can edit the name if needed.");
          } else {
            setStaffCustomerId("");
            setStaffCustomerName("");
            setStaffCustomerLookupStatus("not-found");
            setStaffCustomerLookupMessage("New customer. Enter their name to continue.");
          }
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setStaffCustomerId("");
          setStaffCustomerLookupStatus("error");
          setStaffCustomerLookupMessage(
            error instanceof Error ? error.message : "Could not check this customer number.",
          );
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    isStaffUser,
    staffSession?.accountId,
    staffSession?.authToken,
    staffCustomerMobile,
    staffCustomerLookupAttempt,
  ]);

  useEffect(() => {
    setDuration((current) => Math.min(24, Math.max(current, minimumDuration)));
  }, [minimumDuration]);

  useEffect(() => {
    if (!purchaseSuccessOpen) return;
    const timer = window.setTimeout(() => {
      setPurchaseSuccessOpen(false);
      void navigate({ to: "/orders" });
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [purchaseSuccessOpen, navigate]);

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
    if (packagesLoading || requestedPackageApplied.current || typeof window === "undefined") return;
    requestedPackageApplied.current = true;
    const requestedPackageId = new URLSearchParams(window.location.search).get("packageId");
    if (!requestedPackageId || !packages.some((item) => item.package_id === requestedPackageId))
      return;
    setPackageId(requestedPackageId);
    if (window.location.hash === "#estimate") {
      window.requestAnimationFrame(() => {
        document.getElementById("estimate")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [packages, packagesLoading]);

  useEffect(() => {
    if (
      !brand ||
      !model ||
      !selectedProduct ||
      !purchaseDate ||
      amount <= 0 ||
      !packageId ||
      !deviceEligible ||
      duration < minimumDuration
    ) {
      setEstimate(null);
      setEstimateError("");
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
            (record) => String(record.product_id) === String(selectedProduct.product_id),
          );
          if (!matching) throw new Error("No estimate was returned for this selection.");
          if (!matching.packages?.some((item) => String(item.package_id) === String(packageId)))
            throw new Error("No package estimate was returned for this selection.");
          setEstimate(matching);
          setEstimateError("");
        })
        .catch((error: unknown) => {
          if (!current) return;
          setEstimate(null);
          setEstimateError(
            error instanceof Error ? error.message : "Unable to calculate this estimate.",
          );
        });
    }, 250);
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [
    brand,
    model,
    selectedProduct,
    purchaseDate,
    amount,
    duration,
    deviceEligible,
    minimumDuration,
    packageId,
  ]);

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

  function clearEstimator() {
    invoiceScanId.current += 1;
    try {
      window.localStorage.removeItem(DEVICE_DETAILS_STORAGE_KEY);
    } catch {
      // The form still clears in memory if browser storage is unavailable.
    }
    savedDeviceDetailsRef.current = null;
    restoreStageRef.current = 3;
    setDeviceDetailsRestored(true);
    setBrand(null);
    setModel(null);
    setSelectedProduct(null);
    setPackageId("");
    setPurchaseDate("");
    setFinalAmount("");
    setInvoiceFile(null);
    setInvoiceScan(null);
    setInvoiceScanError("");
    setInvoiceNumber("");
    setImeiNumber("");
    setSerialNumber("");
    setStaffCustomerMobile("");
    setStaffCustomerName("");
    setStaffCustomerId("");
    setStaffCustomerLookupStatus("idle");
    setStaffCustomerLookupMessage("");
    setDuration(4);
    setEstimate(null);
    setEstimateError("");
    setDataError("");
  }

  function finishPurchaseSuccessfully() {
    clearEstimator();
    setPurchaseSuccessOpen(true);
  }

  async function submitKavachPurchase() {
    const merchantName =
      companyQuery.data?.result?.[0]?.company_name?.trim() ||
      apiConfig.projectName ||
      "Kimaat Lock";
    const session = readAuthSession();
    if (!session || !session.accountId) {
      setPurchaseError("Please sign in before purchasing Kavach.");
      return;
    }
    if (
      !selectedProduct ||
      !activeQuote ||
      !deviceEligible ||
      duration < minimumDuration ||
      !invoiceNumber.trim() ||
      !imeiNumber.trim() ||
      (isStaffUser &&
        (!/^\d{10}$/.test(staffCustomerMobile) ||
          !staffCustomerName.trim() ||
          (staffCustomerLookupStatus !== "found" && staffCustomerLookupStatus !== "not-found")))
    ) {
      setPurchaseError("Your estimate is no longer available. Please select the plan again.");
      return;
    }
    if (!apiConfig.razorpayKeyId) {
      setPurchaseError(
        "Razorpay is not configured yet. Add the public key ID as VITE_RAZORPAY_KEY_ID, then reload the page.",
      );
      return;
    }
    setPurchaseBusy(true);
    setPurchaseError("");
    try {
      const purchasingCustomer = isStaffUser
        ? await saveCustomerForStaff(session, {
            customer_mobile: staffCustomerMobile,
            customer_name: staffCustomerName.trim(),
          })
        : {
            customer_id: session.accountId,
            customer_name: session.name,
            customer_mobile: session.mobile,
          };
      setStaffCustomerId(purchasingCustomer.customer_id);
      const records = await purchaseKavach({
        kavach_customer_id: purchasingCustomer.customer_id,
        ...(isStaffUser && accountId ? { created_by_user_id: accountId } : {}),
        product_id: selectedProduct.product_id,
        filter_user: "1",
        invoice_date: purchaseDate,
        duration: String(duration),
        purchase_price: String(amount),
        package_id: activeQuote.package_id,
        package_name: activeQuote.package_name,
        package_percentage: activeQuote.package_percentage,
        buyback_amount: activeQuote.buyback_amount,
        package_price: activeQuote.package_price,
        invoice_number: invoiceNumber,
        imei_number: imeiNumber,
        serial_number: serialNumber,
        ...(invoiceFile ? { invoice_file: invoiceFile } : {}),
      });
      const purchaseRecord = records[0];
      if (!purchaseRecord) throw new Error("The purchase API did not return a Kavach order.");
      setPurchaseResult(purchaseRecord);
      const gatewayOrderId =
        purchaseRecord.razorpay_order_id ??
        purchaseRecord.razorpayOrderId ??
        purchaseRecord.kavach_razorpayOrderId ??
        "";
      if (!gatewayOrderId) {
        setPurchaseCreatedWithoutGatewayOrder(true);
        throw new Error("razorpay-order-id-missing");
      }

      const gatewayAmount = Number(purchaseRecord.razorpay_amount);
      const amountInPaise =
        Number.isFinite(gatewayAmount) && gatewayAmount > 0
          ? Math.round(gatewayAmount)
          : Math.round(Number(purchaseRecord.package_price || activeQuote.package_price) * 100);
      if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
        throw new Error("The purchase API returned an invalid Kavach payment amount.");
      }

      const checkoutResult = await openRazorpayCheckout({
        key: apiConfig.razorpayKeyId,
        orderId: gatewayOrderId,
        amount: amountInPaise,
        currency: purchaseRecord.razorpay_currency || "INR",
        name: merchantName,
        description: `${activeQuote.package_name} Kavach protection plan`,
        ...(purchasingCustomer.customer_name
          ? { customerName: purchasingCustomer.customer_name }
          : {}),
        ...(!isStaffUser && session.account["customer_email"]
          ? { customerEmail: session.account["customer_email"] }
          : {}),
        ...(purchasingCustomer.customer_mobile
          ? { customerPhone: purchasingCustomer.customer_mobile }
          : {}),
        notes: {
          kavach_order_id: purchaseRecord.kavach_order_id,
          customer_id: purchasingCustomer.customer_id,
        },
      });

      if (checkoutResult.type === "success") {
        const verification: KavachRazorpayVerificationValues = {
          kavach_customer_id: purchasingCustomer.customer_id,
          kavach_razorpayOrderId: checkoutResult.payment.razorpay_order_id || gatewayOrderId,
          current_kavach_order_id: purchaseRecord.kavach_order_id,
          razorpay_signature: checkoutResult.payment.razorpay_signature,
          razorpay_payment_id: checkoutResult.payment.razorpay_payment_id,
          kavach_razorpay_status: "2",
        };
        try {
          await verifyKavachRazorpayPayment(verification);
          setPurchaseResult(purchaseRecord);
          setConfirmPurchaseOpen(false);
          finishPurchaseSuccessfully();
        } catch (error) {
          setPendingVerification(verification);
          setVerificationMessage(
            error instanceof Error
              ? error.message
              : "Payment was received, but verification could not be completed.",
          );
          setConfirmPurchaseOpen(false);
          setVerificationPendingOpen(true);
        }
        return;
      }

      const failure = checkoutResult.type === "failed" ? checkoutResult.error : null;
      const failureOrderId = failure?.metadata?.order_id || gatewayOrderId;
      const message =
        checkoutResult.type === "dismissed"
          ? "Payment was cancelled. You closed the payment window before completing the payment."
          : failure?.description || "Your payment failed. Please try again.";
      let reportedMessage = message;
      try {
        await verifyKavachRazorpayPayment({
          kavach_customer_id: purchasingCustomer.customer_id,
          kavach_razorpayOrderId: failureOrderId,
          current_kavach_order_id: purchaseRecord.kavach_order_id,
          razorpay_signature: "",
          razorpay_payment_id: failure?.metadata?.payment_id || "",
          kavach_razorpay_status: "3",
        });
      } catch (error) {
        reportedMessage += ` The failed payment status could not be recorded: ${error instanceof Error ? error.message : "Please contact support."}`;
      }
      setPurchaseFailureMessage(reportedMessage);
      setConfirmPurchaseOpen(false);
      setPurchaseFailureOpen(true);
    } catch (error) {
      setPurchaseError(
        error instanceof Error
          ? error.message
          : "Unable to complete the purchase. Please try again.",
      );
    } finally {
      setPurchaseBusy(false);
    }
  }

  async function retryKavachVerification() {
    if (!pendingVerification) return;
    setPurchaseBusy(true);
    try {
      await verifyKavachRazorpayPayment(pendingVerification);
      setVerificationPendingOpen(false);
      setPendingVerification(null);
      finishPurchaseSuccessfully();
    } catch (error) {
      setVerificationMessage(
        error instanceof Error ? error.message : "Verification is still pending. Please try again.",
      );
    } finally {
      setPurchaseBusy(false);
    }
  }

  return (
    <div
      ref={estimatorRef}
      className="subscription-estimator mx-auto w-full min-w-0 max-w-[1400px] overflow-x-clip"
    >
      

      {/* <ol className="estimate-steps mx-auto mt-7 grid max-w-4xl gap-3 sm:grid-cols-3" aria-label="Estimate steps" data-estimate-reveal data-reveal-side="up">
        {[
          ["01", "Add phone details", Smartphone],
          ["02", "Choose Kavach", ShieldCheck],
          ["03", "See selling price", Sparkles],
        ].map(([number, label, StepIcon]) => {
          const Icon = StepIcon as typeof Smartphone;
          return (
            <li key={number as string} className="estimate-step-card group flex items-center gap-3 rounded-2xl border border-[#0b2a55]/12 bg-white p-3.5 shadow-[0_8px_24px_rgba(11,42,85,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#f58220]/60 hover:shadow-[0_16px_34px_rgba(11,42,85,0.12)] sm:p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0b2a55] text-[#ffb45e] transition duration-300 group-hover:scale-105 group-hover:bg-[#f58220] group-hover:text-[#0b2a55]">
                <Icon className="size-5" />
              </span>
              <span><span className="block text-[10px] font-bold tracking-[.16em] text-[#e87513]">STEP {number}</span><span className="mt-0.5 block text-sm font-semibold text-[#0b2a55]">{label as string}</span></span>
            </li>
          );
        })}
      </ol> */}

      {pendingVerification && !verificationPendingOpen && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-950">
            A payment confirmation still needs verification. Do not make another payment until it is
            resolved.
          </p>
          <Button
            type="button"
            onClick={() => setVerificationPendingOpen(true)}
            className="shrink-0 rounded-full"
          >
            Retry verification
          </Button>
        </div>
      )}

      <div
        data-estimate-reveal
        data-reveal-side="up"
        className="estimate-shell mt-2 w-full min-w-0 sm:p-7"
      >
        <div className="space-y-8">
          <section
            data-estimate-reveal
            data-reveal-side="left"
            className="estimate-panel w-full min-w-0 rounded-2xl border border-[#0b2a55]/12 bg-white p-3 transition-[border-color,box-shadow,transform] duration-300 hover:border-[#f58220]/45 hover:shadow-[0_14px_40px_rgba(11,42,85,0.1)] sm:p-5"
            aria-labelledby="device-selection-title"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[linear-gradient(105deg,#0b2a55_0%,#123e72_78%,#155a7d_100%)] p-3 text-white shadow-[0_8px_22px_rgba(11,42,85,0.15)] sm:p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-[#ffb45e]">
                  <Smartphone className="size-5" />
                </span>
                <div>
                  <h3 id="device-selection-title" className="font-display text-xl sm:text-2xl">
                    Your device details
                  </h3>
                  <p className="mt-1 text-xs text-white/70">
                    Complete every required field to continue.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={clearEstimator}
                aria-label="Clear selections"
                title="Clear selections"
                className="size-9 shrink-0 rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:h-9 sm:w-auto sm:px-3"
              >
                <X className="size-4" />
                <span className="hidden text-xs sm:inline">Clear selections</span>
              </Button>
            </div>
            {isStaffUser && (
              <div className="mb-5 rounded-2xl border border-primary/15 bg-primary-soft/30 p-4 sm:p-5">
                <div className="mb-3">
                  <h4 className="text-sm font-semibold">Customer details</h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Enter the customer’s number. We’ll find their name or create a customer record
                    when you confirm the purchase.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="min-w-0">
                    <span className="mb-1.5 block text-sm font-medium">
                      Customer number <span className="text-primary">*</span>
                    </span>
                    <input
                      id="staff-customer-mobile"
                      name="customer_mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={10}
                      required
                      value={staffCustomerMobile}
                      onChange={(event) => {
                        setStaffCustomerMobile(event.target.value.replace(/\D/g, "").slice(0, 10));
                      }}
                      placeholder="10-digit mobile number"
                      className="h-12 w-full rounded-xl border border-border/80 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                  <label className="min-w-0">
                    <span className="mb-1.5 block text-sm font-medium">
                      Customer name <span className="text-primary">*</span>
                    </span>
                    <input
                      id="staff-customer-name"
                      name="customer_name"
                      type="text"
                      autoComplete="name"
                      maxLength={255}
                      required
                      value={staffCustomerName}
                      disabled={
                        staffCustomerLookupStatus === "idle" ||
                        staffCustomerLookupStatus === "loading"
                      }
                      onChange={(event) => setStaffCustomerName(event.target.value)}
                      placeholder={
                        staffCustomerLookupStatus === "loading"
                          ? "Checking customer…"
                          : "Enter customer name"
                      }
                      className="h-12 w-full rounded-xl border border-border/80 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted/60"
                    />
                  </label>
                </div>
                {staffCustomerLookupStatus !== "idle" && (
                  <div className="mt-2 flex min-h-5 items-center justify-between gap-2 text-xs">
                    <p
                      role={staffCustomerLookupStatus === "error" ? "alert" : "status"}
                      className={cn(
                        "flex items-center gap-1.5",
                        staffCustomerLookupStatus === "error"
                          ? "text-destructive"
                          : staffCustomerLookupStatus === "found"
                            ? "text-emerald-700"
                            : "text-muted-foreground",
                      )}
                    >
                      {staffCustomerLookupStatus === "loading" && (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      )}
                      {staffCustomerLookupStatus === "found" && (
                        <CircleCheck className="size-3.5" />
                      )}
                      {staffCustomerLookupMessage}
                    </p>
                    {staffCustomerLookupStatus === "error" && (
                      <button
                        type="button"
                        onClick={() => setStaffCustomerLookupAttempt((attempt) => attempt + 1)}
                        className="shrink-0 font-semibold text-primary underline underline-offset-2"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-5">
              <div>
                <SearchablePicker
                  label="Phone brand"
                  required
                  placeholder={brandsLoading ? "Loading phone brands…" : "Search or choose a brand"}
                  selectedLabel={brand?.brand_name ?? ""}
                  options={brandOptions}
                  onSelect={selectBrand}
                  loading={brandsLoading || brandOptions.length === 0}
                />
                {brandsQuery.isError && (
                  <p role="alert" className="mt-2 text-xs text-destructive">
                    {brandsQuery.error instanceof Error
                      ? brandsQuery.error.message
                      : "Phone brands could not be loaded."}
                    <button
                      type="button"
                      className="ml-2 font-semibold underline"
                      onClick={() => void brandsQuery.refetch()}
                    >
                      Retry
                    </button>
                  </p>
                )}
              </div>
              {brand && (
                <SearchablePicker
                  label="Phone model"
                  required
                  placeholder={modelsLoading ? "Loading models…" : "Search or choose a model"}
                  selectedLabel={model?.model_name ?? ""}
                  options={modelOptions}
                  onSelect={selectModel}
                  loading={modelsLoading}
                />
              )}
            </div>
            {model && (
              <fieldset className="mt-5">
                <legend className="mb-2 text-sm font-semibold">
                  Select options{" "}
                  <span className="text-primary" aria-hidden="true">
                    *
                  </span>
                  <span className="sr-only"> required</span>
                </legend>
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
                          "min-h-12 min-w-0 whitespace-normal break-words rounded-xl border px-3 py-3 text-center text-sm font-semibold leading-snug transition-colors hover:border-primary hover:bg-primary-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
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
                    No variants found for this phone model.
                  </p>
                )}
              </fieldset>
            )}
            {(dataError || (queryDataError instanceof Error && queryDataError.message)) && (
              <p role="status" className="mt-3 text-sm text-destructive">
                {dataError || (queryDataError instanceof Error ? queryDataError.message : "")}
              </p>
            )}

            {selectedProduct && (
              <div className="estimate-stage-enter mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
                <div className="min-w-0 sm:col-span-2">
                  <label
                    htmlFor="invoice-file"
                    className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold"
                  >
                    <span>
                      Invoice photo or PDF{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </span>
                  </label>
                  <div className="flex min-h-16 items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.035] p-3 sm:p-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      <Upload className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {invoiceFile?.name ?? "Add your purchase invoice"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        JPG, PNG, HEIC/HEIF, or PDF · optional
                      </p>
                    </div>
                    <label
                      htmlFor="invoice-file"
                      className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:brightness-95 focus-within:ring-2 focus-within:ring-primary/30 sm:px-4 sm:text-sm"
                    >
                      {invoiceFile ? "Change" : "Choose file"}
                    </label>
                    <input
                      id="invoice-file"
                      name="invoice_file"
                      type="file"
                      accept="image/*,image/heic,image/heif,.heic,.heif,application/pdf,.pdf"
                      onChange={(event) => {
                        void handleInvoiceFileChange(event.target.files?.[0] ?? null);
                        event.currentTarget.value = "";
                      }}
                      className="sr-only"
                    />
                  </div>
                  {invoiceScan && (
                    <p
                      className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"
                      role="status"
                      aria-live="polite"
                    >
                      {invoiceScan.progress < 100 && (
                        <LoaderCircle className="size-3.5 shrink-0 animate-spin" />
                      )}
                      <span>{invoiceScan.message}</span>
                    </p>
                  )}
                  {invoiceScanError && (
                    <p className="mt-2 text-xs text-amber-800" role="status">
                      {invoiceScanError}
                    </p>
                  )}
                  {invoiceFile && (
                    <p className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <FileImage className="size-4 shrink-0" />
                      <span className="min-w-0 truncate">Invoice selected</span>
                      <button
                        type="button"
                        onClick={() => void handleInvoiceFileChange(null)}
                        className="ml-auto shrink-0 font-semibold text-primary"
                      >
                        Remove
                      </button>
                    </p>
                  )}
                </div>
                <div className="grid min-w-0 grid-cols-2 gap-3 sm:col-span-2 sm:grid-cols-6">
                  <label className="min-w-0 sm:col-span-2">
                    <span className="mb-1.5 block text-sm font-medium">
                      Purchase date{" "}
                      <span className="text-primary" aria-hidden="true">
                        *
                      </span>
                    </span>
                    <input
                      id="purchase-date"
                      name="invoice_date"
                      type="date"
                      required
                      value={purchaseDate}
                      onChange={(event) => {
                        setPurchaseDate(event.target.value);
                      }}
                      className="h-12 w-full min-w-0 rounded-xl border border-border/80 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                  <label className="min-w-0 sm:col-span-2">
                    <span className="mb-1.5 block text-sm font-medium">
                      Final purchase amount{" "}
                      <span className="text-primary" aria-hidden="true">
                        *
                      </span>
                    </span>
                    <span className="flex h-12 items-center gap-2 rounded-xl border border-border/80 bg-white px-3 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted/60 text-sm font-semibold text-muted-foreground">
                        ₹
                      </span>
                      <input
                        id="final-purchase-amount"
                        name="purchase_price"
                        required
                        aria-label="Final purchase amount"
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={finalAmount}
                        onChange={(event) => {
                          setFinalAmount(event.target.value.replace(/[^\d.]/g, ""));
                        }}
                        placeholder="Enter purchase amount"
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                      />
                    </span>
                  </label>
                  <label className="col-span-2 min-w-0 sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium">
                    Invoice number{" "}
                    <span className="text-primary" aria-hidden="true">
                      *
                    </span>
                  </span>
                  <input
                    id="invoice-number"
                    name="invoice_number"
                    value={invoiceNumber}
                    required
                    onChange={(event) => setInvoiceNumber(event.target.value)}
                    placeholder="Enter invoice number"
                    className="h-12 w-full min-w-0 rounded-xl border border-border/80 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>
                  <label className="min-w-0 sm:col-span-3">
                  <span className="mb-1.5 block text-sm font-medium">
                    IMEI number <span className="text-primary">*</span>
                  </span>
                  <input
                    id="imei-number"
                    name="imei_number"
                    value={imeiNumber}
                    required
                    onChange={(event) => setImeiNumber(event.target.value)}
                    placeholder="IMEI 1 | IMEI 2 (if both are listed)"
                    className="h-12 w-full min-w-0 rounded-xl border border-border/80 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>
                  <label className="min-w-0 sm:col-span-3">
                  <span className="mb-1.5 block text-sm font-medium">
                    Serial number{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </span>
                  <input
                    id="serial-number"
                    name="serial_number"
                    value={serialNumber}
                    onChange={(event) => setSerialNumber(event.target.value)}
                    placeholder="Enter serial number"
                    className="h-12 w-full min-w-0 rounded-xl border border-border/80 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>
                </div>
              </div>
            )}
          </section>

          {packageSectionReady ? (
            <section
              aria-labelledby="packages-title"
              data-estimate-reveal
              data-reveal-side="right"
              data-visible="true"
              className="estimate-stage-enter estimate-panel relative z-20 w-full min-w-0 overflow-visible rounded-3xl border border-[#0b2a55]/15 bg-white p-4 shadow-[0_18px_55px_rgba(11,42,85,0.09)] transition-[border-color,box-shadow,transform] duration-300 hover:border-[#0b2a55]/30 hover:shadow-[0_24px_64px_rgba(11,42,85,0.14)] sm:p-6"
            >
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                
                  <h3 id="packages-title" className="mt-1 font-display text-2xl sm:text-3xl">
                    Compare packages
                  </h3>
                </div>
              
              </div>

              <div className="grid min-h-[60px] grid-cols-3 gap-2 sm:min-h-[72px] sm:gap-3">
                {packagesLoading ? (
                  <p className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircle className="size-4 animate-spin" /> Loading packages…
                  </p>
                ) : sortedPackages.length === 0 ? (
                  <p className="col-span-3 flex items-center justify-center text-sm text-muted-foreground">
                    No data found
                  </p>
                ) : (
                  sortedPackages.map((item) => {
                    const selected = packageId === item.package_id;
                    const itemTheme = getPackageTheme(item.package_name);
                    return (
                      <button
                        key={item.package_id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setPackageId(item.package_id);
                        }}
                        className={cn(
                          "relative z-10 flex min-h-[60px] min-w-0 items-center justify-center rounded-full border bg-transparent px-2 py-3 text-center transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none sm:min-h-[72px] sm:px-5",
                          selected
                            ? "package-active-tab z-20 border-2 text-foreground"
                            : "border-border text-foreground",
                        )}
                        style={
                          selected
                            ? {
                                borderColor: activeSurface,
                                backgroundColor: activeSurface,
                                backgroundImage: itemTheme.gradient,
                                color: activeTheme.foreground,
                                borderRadius: "9999px",
                                boxShadow: `0 7px 14px color-mix(in srgb, ${activeSurface} 72%, transparent)`,
                              }
                            : {
                                borderColor: "#E7E5E4",
                                backgroundColor: "#FAFAF8",
                                color: "#0B2A55",
                                borderRadius: "9999px",
                              }
                        }
                      >
                        <span className="min-w-0">
                          <span className="block break-words font-display text-xs font-semibold sm:text-base">
                            {item.package_name}
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              <div
                className="mt-4 rounded-2xl border border-white/20 p-4 shadow-[0_16px_36px_rgba(11,42,85,0.16)] transition-[background,box-shadow] duration-500 motion-reduce:transition-none sm:p-5"
                style={{
                  backgroundColor: activeSurface,
                  backgroundImage: activeTheme.gradient,
                  color: activeTheme.foreground,
                  borderRadius: "16px",
                  borderColor: "rgba(255,255,255,.24)",
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
                  min={minimumDuration}
                  max="24"
                  step="1"
                  disabled={!deviceEligible}
                  value={Math.max(duration, minimumDuration)}
                  onChange={(event) => setDuration(Number(event.target.value))}
                  aria-label={`Choose duration from ${minimumDuration} to 24 months`}
                  className="mt-5 block h-8 w-full min-w-0 cursor-pointer touch-pan-x accent-[var(--brand-saffron)]"
                  style={{ accentColor: activeTheme.accent }}
                />
                <DurationScale
                  months={getDurationMilestones(minimumDuration)}
                  selectedMonth={duration}
                  accentColor={activeTheme.accent}
                  textColor={activeTheme.foreground}
                  className="mt-1"
                />
                {purchaseDate && !deviceEligible ? (
                  <p role="alert" className="mt-2 text-xs font-semibold text-red-700">
                    Sorry, Kavach is available only for devices up to 24 months old.
                  </p>
                ) : purchaseDate && minimumDuration > 1 ? (
                  <p className="mt-2 text-[11px] leading-relaxed opacity-75">
                    Based on your purchase date, the earliest available duration is month{" "}
                    {minimumDuration}.
                  </p>
                ) : null}
                <div className="mt-4 grid min-w-0 grid-cols-2 gap-4 text-sm sm:gap-8">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-current/80 sm:text-sm">
                      Assured buyback amount
                    </p>
                    <p className="mt-1 break-words text-xl font-bold leading-tight tabular-nums sm:text-2xl">
                      {durationEligible ? formatPrice(activeQuote?.buyback_amount) : "—"}
                    </p>
                    {/* <p className="mt-1 text-xs opacity-75">For month {duration}</p> */}
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="text-xs font-medium text-current/80 sm:text-sm">Package price</p>
                    <p className="mt-1 break-words text-xl font-bold leading-tight tabular-nums sm:text-2xl">
                      {durationEligible ? formatPrice(activeQuote?.package_price) : "—"}
                    </p>
                    {/* <p className="mt-1 text-xs opacity-75">{duration} month plan</p> */}
                  </div>
                </div>

                <div className="mt-4 grid min-w-0 grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6">
                  <p className="flex min-w-0 items-center gap-2 break-words text-sm font-medium leading-relaxed text-current sm:text-base">
                    {model && <Smartphone className="size-4 shrink-0" />}
                    <span className="min-w-0">
                      {brand?.brand_name} · {model?.model_name} · {selectedProduct?.product_variant}
                    </span>
                  </p>
                  {canGenerate ? (
                    <Button
                      type="button"
                      onClick={() => {
                        setPurchaseError("");
                        setConfirmPurchaseOpen(true);
                      }}
                      className={cn(
                        packageCtaClassName,
                        "w-full whitespace-normal py-2.5 text-center text-xs leading-tight sm:w-auto sm:text-sm",
                      )}
                      style={getPackageCtaStyle(activeTheme)}
                    >
                      Proceed to checkout <ArrowRight className="size-4" />
                    </Button>
                  ) : (
                    <div
                      className="group relative w-full sm:w-auto"
                      tabIndex={0}
                      aria-label={`Checkout unavailable. ${checkoutDisabledReasons.join(", ") || "The month-wise estimate is not ready yet"}.`}
                    >
                      <Button
                        disabled
                        aria-label={`Proceed to checkout. Disabled because: ${checkoutDisabledReasons.join(", ") || "the month-wise estimate is not ready yet"}.`}
                        className={cn(
                          packageCtaClassName,
                          "w-full whitespace-normal py-2.5 text-center text-xs leading-tight opacity-80 sm:w-auto sm:text-sm",
                        )}
                        style={getPackageCtaStyle(activeTheme)}
                      >
                        Proceed to checkout <ArrowRight className="size-4" />
                      </Button>
                      <span
                        role="status"
                        className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-max max-w-[min(22rem,calc(100vw-3rem))] translate-y-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-left text-xs font-semibold leading-relaxed text-red-900 opacity-0 shadow-lg transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100"
                      >
                        Complete to continue: {checkoutDisabledReasons.length
                          ? checkoutDisabledReasons.join(", ")
                          : "the month-wise estimate is not ready yet"}
                        .
                      </span>
                    </div>
                  )}
                </div>
                {estimateError && (
                  <p
                    role="alert"
                    className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs leading-relaxed text-red-800"
                  >
                    Estimate unavailable: {estimateError} Check the purchase date and final amount,
                    then edit them above if needed.
                  </p>
                )}
              </div>
            </section>
          ) : (
            <section
              className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground sm:p-5"
              aria-live="polite"
            >
              <p className="font-semibold text-foreground">
                {deviceSelectionComplete
                  ? "Add your purchase details to continue"
                  : "Choose your phone to continue"}
              </p>
              <p className="mt-1">
                {deviceSelectionComplete
                  ? "Enter your purchase date and final purchase amount to see Kavach packages."
                  : "Select a brand, model and storage above, then enter the purchase date and amount to view Kavach packages."}
              </p>
            </section>
          )}
        </div>
      </div>
      {confirmPurchaseOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/55 p-3 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !purchaseBusy)
              setConfirmPurchaseOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-kavach-title"
            className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-background p-4 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
               
                <h2 id="confirm-kavach-title" className="mt-1 font-display text-2xl">
                  One More Step, We're Here for You!
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close confirmation"
                disabled={purchaseBusy}
                onClick={() => setConfirmPurchaseOpen(false)}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-border"
              >
                <X className="size-4" />
              </button>
            </div>
            {/* <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Please review your device and protection plan before confirming your Kavach purchase.
            </p> */}
            <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]">
              <div
                className={`grid grid-cols-1 gap-2 ${isStaffUser ? "min-[420px]:grid-cols-2" : ""}`}
              >
                {isStaffUser && (
                  <section className="min-w-0 rounded-2xl border border-border bg-card p-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Customer
                    </h3>
                    <p className="mt-1 break-words font-semibold [overflow-wrap:anywhere]">
                      {staffCustomerName}
                    </p>
                    <p className="mt-0.5 break-all text-sm text-muted-foreground">
                      {staffCustomerMobile}
                    </p>
                  </section>
                )}

                <section className="min-w-0 rounded-2xl border border-border bg-card p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Your device
                  </h3>
                  <p className="mt-1 break-words font-semibold leading-relaxed [overflow-wrap:anywhere]">
                    {brand?.brand_name} {model?.model_name}
                  </p>
                  <p className="mt-0.5 break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">
                    {selectedProduct?.product_variant}
                  </p>
                </section>
              </div>

              <section className="rounded-2xl border border-border bg-card p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Purchase device details
                </h3>
                <div className="mt-2 divide-y divide-border/70">
                  <div className="flex items-start justify-between gap-4 py-2 first:pt-0">
                    <p className="shrink-0 text-sm text-muted-foreground">Invoice date</p>
                    <p className="min-w-0 break-words text-right text-sm font-semibold">
                      {new Date(purchaseDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-2">
                    <p className="shrink-0 text-sm text-muted-foreground">Invoice amount</p>
                    <p className="min-w-0 break-words text-right text-sm font-semibold">
                      {formatPrice(amount)}
                    </p>
                  </div>
                  {invoiceNumber && (
                    <div className="flex items-start justify-between gap-4 py-2">
                      <p className="shrink-0 text-sm text-muted-foreground">Invoice number</p>
                      <p className="min-w-0 break-all text-right text-sm font-semibold">
                        {invoiceNumber}
                      </p>
                    </div>
                  )}
                  {imeiNumber && (
                    <div className="flex items-start justify-between gap-4 py-2">
                      <p className="shrink-0 text-sm text-muted-foreground">IMEI number</p>
                      <p className="min-w-0 break-all text-right text-sm font-semibold">
                        {imeiNumber}
                      </p>
                    </div>
                  )}
                  {serialNumber && (
                    <div className="flex items-start justify-between gap-4 py-2 last:pb-0">
                      <p className="shrink-0 text-sm text-muted-foreground">Serial number</p>
                      <p className="min-w-0 break-all text-right text-sm font-semibold">
                        {serialNumber}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section
                className="overflow-hidden rounded-2xl p-4 shadow-lg sm:p-5"
                style={{ background: activeTheme.gradient, color: activeTheme.foreground }}
              >
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(180px,auto)] sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/25 bg-white/15">
                      <ShieldCheck className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[11px] font-bold uppercase tracking-[.16em] opacity-80">
                        Your Kavach plan
                      </h3>
                      <p className="mt-1 break-words font-display text-xl font-bold leading-tight [overflow-wrap:anywhere]">
                        {activeQuote?.package_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/25 bg-white/15 px-4 py-3 sm:min-w-[190px] sm:justify-end sm:gap-5">
                    <div className="sm:text-right">
                      <p className="text-xs font-medium opacity-80">Plan price</p>
                      <p className="mt-0.5 break-words font-display text-2xl font-extrabold leading-tight tabular-nums">
                        {formatPrice(activeQuote?.package_price)}
                      </p>
                    </div>
                    <ArrowRight className="size-5 shrink-0 opacity-80" aria-hidden="true" />
                  </div>
                </div>
              </section>
              {purchaseError && (
                <div
                  role="alert"
                  className={`mt-4 flex gap-3 rounded-2xl border p-4 text-sm ${
                    purchaseError.includes("sign in")
                      ? "border-amber-200 bg-amber-50 text-amber-950"
                      : "border-rose-200 bg-rose-50 text-rose-950"
                  }`}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/80">
                    <CircleAlert className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {purchaseError.includes("sign in")
                        ? "Sign in to continue"
                        : purchaseError === "razorpay-order-id-missing"
                          ? "Payment setup needs attention"
                          : "We couldn’t start checkout"}
                    </p>
                    {purchaseError === "razorpay-order-id-missing" ? (
                      <>
                        <p className="mt-1 leading-relaxed">
                          Your Kavach order
                          {purchaseResult?.kavach_order_id
                            ? ` #${purchaseResult.kavach_order_id}`
                            : ""}{" "}
                          was created, but Razorpay Checkout needs its own order ID. Your Kavach
                          order ID and Razorpay order ID are different.
                        </p>
                        <p className="mt-2 leading-relaxed">
                          The server must create the Razorpay order using the secret key and include{" "}
                          <code className="rounded bg-white/80 px-1.5 py-0.5 font-semibold">
                            razorpay_order_id
                          </code>{" "}
                          in this API response. Keep the secret key on the server; it should never
                          be placed in this website.
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 leading-relaxed">{purchaseError}</p>
                    )}
                    {purchaseError.includes("sign in") && (
                      <Link
                        to="/profile"
                        onClick={rememberAuthReturnPath}
                        className="mt-2 inline-flex font-semibold underline"
                      >
                        Go to profile login
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-background pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={purchaseBusy}
                onClick={() => setConfirmPurchaseOpen(false)}
                className="rounded-full"
              >
                Review again
              </Button>
              <Button
                type="button"
                disabled={purchaseBusy || purchaseCreatedWithoutGatewayOrder}
                onClick={() => void submitKavachPurchase()}
                className="rounded-full"
              >
                {purchaseBusy ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" /> Processing…
                  </>
                ) : purchaseCreatedWithoutGatewayOrder ? (
                  <>
                    Payment setup required <CircleAlert className="size-4" />
                  </>
                ) : (
                  <>
                    Confirm purchase <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </section>
        </div>
      )}
      {purchaseSuccessOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-success-title"
            className="w-full max-w-md rounded-3xl bg-background p-6 text-center shadow-2xl sm:p-8"
          >
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              <CircleCheck className="size-9" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[.15em] text-emerald-700">
              Purchase successful
            </p>
            <h2 id="purchase-success-title" className="mt-1 font-display text-3xl">
              Your Kavach plan is confirmed
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your selected device and {activeQuote?.package_name} plan were submitted successfully.
            </p>
            {/* {purchaseResult?.kavach_order_id && (
              <p className="mt-4 rounded-xl bg-muted p-3 text-sm">
                Order ID <b>{purchaseResult.kavach_order_id}</b>
              </p>
            )} */}
            <Button asChild className="mt-6 w-full rounded-full">
              <Link to="/orders">
                Go to My Orders <ArrowRight className="size-4" />
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => setPurchaseSuccessOpen(false)}
              className="mt-3 text-xs font-medium text-muted-foreground"
            >
              Stay on this page
            </button>
          </section>
        </div>
      )}
      {purchaseFailureOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-failure-title"
            className="w-full max-w-md rounded-3xl bg-background p-6 text-center shadow-2xl sm:p-8"
          >
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-rose-50 text-rose-700">
              <X className="size-8" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[.15em] text-rose-700">
              Payment not completed
            </p>
            <h2 id="purchase-failure-title" className="mt-1 font-display text-3xl">
              Please try again
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {purchaseFailureMessage}
            </p>
            {/* {purchaseResult?.kavach_order_id && (
              <p className="mt-4 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                Kavach order reference: <b>{purchaseResult.kavach_order_id}</b>
              </p>
            )} */}
            <Button
              type="button"
              onClick={() => setPurchaseFailureOpen(false)}
              className="mt-6 w-full rounded-full"
            >
              Return to subscription
            </Button>
          </section>
        </div>
      )}
      {verificationPendingOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-pending-title"
            className="w-full max-w-md rounded-3xl bg-background p-6 text-center shadow-2xl sm:p-8"
          >
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-amber-50 text-amber-700">
              <LoaderCircle className="size-8" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[.15em] text-amber-700">
              Payment received
            </p>
            <h2 id="verification-pending-title" className="mt-1 font-display text-3xl">
              Confirmation is pending
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We received Razorpay’s payment response, but could not confirm it with the server yet.
              Do not make another payment. Retry verification below.
            </p>
            {verificationMessage && (
              <p
                role="status"
                className="mt-3 rounded-xl bg-muted p-3 text-xs text-muted-foreground"
              >
                {verificationMessage}
              </p>
            )}
            {purchaseResult?.kavach_order_id && (
              <p className="mt-3 text-xs text-muted-foreground">
                Kavach order reference: <b>{purchaseResult.kavach_order_id}</b>
              </p>
            )}
            <Button
              type="button"
              disabled={purchaseBusy || !pendingVerification}
              onClick={() => void retryKavachVerification()}
              className="mt-6 w-full rounded-full"
            >
              {purchaseBusy ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" /> Verifying…
                </>
              ) : (
                <>
                  Retry verification <ArrowRight className="size-4" />
                </>
              )}
            </Button>
            <button
              type="button"
              onClick={() => setVerificationPendingOpen(false)}
              className="mt-3 text-xs font-medium text-muted-foreground"
            >
              Close and return later
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function SearchablePicker({
  label,
  required = false,
  placeholder,
  selectedLabel,
  options,
  onSelect,
  loading = false,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  selectedLabel: string;
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
  loading?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const normalizedOptions = useMemo(
    () => options.map((option) => ({ ...option, searchLabel: option.label.toLocaleLowerCase() })),
    [options],
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = useMemo(
    () => normalizedOptions.filter((option) => option.searchLabel.includes(normalizedQuery)),
    [normalizedOptions, normalizedQuery],
  );
  const visibleOptions = filtered.slice(0, 80);
  const listId = `picker-${label.toLowerCase().replace(/\s+/g, "-")}`;

  useEffect(() => {
    if (open) {
      logSubscriptionDiagnostic("picker-rendered", {
        field: label,
        optionCount: options.length,
        matchCount: filtered.length,
        renderedCount: visibleOptions.length,
      });
    }
  }, [filtered.length, label, open, options.length, visibleOptions.length]);

  return (
    <div className="relative mt-5 w-full min-w-0">
      <label htmlFor={`${listId}-input`} className="mb-2 block text-sm font-semibold">
        {label}{" "}
        {required && (
          <span className="text-primary" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> required</span>}
      </label>
      <div className="flex h-12 min-w-0 items-center gap-3 rounded-xl border border-border/80 bg-white px-4 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
        {loading ? (
          <LoaderCircle className="size-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <Search className="size-4 shrink-0 text-muted-foreground" />
        )}
        <input
          id={`${listId}-input`}
          autoComplete="off"
          role="combobox"
          aria-required={required}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          disabled={loading}
          value={open ? query : selectedLabel}
          placeholder={placeholder}
          onFocus={() => {
            const openedAt = performance.now();
            logSubscriptionDiagnostic("picker-open", {
              field: label,
              optionCount: options.length,
            });
            window.requestAnimationFrame(() => {
              logSubscriptionDiagnostic("picker-next-frame", {
                field: label,
                delayMs: Math.round(performance.now() - openedAt),
              });
            });
            window.setTimeout(() => {
              logSubscriptionDiagnostic("picker-responsive-100ms", {
                field: label,
                delayMs: Math.round(performance.now() - openedAt),
              });
            }, 100);
            setQuery("");
            setOpen(true);
          }}
          onBlur={() => window.setTimeout(() => setOpen(false), 100)}
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
            visibleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selectedLabel === option.label}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => {
                  logSubscriptionDiagnostic("picker-option-selected", {
                    field: label,
                    optionValue: option.value,
                  });
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
          {filtered.length > visibleOptions.length && (
            <p className="px-3 py-2 text-center text-[11px] text-muted-foreground">
              Showing {visibleOptions.length} of {filtered.length}. Type to narrow the list.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
