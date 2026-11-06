import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  Box,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  MapPin,
  Maximize2,
  PackageCheck,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import galaxyFront from "@/assets/galaxy-a57-product.png";
import phoneBlue from "@/assets/phone-blue-gallery.jpg";
import { PageShell, rememberAuthReturnPath } from "@/components/shop/site-shell";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { WishlistToggle } from "@/components/shop/wishlist-toggle";
import { DurationScale } from "@/components/shop/duration-scale";
import { catalog, getProduct, mapApiProduct, type CatalogItem } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { setPageSocialMetadata, toAbsolutePageUrl } from "@/lib/seo";
import {
  getPackageCtaStyle,
  getPackageSurface,
  getPackageTheme,
  packageCtaClassName,
} from "@/lib/package-theme";
import { getDurationMilestones } from "@/lib/kavach-duration";
import { getProducts } from "@/services/api/product.service";
import { getPackages } from "@/services/api/package.service";
import { getCompanyDetails } from "@/services/api/company.service";
import { apiQueryKeys } from "@/services/api/query-keys";
import {
  addOrUpdateCartItem,
  listCart,
  removeCartProduct,
  type CartListResponse,
} from "@/services/api/cart.service";
import { readAuthSession } from "@/services/api/auth";
import type {
  PackageRecord,
  ProductPackageQuote,
  SubscriptionProduct,
} from "@/services/api/models";

export const Route = createFileRoute("/products/$slug")({
  beforeLoad: ({ params }) => {
    if (!getProduct(params.slug) && !/^product-\d+$/.test(params.slug)) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Product Details — Kimaat Lock" },
      {
        name: "description",
        content:
          "Explore product details, protection and flexible monthly EMI plans at Kimaat Lock.",
      },
      { property: "og:title", content: "Product Details — Kimaat Lock" },
      {
        property: "og:description",
        content: "Choose a device and make it yours with Kimaat Lock.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductDetail,
});

const features = [
  "Vibrant high-resolution display for work and entertainment",
  "Smooth performance for multitasking and everyday gaming",
  "Versatile camera system for crisp photos and videos",
  "All-day battery life with fast charging support",
  "Premium, durable design built for daily use",
  "Modern connectivity with 5G, Wi-Fi and Bluetooth",
];
const RELATED_PRODUCTS_PAGE_SIZE = 8;

/**
 * Buyback availability for the current product:
 * - checking  : first packages request is still running (section stays hidden, no flicker)
 * - available : API returned at least one package  -> show Kavach section
 * - none      : API returned blank packages        -> hide Kavach section
 * - error     : request failed                     -> show section so the error message is visible
 */
type BuybackAvailability = "checking" | "available" | "none" | "error";

function descriptionText(value: string) {
  return value
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(?:p|div|li|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .trim();
}

function sanitizeProductHtml(value: string) {
  const allowedTags = new Set([
    "p", "br", "hr", "h2", "h3", "h4", "strong", "b", "em", "i", "u",
    "ul", "ol", "li", "figure", "table", "thead", "tbody", "tr", "th", "td", "a",
  ]);
  const voidTags = new Set(["br", "hr"]);
  const safeHtml = value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|svg|math|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|iframe|object|embed|svg|math|template)\b[^>]*\/?>/gi, "");

  return safeHtml.replace(/<\/?([a-z][\w-]*)\b([^>]*)>/gi, (tag, rawName: string, attributes: string) => {
    const name = rawName.toLowerCase();
    if (!allowedTags.has(name)) return "";
    const closing = /^<\//.test(tag);
    if (closing) return voidTags.has(name) ? "" : `</${name}>`;
    if (name !== "a") return `<${name}>`;

    const hrefMatch = attributes.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = (hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "")
      .replace(/&amp;/gi, "&")
      .trim();
    const isSafeHref = /^(https?:|mailto:|\/|#)/i.test(href) && !/^\/\//.test(href);
    if (!href || !isSafeHref) return "<a>";
    const escapedHref = href.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    return `<a href="${escapedHref}" target="_blank" rel="noopener noreferrer">`;
  });
}

function ProductDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = readAuthSession();
  const cartKey = apiQueryKeys.cart(session?.accountId ?? "");
  const cartQuery = useQuery({
    queryKey: cartKey,
    queryFn: () => listCart({ user_id: session!.accountId }),
    enabled: Boolean(session?.accountId),
    staleTime: 30_000,
  });
  const companyQuery = useQuery({
    queryKey: apiQueryKeys.companyDetails,
    queryFn: getCompanyDetails,
  });
  const siteName = companyQuery.data?.result?.[0]?.company_name?.trim()
    || import.meta.env["VITE_PROJECT_NAME"]
    || "Kimaat Lock";
  const staticProduct = getProduct(slug);
  const [apiProduct, setApiProduct] = useState<CatalogItem | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<CatalogItem[]>([]);
  const [relatedHasMore, setRelatedHasMore] = useState(false);
  const [relatedLoadingMore, setRelatedLoadingMore] = useState(false);
  const relatedSentinelRef = useRef<HTMLDivElement>(null);
  const relatedProductsRef = useRef<CatalogItem[]>([]);
  const relatedOffsetRef = useRef(0);
  const relatedLoadingRef = useRef(false);
  const [productLoading, setProductLoading] = useState(true);
  const product = apiProduct ?? staticProduct ?? catalog[0]!;
  const [color, setColor] = useState("Iceblue");
  const [ram, setRam] = useState("8GB");
  const [storage, setStorage] = useState(product.storage[0] ?? "Standard");
  const [tab, setTab] = useState("Description");
  const [activeImage, setActiveImage] = useState(0);
  const [buybackMonth, setBuybackMonth] = useState(1);
  // DEFAULT: "No, continue without it"
  const [assuredBuyback, setAssuredBuyback] = useState<"yes" | "no">("yes");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [packageQuotes, setPackageQuotes] = useState<ProductPackageQuote[]>([]);
  const [buybackAvailability, setBuybackAvailability] =
    useState<BuybackAvailability>("checking");
  const packagesQuery = useQuery({ queryKey: apiQueryKeys.packages, queryFn: getPackages });
  const packageDetails = useMemo(() => packagesQuery.data ?? [], [packagesQuery.data]);
  const [buybackLoading, setBuybackLoading] = useState(false);
  const [buybackError, setBuybackError] = useState("");
  const [currentProductId, setCurrentProductId] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerZoomed, setViewerZoomed] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [termsOpen, setTermsOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [cartAdding, setCartAdding] = useState(false);
  const [cartRemoving, setCartRemoving] = useState(false);
  const [cartError, setCartError] = useState("");
  const productCartRows = (cartQuery.data?.result ?? []).filter(
    (row) => String(row.cart_product_id || row.product_id) === String(currentProductId || product.productId),
  );
  const productInCart = Boolean((currentProductId || product.productId) && productCartRows.length);
  const [showShortDescriptionInDetails, setShowShortDescriptionInDetails] = useState(false);
  const packagePickerRef = useRef<HTMLDivElement>(null);
  const packageButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [packageHighlight, setPackageHighlight] = useState({ leftPercent: 0, rightPercent: 0 });
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setShowShortDescriptionInDetails(false);
  }, [slug, product.productId]);
  const isPhone = product.productId ? true : product.category === "Mobile";
  const variantParts = (product.variant ?? "")
    .split(/\s*[|·]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  const variantRam = variantParts.find((part) => /^\d+(?:\s*GB)?$/i.test(part));
  const variantStorage = variantParts.find((part) => /^\d+(?:\.\d+)?\s*(?:GB|TB)$/i.test(part));
  const productSpecifications = [
    ...(product.brand ? [{ label: "Brand", value: product.brand }] : []),
    ...(product.modelName || product.name
      ? [{ label: "Model", value: product.modelName || product.name }]
      : []),
    ...(product.category ? [{ label: "Category", value: product.category }] : []),
    ...(variantRam
      ? [{ label: "RAM", value: /gb/i.test(variantRam) ? variantRam : `${variantRam} GB` }]
      : []),
    ...(variantStorage ? [{ label: "Storage", value: variantStorage }] : []),
    ...(product.variant ? [{ label: "Variant", value: product.variant }] : []),
  ];
  const supportsBuyback = String(product.productType ?? "") !== "3";
  // Kavach section is visible only when the API actually returned packages (or failed, so the error shows).
  const showBuybackSection =
    supportsBuyback && (buybackAvailability === "available" || buybackAvailability === "error");
  // Buyback data (package + duration) goes to the cart only when the section is really usable.
  const buybackSelectedForCart =
    supportsBuyback && assuredBuyback === "yes" && buybackAvailability === "available";
  const gallery = useMemo(() => {
    if (product.productId) {
      return (product.galleryImages ?? [])
        .filter((image) => {
          const path = image.trim().split(/[?#]/, 1)[0]?.toLowerCase() ?? "";
          return (
            !failedImageUrls.has(image) &&
            (/^data:image\//i.test(image.trim()) ||
              /\.(?:avif|bmp|gif|jpe?g|png|svg|webp|heic|heif)$/.test(path))
          );
        })
        .map((image, index) => ({
          image,
          position: product.imagePosition ?? "center",
          label:
            ["Front view", "Rear view", "Side detail", "Product view"][index] ?? "Product view",
        }));
    }
    if (product.galleryImages?.length)
      return product.galleryImages
        .filter((image) => !failedImageUrls.has(image))
        .map((image, index) => ({
          image,
          position: product.imagePosition ?? "center",
          label:
            ["Front view", "Rear view", "Side detail", "Product view"][index] ?? "Product view",
        }));
    const main = product.slug === "galaxy-a57-5g" ? phoneBlue : product.image;
    const alternates =
      product.slug === "galaxy-a57-5g"
        ? [galaxyFront, product.image, phoneBlue]
        : [product.image, product.image, product.image, product.image];
    return alternates
      .filter((image) => !failedImageUrls.has(image))
      .map((image, index) => ({
        image,
        position:
          product.slug === "galaxy-a57-5g"
            ? "center"
            : ([product.imagePosition ?? "center", "14% 20%", "76% 20%", "78% 82%"][index] ??
              "center"),
        label: ["Front view", "Rear view", "Side detail", "Design detail"][index] ?? "Product view",
      }));
  }, [failedImageUrls, product]);
  const viewerGallery = gallery.length
    ? gallery
    : failedImageUrls.has(product.image)
      ? []
      : [
          {
            image: product.image,
            position: product.imagePosition ?? "center",
            label: "Product view",
          },
        ];
  const currentImage = viewerGallery[activeImage] ?? viewerGallery[0] ?? null;
  function hideFailedImage(imageUrl: string) {
    setFailedImageUrls((current) => {
      if (current.has(imageUrl)) return current;
      const next = new Set(current);
      next.add(imageUrl);
      return next;
    });
    setActiveImage(0);
  }
  useEffect(() => {
    if (viewerOpen && viewerGallery.length === 0) setViewerOpen(false);
  }, [viewerGallery.length, viewerOpen]);
  useEffect(() => {
    if (!viewerOpen || viewerGallery.length === 0) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setViewerOpen(false);
      if (event.key === "ArrowRight") setActiveImage((index) => (index + 1) % viewerGallery.length);
      if (event.key === "ArrowLeft")
        setActiveImage((index) => (index - 1 + viewerGallery.length) % viewerGallery.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewerGallery.length, viewerOpen]);
  const listedPrice = Number(product.price.replace(/\D/g, "")) || 0;
  const selectedQuote = packageQuotes.find((item) => item.package_id === selectedPackageId);
  const packageOrder = (name: string) => {
    const order = ["silver", "gold", "platinum"];
    const index = order.indexOf(name.trim().toLowerCase());
    return index < 0 ? order.length : index;
  };
  const availablePackages: PackageRecord[] = useMemo(
    () =>
      packageDetails.length
        ? [...packageDetails].sort(
            (a, b) => packageOrder(a.package_name) - packageOrder(b.package_name),
          )
        : packageQuotes
            .map((quote) => ({
              package_id: quote.package_id,
              package_name: quote.package_name,
              package_percentage: quote.package_percentage,
            }))
            .sort((a, b) => packageOrder(a.package_name) - packageOrder(b.package_name)),
    [packageDetails, packageQuotes],
  );
  const selectedPackage = availablePackages.find((item) => item.package_id === selectedPackageId);
  const activePackageTheme = getPackageTheme(selectedPackage?.package_name ?? "");
  const activePlanName = selectedPackage?.package_name.toLowerCase() ?? "";
  const activeSurface = getPackageSurface(activePlanName, activePackageTheme.surface);
  const formatRupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;
  const recommendations = relatedProducts;

  useEffect(() => {
    if (productLoading) return;
    const variantSuffix = product.variant && !product.name.toLowerCase().includes(product.variant.toLowerCase())
      ? ` · ${product.variant}`
      : "";
    const title = `${product.name}${variantSuffix} | ${siteName}`;
    const shortDescription = descriptionText(product.shortDescription ?? "").replace(/\s+/g, " ");
    const productSummary = shortDescription ||
      `Explore ${product.brand} ${product.name} at ${siteName}. See product details and available Kavach options.`;
    const description = `${productSummary}${product.price ? ` Price: ${product.price}.` : ""}`.slice(0, 220);
    const canonical = new URL(window.location.href);
    canonical.search = "";
    canonical.hash = "";
    const image = toAbsolutePageUrl(product.image || import.meta.env["VITE_LOGO_URL"] || "/favicon.svg");

    setPageSocialMetadata({
      title,
      description,
      image,
      url: canonical.href,
      siteName,
      type: "product",
    });

    const price = Number(product.price.replace(/[^\d.]/g, ""));
    let structuredData = document.getElementById("kimaat-product-jsonld");
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.id = "kimaat-product-jsonld";
      structuredData.setAttribute("type", "application/ld+json");
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: title,
      description,
      image: [image],
      ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
      ...(Number.isFinite(price) && price > 0
        ? { offers: { "@type": "Offer", price: String(price), priceCurrency: "INR", url: canonical.href } }
        : {}),
    }).replace(/</g, "\\u003c");

    return () => structuredData?.remove();
  }, [product, productLoading, siteName]);

  async function shareProductLink() {
    const url = window.location.href;
    const shareTitle = `${product.name}${product.variant ? ` · ${product.variant}` : ""} | ${siteName}`;
    const shortDescription = descriptionText(product.shortDescription ?? "").replace(/\s+/g, " ");
    const shareText = [
      shortDescription || `Explore ${product.name} by ${product.brand} at Kimaat Lock.`,
      product.price ? `Price: ${product.price}.` : "",
    ].filter(Boolean).join(" ").slice(0, 260);
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareMessage("Product link copied");
        window.setTimeout(() => setShareMessage(""), 2500);
      } else {
        window.prompt("Copy this product link", url);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setShareMessage("Could not share the product link");
      window.setTimeout(() => setShareMessage(""), 2500);
    }
  }

  async function addProductToCart() {
    if (!session) {
      setCartError("Please sign in before adding this product to your cart.");
      return;
    }
    if (!currentProductId) {
      setCartError("This product is still loading. Please try again in a moment.");
      return;
    }
    setCartAdding(true);
    setCartError("");
    try {
      await addOrUpdateCartItem({
        user_id: session.accountId,
        product_id: currentProductId,
        package_id: buybackSelectedForCart ? selectedPackageId || "0" : "0",
        duration: buybackSelectedForCart ? String(buybackMonth) : "0",
        qty: 1,
      });
      await cartQuery.refetch();
    } catch (reason) {
      setCartError(
        reason instanceof Error ? reason.message : "Could not add this product to your cart.",
      );
    } finally {
      setCartAdding(false);
    }
  }

  async function removeProductFromCart() {
    if (!session || !productCartRows.length || cartRemoving) return;
    setCartRemoving(true);
    setCartError("");
    try {
      await Promise.all(
        productCartRows.map((row) => removeCartProduct(row.cart_id, session.accountId)),
      );
      queryClient.setQueryData<CartListResponse>(cartKey, (current) => ({
        status: "1",
        error: "",
        ...current,
        result: (current?.result ?? []).filter(
          (row) => String(row.cart_product_id || row.product_id) !== String(currentProductId || product.productId),
        ),
      }));
      void queryClient.invalidateQueries({ queryKey: cartKey });
    } catch (reason) {
      setCartError(reason instanceof Error ? reason.message : "Could not remove this product from your cart.");
    } finally {
      setCartRemoving(false);
    }
  }

  useEffect(() => {
    if (!product.brandId) {
      setRelatedProducts([]);
      setRelatedHasMore(false);
      relatedLoadingRef.current = false;
      setRelatedLoadingMore(false);
      return;
    }
    let active = true;
    setRelatedProducts([]);
    relatedProductsRef.current = [];
    relatedOffsetRef.current = 0;
    relatedLoadingRef.current = true;
    setRelatedLoadingMore(true);
    void getProducts({
      brand_id: product.brandId,
      limit: String(RELATED_PRODUCTS_PAGE_SIZE),
      offset: "0",
    })
      .then((records) => {
        if (active) {
          const mapped = records
            .filter((record) => record.product_id !== product.productId)
            .map(mapApiProduct);
          relatedProductsRef.current = mapped;
          setRelatedProducts(mapped);
          relatedOffsetRef.current = records.length;
          setRelatedHasMore(records.length === RELATED_PRODUCTS_PAGE_SIZE);
        }
      })
      .catch(() => {
        if (active) {
          relatedProductsRef.current = [];
          setRelatedProducts([]);
          setRelatedHasMore(false);
        }
      })
      .finally(() => {
        if (active) {
          relatedLoadingRef.current = false;
          setRelatedLoadingMore(false);
        }
      });
    return () => {
      active = false;
      relatedLoadingRef.current = false;
    };
  }, [product.brandId, product.productId]);

  useEffect(() => {
    const target = relatedSentinelRef.current;
    if (!target || !relatedHasMore) return;
    let active = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || relatedLoadingRef.current) return;
        relatedLoadingRef.current = true;
        setRelatedLoadingMore(true);
        const offset = relatedOffsetRef.current;
        void getProducts({
          brand_id: product.brandId,
          limit: String(RELATED_PRODUCTS_PAGE_SIZE),
          offset: String(offset),
        })
          .then((records) => {
            if (!active) return;
            const existingIds = new Set(relatedProductsRef.current.map((item) => item.productId));
            const nextProducts = records
              .filter((record) => record.product_id !== product.productId)
              .map(mapApiProduct)
              .filter((item) => !existingIds.has(item.productId));
            const combined = [...relatedProductsRef.current, ...nextProducts];
            relatedProductsRef.current = combined;
            setRelatedProducts(combined);
            relatedOffsetRef.current = offset + records.length;
            setRelatedHasMore(records.length === RELATED_PRODUCTS_PAGE_SIZE);
          })
          .catch(() => {
            if (active) setRelatedHasMore(false);
          })
          .finally(() => {
            if (active) {
              relatedLoadingRef.current = false;
              setRelatedLoadingMore(false);
            }
          });
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(target);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [product.brandId, product.productId, relatedHasMore]);

  useEffect(() => {
    const picker = packagePickerRef.current;
    if (!picker) return;
    const updateHighlight = () => {
      const index = availablePackages.findIndex((item) => item.package_id === selectedPackageId);
      const button = packageButtonRefs.current[index];
      if (!button || picker.clientWidth <= 0) return;
      const left = button.offsetLeft;
      const width = button.offsetWidth;
      setPackageHighlight({
        leftPercent: (left / picker.clientWidth) * 100,
        rightPercent: ((left + width) / picker.clientWidth) * 100,
      });
    };
    updateHighlight();
    const observer = new ResizeObserver(updateHighlight);
    observer.observe(picker);
    return () => observer.disconnect();
  }, [availablePackages, selectedPackageId]);

  useEffect(() => {
    let active = true;
    setProductLoading(true);
    setApiProduct(null);
    setCurrentProductId("");
    // New product -> re-check whether it has buyback packages.
    setBuybackAvailability("checking");
    setPackageQuotes([]);
    setBuybackError("");
    const loadProduct = async () => {
      try {
        const productIdFromUrl = slug.match(/^product-(\d+)$/)?.[1];
        const records = await getProducts(productIdFromUrl ? { product_id: productIdFromUrl } : {});
        const record = productIdFromUrl
          ? records[0]
          : records.find(
              (item) =>
                item.brand_name?.toLowerCase() === staticProduct?.brand.toLowerCase() &&
                item.model_name?.toLowerCase().replace(/\s/g, "") ===
                  staticProduct?.name.toLowerCase().replace(/\s/g, ""),
            );
        if (active && record) {
          const mapped = mapApiProduct(record);
          setApiProduct(mapped);
          setCurrentProductId(record.product_id);
        }
      } catch {
        // Keep the existing catalog details visible when the API has no matching item.
      } finally {
        if (active) setProductLoading(false);
      }
    };
    void loadProduct();
    return () => {
      active = false;
    };
  }, [slug, staticProduct]);

  useEffect(() => {
    // NOTE: no longer gated on assuredBuyback — packages load so the question
    // card stays visible and users can opt-in at any time.
    if (!supportsBuyback || !currentProductId) {
      setPackageQuotes([]);
      if (!supportsBuyback) {
        setSelectedPackageId("");
        setBuybackLoading(false);
      }
      return;
    }
    let active = true;
    setBuybackLoading(true);
    setBuybackError("");
    const now = new Date();
    const invoiceDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    // package_id is intentionally empty: we load ALL packages once, so a blank list
    // really means "this product has no buyback packages" (not "selected package missing").
    void getProducts({
      product_id: currentProductId,
      brand_id: product.brandId ?? "",
      model_id: product.modelId ?? "",
      invoice_date: invoiceDate,
      purchase_price: product.retailerPrice || String(listedPrice),
      duration: String(buybackMonth),
      package_id: "",
    })
      .then((records) => {
        const quotes = records.flatMap((record: SubscriptionProduct) => record.packages ?? []);
        if (!active) return;
        setPackageQuotes(quotes);
        // Decide visibility from the first successful response only,
        // so moving the duration slider never hides the section.
        setBuybackAvailability((current) =>
          current === "checking" || current === "error"
            ? quotes.length > 0
              ? "available"
              : "none"
            : current,
        );
        if (quotes.length > 0) {
          setSelectedPackageId((current) => {
            if (current && quotes.some((quote) => quote.package_id === current)) return current;
            const gold = quotes.find((quote) => quote.package_name.toLowerCase() === "gold");
            return (gold ?? quotes[0])!.package_id;
          });
        }
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setBuybackError(
          reason instanceof Error ? reason.message : "Buyback options could not be loaded.",
        );
        setBuybackAvailability((current) => (current === "available" ? current : "error"));
      })
      .finally(() => {
        if (active) setBuybackLoading(false);
      });
    return () => {
      active = false;
    };
  }, [
    currentProductId,
    product.brandId,
    product.modelId,
    product.retailerPrice,
    product.productType,
    supportsBuyback,
    listedPrice,
    buybackMonth,
  ]);

  useEffect(() => {
    setStorage(product.variant ?? product.storage[0] ?? "Standard");
    setActiveImage(0);
  }, [product.slug]);

  useEffect(() => {
    if (assuredBuyback !== "yes" || selectedPackageId || !packageDetails.length) return;
    const preferredPackage =
      packageDetails.find((item) => item.package_name.toLowerCase() === "gold") ??
      packageDetails[0];
    if (preferredPackage) setSelectedPackageId(preferredPackage.package_id);
  }, [assuredBuyback, packageDetails, selectedPackageId]);

  useEffect(() => {
    const session = readAuthSession();
    const savedPincode = session?.account["customer_pincode"] ?? "";
    if (savedPincode) setPincode(savedPincode);
  }, []);

  if (productLoading) {
    return (
      <PageShell compactHeader>
        <main
          className="mx-auto max-w-[1400px] animate-pulse px-4 py-6 md:px-8"
          aria-label="Loading product details"
        >
          <div className="mb-5 h-4 w-48 rounded bg-muted" />
          <div className="grid gap-8 lg:h-[calc(100vh-9rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,.9fr)] lg:gap-12">
            <div className="min-h-[300px] rounded-card bg-muted sm:min-h-[420px]" />
            <div className="space-y-5 py-2">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-10 w-4/5 rounded bg-muted" />
              <div className="h-8 w-2/5 rounded bg-muted" />
              <div className="h-28 rounded-2xl bg-muted" />
              <div className="h-36 rounded-2xl bg-muted" />
            </div>
          </div>
        </main>
      </PageShell>
    );
  }

  if (!apiProduct) {
    return (
      <PageShell compactHeader>
        <main className="mx-auto flex min-h-[55vh] max-w-[900px] flex-col items-center justify-center px-4 py-16 text-center">
          <PackageCheck className="size-10 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl">No data found</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Product details are not available right now.
          </p>
          <Button asChild variant="outline" className="mt-5 rounded-full">
            <Link to="/products">Back to products</Link>
          </Button>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell compactHeader>
      {/* ============ Responsive max-height for mobilecssmainimage ============ */}
      <style>{`
        @media (max-width: 1024px) {
          .mobilecssmainimage {
            max-height: 300px !important;
          }
        }
      `}</style>

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
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,.9fr)] lg:items-start lg:gap-12">
          <section className="min-w-0">
            <div
              className={cn(
                "grid min-w-0 gap-3 lg:h-[min(68vh,500px)] lg:min-h-[340px] lg:gap-4",
                gallery.length ? "lg:grid-cols-[72px_minmax(0,1fr)]" : "lg:grid-cols-1",
              )}
            >
              {gallery.length > 0 && (
                <div
                  className="order-2 flex w-full snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:order-1 lg:h-full lg:min-h-0 lg:w-[72px] lg:snap-y lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:overscroll-y-contain lg:pb-1 lg:pr-1"
                  aria-label="Product images"
                >
                  {gallery.map((image, index) => (
                    <button
                      key={`${image.label}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      onMouseEnter={() => setActiveImage(index)}
                      onFocus={() => setActiveImage(index)}
                      aria-label={`Show ${image.label}`}
                      aria-pressed={activeImage === index}
                      className={cn(
                        "size-[58px] shrink-0 snap-start overflow-hidden rounded-xl border-2 bg-muted p-1 transition hover:-translate-y-0.5 sm:size-[72px]",
                        activeImage === index ? "border-primary shadow-sm" : "border-transparent",
                      )}
                    >
                      <img
                        src={image.image}
                        alt=""
                        onError={() => hideFailedImage(image.image)}
                        className="size-full rounded-lg object-contain"
                        style={{ objectPosition: image.position }}
                      />
                    </button>
                  ))}
                </div>
              )}
              <div className="order-1 relative min-w-0 lg:order-2 lg:h-full lg:min-h-0">
                <div className="group relative grid h-[300px] min-h-[300px] place-items-center overflow-hidden rounded-card bg-muted p-4 sm:h-[380px] sm:min-h-[380px] md:p-8 lg:h-full ">
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentImage) return;
                      setViewerZoomed(false);
                      setViewerOpen(true);
                    }}
                    className="absolute inset-0 z-0 grid size-full place-items-center cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    aria-label={`View ${product.name} images full screen`}
                  >
                    {currentImage && (
                      <img
                        src={currentImage.image}
                        alt={`${product.brand} ${product.name} — ${currentImage.label}`}
                        onError={() => hideFailedImage(currentImage.image)}
                        className="size-full object-contain transition duration-500 mobilecssmainimage"
                        style={{ objectPosition: currentImage.position, maxHeight: "500px", maxWidth: "100%" }}
                      />
                    )}
                  </button>
                  <div className="absolute right-3 top-3 flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Share product"
                      onClick={() => void shareProductLink()}
                    >
                      <Share2 className="size-4" />
                    </Button>
                    <WishlistToggle
                      productId={product.productId ?? currentProductId}
                      wishlistId={product.wishlistId}
                    />
                  </div>
                  <span className="pointer-events-none absolute left-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-background/85 text-foreground shadow-sm">
                    <Maximize2 className="size-4" />
                  </span>
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/85 px-3 py-1 text-[11px] text-muted-foreground opacity-0 transition group-hover:opacity-100">
                    Click to view images
                  </span>
                  {shareMessage && (
                    <span
                      role="status"
                      className="absolute bottom-3 right-3 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-card"
                    >
                      {shareMessage}
                    </span>
                  )}
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
            <h1 className="mt-2 break-words font-display text-3xl leading-tight [overflow-wrap:anywhere] md:text-4xl">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {product.rating > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                  <Star className="size-3 fill-current" />
                  {product.rating} <span className="font-normal">· Top rated</span>
                </span>
              )}
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

            {isPhone && (
              <>
                <div className="mt-5">
                  <p className="text-sm">Select options</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.variants && product.variants.length > 0
                      ? product.variants.map((variant) => {
                          const selected =
                            String(currentProductId || product.productId) ===
                            String(variant.product_id);
                          return (
                            <Button
                              key={variant.product_id}
                              type="button"
                              aria-pressed={selected}
                              variant={selected ? "default" : "outline"}
                              className={cn(
                                "h-auto min-h-11 max-w-full whitespace-normal break-words px-[35px] py-3 text-center leading-tight sm:h-11 sm:px-5 sm:py-0",
                                selected && "bg-logo text-white hover:bg-logo",
                              )}
                              onClick={() => {
                                if (!selected) {
                                  void navigate({
                                    to: "/products/$slug",
                                    params: { slug: `product-${variant.product_id}` },
                                  });
                                }
                              }}
                            >
                              {variant.product_variant}
                            </Button>
                          );
                        })
                      : product.storage.map((value) => (
                          <Button
                            key={value}
                            variant={storage === value ? "default" : "outline"}
                            className={cn(
                              "h-auto min-h-11 max-w-full whitespace-normal break-words px-[35px] py-3 text-center leading-tight sm:h-11 sm:px-5 sm:py-0",
                              storage === value && "bg-logo hover:bg-logo",
                            )}
                            onClick={() => setStorage(value)}
                          >
                            {value}
                          </Button>
                        ))}
                  </div>
                </div>
              </>
            )}
            <div className="flex flex-wrap items-center justify-between py-5">
              <div></div>
              {productInCart ? (
                <div className="flex min-h-12 w-full items-center gap-2 sm:w-56">
                  <span className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-success-soft px-2 py-2 text-xs font-semibold text-success sm:text-sm">
                    <Check className="size-4 shrink-0" />
                    <span className="truncate">Added to cart</span>
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0 rounded-xl px-2.5 sm:px-3"
                    disabled={cartRemoving || cartAdding}
                    onClick={() => void removeProductFromCart()}
                    aria-label={`Remove ${product.name} from cart`}
                  >
                    {cartRemoving ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => void addProductToCart()}
                  disabled={cartAdding || cartRemoving || productLoading || !currentProductId}
                  className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary-hover sm:w-56"
                >
                  {cartAdding ? <LoaderCircle className="size-4 animate-spin" /> : <ShoppingCart className="size-4" />}
                  {cartAdding ? "Adding…" : "Add To Cart"}
                </Button>
              )}
            </div>
            {cartError && (
              <p
                role="alert"
                className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
              >
                {cartError}{" "}
                {cartError.toLowerCase().includes("sign in") && (
                  <Link to="/profile" onClick={rememberAuthReturnPath} className="font-semibold underline">
                    Sign in
                  </Link>
                )}
              </p>
            )}
            {product.shortDescription && (
              <div
                className={cn(
                  "rounded-xl border border-border/70 bg-card px-4 py-3",
                  isPhone && "mt-4",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">Short description</h3>
                  {product.shortDescription.length > 160 && (
                    <a
                      href="#product-description"
                      onClick={() => setShowShortDescriptionInDetails(true)}
                      className="shrink-0 text-xs font-semibold text-primary hover:underline"
                    >
                      More details
                    </a>
                  )}
                </div>
                <p className="mt-2 line-clamp-3 break-words whitespace-pre-line text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
                  {descriptionText(product.shortDescription)}
                </p>
              </div>
            )}

            
          </section>

          {viewerOpen && currentImage && viewerGallery.length > 0 && (
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
                    · {activeImage + 1} / {viewerGallery.length}
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
                    setActiveImage(
                      (index) => (index - 1 + viewerGallery.length) % viewerGallery.length,
                    )
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
                    onError={() => hideFailedImage(currentImage.image)}
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
                  onClick={() => setActiveImage((index) => (index + 1) % viewerGallery.length)}
                  className="absolute right-2 z-10 grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 sm:right-5 sm:size-12"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-6" />
                </button>
              </div>
              <div className="flex justify-center gap-2 overflow-x-auto px-3 pb-4 sm:pb-6">
                {viewerGallery.map((image, index) => (
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
                    <img
                      src={image.image}
                      alt=""
                      onError={() => hideFailedImage(image.image)}
                      className="size-full rounded object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Kavach · Assured Buyback — hidden when the API returns blank packages */}
        {showBuybackSection && (
          <section aria-labelledby="buyback-title" className="mt-7 space-y-4">
            <article className="overflow-hidden rounded-3xl border border-[#0b2a55]/15 bg-white shadow-[0_14px_40px_rgba(11,42,85,0.08)]">
              <div className="relative overflow-hidden bg-[linear-gradient(115deg,#0b2a55_0%,#123e72_72%,#17648a_100%)] px-4 py-5 text-white sm:px-6 sm:py-6">
                <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(ellipse_at_right,rgba(245,130,32,.24),transparent_68%)]" />
                <div className="relative flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/10 text-[#ffb45e] shadow-inner">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#ffbd73] sm:text-xs">
                      Kavach · Assured Buyback
                    </p>
                    <h2 id="buyback-title" className="mt-1 font-display text-xl sm:text-2xl">
                      Would you like Assured Buyback for this phone?
                    </h2>
                    <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-white/75 sm:text-sm">
                      Choose to see package options and your month-wise selling price.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-5">
                {(["yes", "no"] as const).map((answer) => (
                  <button
                    key={answer}
                    type="button"
                    aria-pressed={assuredBuyback === answer}
                    onClick={() => {
                      setAssuredBuyback(answer);
                      if (answer === "no") setSelectedPackageId("");
                    }}
                    className={cn(
                      "relative flex min-h-[92px] items-start gap-3 rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f58220]/40",
                      assuredBuyback === answer
                        ? "border-[#f58220] bg-[#fff7ed] shadow-[0_8px_22px_rgba(245,130,32,0.13)]"
                        : "border-[#0b2a55]/12 bg-[#f8fafc] hover:border-[#0b2a55]/30 hover:bg-white",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
                        assuredBuyback === answer
                          ? "bg-[#f58220] text-white"
                          : "bg-[#0b2a55]/[0.06] text-[#0b2a55]/65",
                      )}
                    >
                      {answer === "yes" ? (
                        <ShieldCheck className="size-4" />
                      ) : (
                        <X className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-[#0b2a55]">
                        {answer === "yes"
                          ? "Yes, show my selling price"
                          : "No, continue without it"}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        {answer === "yes"
                          ? "Compare Kavach packages and month-wise buyback values."
                          : "Shop for this phone without a Kavach estimate."}
                      </span>
                    </span>
                    {assuredBuyback === answer && (
                      <CheckCircle2 className="absolute right-3 top-3 size-4 text-[#f58220]" />
                    )}
                  </button>
                ))}
              </div>
              {assuredBuyback === "yes" && (
                <section className="mt-5 w-full min-w-0 p-4 ">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[.15em] text-primary">
                        Compare Packages
                      </p>
                      <h3 className="mt-1 font-display text-2xl sm:text-3xl">
                        Pick your protection
                      </h3>
                    </div>
                    {buybackLoading && (
                      <span className="text-xs text-muted-foreground">Updating estimates…</span>
                    )}
                  </div>
                  {buybackError && (
                    <p
                      role="status"
                      className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900"
                    >
                      {buybackError}
                    </p>
                  )}
                  <div
                    ref={packagePickerRef}
                    className="relative mt-5 grid min-h-[60px] grid-cols-3 gap-2 sm:min-h-[72px] sm:gap-3"
                  >
                    {availablePackages.map((plan, index) => {
                      const selected = selectedPackageId === plan.package_id;
                      const theme = getPackageTheme(plan.package_name);
                      return (
                        <button
                          key={plan.package_id}
                          ref={(element) => {
                            packageButtonRefs.current[index] = element;
                          }}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setSelectedPackageId(plan.package_id)}
                          className={cn(
                            "relative z-10 flex min-h-[60px] items-center justify-center rounded-full border bg-transparent px-4 py-3 text-center transition-colors duration-300 motion-reduce:transition-none sm:min-h-[72px] sm:px-5",
                            selected
                              ? "package-active-tab z-20 border-2 text-foreground"
                              : "border-border text-foreground",
                          )}
                          style={
                            selected
                              ? {
                                  borderColor: activeSurface,
                                  backgroundColor: activeSurface,
                                  backgroundImage: theme.gradient,
                                  color: activePackageTheme.foreground,
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
                            <span className="block font-display text-sm font-semibold sm:text-base">
                              {plan.package_name}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                    {!availablePackages.length && !buybackLoading && (
                      <p className="col-span-full rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                        Package choices are unavailable right now.
                      </p>
                    )}
                  </div>
                  {selectedPackage && (
                    <div
                      className="relative z-[1] mt-4 rounded-2xl border border-white/20 p-4 shadow-[0_16px_36px_rgba(11,42,85,0.16)] transition-[background,box-shadow] duration-500 motion-reduce:transition-none sm:p-5"
                      style={{
                        backgroundColor: activeSurface,
                        backgroundImage: activePackageTheme.gradient,
                        color: activePackageTheme.foreground,
                        borderRadius: "16px",
                        borderColor: "rgba(255,255,255,.24)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p
                          className="text-xs font-semibold uppercase tracking-[.14em] sm:text-sm"
                          style={{ color: activePackageTheme.accent }}
                        >
                          Choose your duration
                        </p>
                        <span className="shrink-0 whitespace-nowrap text-xs font-semibold tabular-nums text-current sm:text-base">
                          {buybackMonth} {buybackMonth === 1 ? "month" : "months"}
                        </span>
                      </div>
                      <input
                        id="detail-buyback-duration"
                        type="range"
                        min="1"
                        max="24"
                        step="1"
                        value={buybackMonth}
                        onChange={(event) => setBuybackMonth(Number(event.target.value))}
                        aria-label="Choose duration from 1 to 24 months"
                        className="mt-5 block h-8 w-full min-w-0 cursor-pointer touch-pan-x accent-[var(--brand-saffron)]"
                        style={{ accentColor: activePackageTheme.accent }}
                      />
                      <DurationScale
                        months={getDurationMilestones(1)}
                        selectedMonth={buybackMonth}
                        accentColor={activePackageTheme.accent}
                        textColor={activePackageTheme.foreground}
                      />
                      <div className="mt-4 grid min-w-0 grid-cols-2 gap-4 text-sm sm:gap-8">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-current/80 sm:text-sm">
                            Assured buyback amount
                          </p>
                          <p
                            className="mt-1 break-words text-xl font-bold leading-tight tabular-nums sm:text-2xl"
                            style={{ color: activePackageTheme.accent }}
                          >
                            {selectedQuote
                              ? formatRupees(Number(selectedQuote.buyback_amount))
                              : "—"}
                          </p>
                        </div>
                        <div className="min-w-0 text-right">
                          <p className="text-xs font-medium text-current/80 sm:text-sm">
                            Package price
                          </p>
                          <p className="mt-1 break-words text-xl font-bold leading-tight tabular-nums sm:text-2xl">
                            {selectedQuote
                              ? formatRupees(Number(selectedQuote.package_price))
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 grid min-w-0 grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6">
                        <p className="min-w-0 break-words text-sm font-medium leading-relaxed text-current sm:text-base">
                          {product.brand} · {product.name} · {storage}
                        </p>
                        {!productInCart && (
                          <Button
                            type="button"
                            onClick={() => void addProductToCart()}
                            disabled={
                              cartAdding || cartRemoving || productLoading || !currentProductId || !selectedQuote
                            }
                            className={cn(packageCtaClassName, "w-full sm:w-auto")}
                            style={getPackageCtaStyle(activePackageTheme)}
                          >
                            <ShoppingCart className="size-4" />
                            {cartAdding ? "Adding…" : "Add this device + Kavach to cart"}
                          </Button>
                        )}
                      </div>
                      {cartError && (
                        <p role="alert" className="mt-3 text-sm text-red-800">
                          {cartError}
                        </p>
                      )}
                    </div>
                  )}
                </section>
              )}
            </article>
          </section>
        )}

        <section id="product-description" className="scroll-mt-24 border-border pt-3">
          <h2 className="mt-2 font-display text-3xl">All Details</h2>
          <div className="max-w-4xl py-5 text-sm leading-relaxed">
            {showShortDescriptionInDetails && product.shortDescription && (
              <div>
                <h3 className="font-semibold">Short description</h3>
                <p className="mt-2 break-words whitespace-pre-line text-muted-foreground [overflow-wrap:anywhere]">
                  {descriptionText(product.shortDescription)}
                </p>
              </div>
            )}
            {product.longDescription && (
              <div className={cn(product.shortDescription && "border-t border-border pt-5")}>
                <h3 className="font-semibold">Product description</h3>
                <div
                  className="product-rich-description mt-3 rounded-2xl border border-border bg-card p-4 text-foreground sm:p-6"
                  dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(product.longDescription) }}
                />
              </div>
            )}
            {!product.shortDescription &&
              !product.longDescription &&
              (staticProduct ? (
                <>
                  <p>
                    The {product.brand} {product.name} brings a thoughtful everyday experience with
                    a beautiful design, reliable performance and features made to keep up with your
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
                </>
              ) : (
                <p className="text-muted-foreground">No description available.</p>
              ))}
          </div>
        </section>

        {(recommendations.length > 0 || relatedHasMore || relatedLoadingMore) && (
          <section className="">
            <div className="flex items-end justify-between gap-4">
              <div>
                {/* <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
                  Keep exploring
                </p> */}
                <h2 className="mt-1 font-display text-3xl">You may also like</h2>
              </div>
              <Link to="/products" className="text-sm font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>
            {recommendations.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {recommendations.map((item) => (
                  <ProductCard key={item.slug} product={item} />
                ))}
              </div>
            )}
            {relatedHasMore && <div ref={relatedSentinelRef} className="h-8" aria-hidden="true" />}
            {relatedLoadingMore && (
              <p className="py-4 text-center text-sm text-muted-foreground">Loading more products…</p>
            )}
          </section>
        )}
      </main>
    </PageShell>
  );
}

function RefreshCwIcon() {
  return <PackageCheck className="size-5 text-primary" />;
}
