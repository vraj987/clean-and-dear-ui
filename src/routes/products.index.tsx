import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, SlidersHorizontal, Star, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/shop/site-shell";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { mapApiProduct } from "@/lib/catalog";
import { getBrands } from "@/services/api/brand.service";
import { getCategories } from "@/services/api/category.service";
import { getAllModels } from "@/services/api/model.service";
import { getProducts } from "@/services/api/product.service";
import type { ModelRecord } from "@/services/api/models";
import { apiQueryKeys } from "@/services/api/query-keys";
import { readAuthSession } from "@/services/api/auth";

type Search = { brand?: string; category?: string; model_id?: string; q?: string };
const PRODUCTS_PAGE_SIZE = 12;
export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ...(typeof search["brand"] === "string" ? { brand: search["brand"] } : {}),
    ...(typeof search["category"] === "string" ? { category: search["category"] } : {}),
    ...(typeof search["model_id"] === "string" ? { model_id: search["model_id"] } : {}),
    ...(typeof search["q"] === "string" ? { q: search["q"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "All Products — Kimaat Lock" },
      {
        name: "description",
        content: "Browse and filter phones, audio and electronics on easy monthly EMI.",
      },
      { property: "og:title", content: "All Products — Kimaat Lock" },
      { property: "og:description", content: "Find your next device from leading brands." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: "/products/" });
  const accountId = readAuthSession()?.accountId ?? "";
  const search = Route.useSearch();
  const searchBrand = search["brand"];
  const searchCategory = search["category"];
  const searchModelId = search["model_id"];
  const [drawer, setDrawer] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(searchBrand && searchBrand !== "All" ? [searchBrand] : []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchCategory && searchCategory !== "All" ? [searchCategory] : []);
  const [sort, setSort] = useState("Featured");
  const [topRated, setTopRated] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>(searchModelId ? [searchModelId] : []);
  const [apiProducts, setApiProducts] = useState<ReturnType<typeof mapApiProduct>[]>([]);
  const apiProductsRef = useRef(apiProducts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(false);
  const [paginationError, setPaginationError] = useState("");
  const paginationSentinelRef = useRef<HTMLDivElement>(null);
  const pendingProductsRef = useRef<ReturnType<typeof mapApiProduct>[]>([]);
  const serverMayHaveMoreRef = useRef(false);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(999999);
  const [activeFilter, setActiveFilter] = useState<"brand" | "category" | "model" | "price">(
    "brand",
  );
  const brandsQuery = useQuery({ queryKey: apiQueryKeys.brands, queryFn: getBrands });
  const categoriesQuery = useQuery({ queryKey: apiQueryKeys.categories, queryFn: getCategories });
  const allModelsQuery = useQuery({ queryKey: apiQueryKeys.allModels, queryFn: getAllModels });
  const firstPageQuery = useQuery({
    queryKey: apiQueryKeys.products(accountId, { model_id: searchModelId ?? "", limit: String(PRODUCTS_PAGE_SIZE), offset: "0" }),
    queryFn: () => getProducts({ model_id: searchModelId ?? "", limit: String(PRODUCTS_PAGE_SIZE), offset: "0" }),
    // Product inventory is edited in the admin panel. Revalidate whenever this
    // listing is entered, while React Query keeps cached rows visible during
    // the background request.
    staleTime: 0,
    refetchOnMount: "always",
  });
  const apiBrands = brandsQuery.data ?? [];
  const apiCategories = categoriesQuery.data ?? [];
  const productsLoading = firstPageQuery.isLoading;
  const initialProductsError = firstPageQuery.error
    ? "Products could not be loaded right now."
    : "";
  const firstPageProducts = useMemo(
    () => (firstPageQuery.data ?? []).map(mapApiProduct),
    [firstPageQuery.data],
  );
  useEffect(() => {
    apiProductsRef.current = apiProducts;
  }, [apiProducts]);
  useEffect(() => {
    apiProductsRef.current = [];
    pendingProductsRef.current = [];
    serverMayHaveMoreRef.current = false;
    setApiProducts([]);
    setHasMoreProducts(false);
  }, [searchModelId]);
  useEffect(() => {
    if (!firstPageQuery.data) return;
    const mapped = firstPageProducts;
    // A new first page can reflect products added, removed, or reordered in
    // the admin panel, so discard any previously paginated rows and let the
    // scroll loader request fresh pages from the new offset.
    apiProductsRef.current = mapped.slice(0, PRODUCTS_PAGE_SIZE);
    setApiProducts(apiProductsRef.current);
    pendingProductsRef.current = mapped.slice(PRODUCTS_PAGE_SIZE);
    serverMayHaveMoreRef.current = firstPageQuery.data.length === PRODUCTS_PAGE_SIZE;
    setHasMoreProducts(pendingProductsRef.current.length > 0 || serverMayHaveMoreRef.current);
  }, [firstPageProducts, firstPageQuery.data]);
  useEffect(() => {
    const target = paginationSentinelRef.current;
    if (!target || !hasMoreProducts || productsLoading || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setLoadingMore(true);
        if (pendingProductsRef.current.length) {
          const batch = pendingProductsRef.current.splice(0, PRODUCTS_PAGE_SIZE);
          setApiProducts((current) => [...current, ...batch]);
          setHasMoreProducts(pendingProductsRef.current.length > 0 || serverMayHaveMoreRef.current);
          setLoadingMore(false);
          return;
        }
        const currentProducts = apiProductsRef.current;
        const pageQuery = { model_id: searchModelId ?? "", limit: String(PRODUCTS_PAGE_SIZE), offset: String(currentProducts.length) };
        void queryClient.fetchQuery({
          queryKey: apiQueryKeys.products(accountId, pageQuery),
          queryFn: () => getProducts(pageQuery),
          staleTime: 0,
        })
          .then((records) => {
            const next = records.map(mapApiProduct);
            const existingSlugs = new Set(currentProducts.map((item) => item.slug));
            const uniqueNext = next.filter((item) => !existingSlugs.has(item.slug));
            const batch = uniqueNext.slice(0, PRODUCTS_PAGE_SIZE);
            pendingProductsRef.current = uniqueNext.slice(PRODUCTS_PAGE_SIZE);
            serverMayHaveMoreRef.current = records.length === PRODUCTS_PAGE_SIZE && uniqueNext.length > 0;
            setApiProducts((current) => {
              const currentSlugs = new Set(current.map((item) => item.slug));
              return [...current, ...batch.filter((item) => !currentSlugs.has(item.slug))];
            });
            setHasMoreProducts(pendingProductsRef.current.length > 0 || serverMayHaveMoreRef.current);
          })
          .catch(() => {
            setPaginationError("More products could not be loaded right now.");
            setHasMoreProducts(false);
          })
          .finally(() => setLoadingMore(false));
      },
      { rootMargin: "700px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [accountId, apiProducts.length, hasMoreProducts, loadingMore, productsLoading, queryClient]);
  useEffect(() => {
    setSelectedBrands(searchBrand && searchBrand !== "All" ? [searchBrand] : []);
    setSelectedCategories(searchCategory && searchCategory !== "All" ? [searchCategory] : []);
    setSelectedModels(searchModelId ? [searchModelId] : []);
  }, [searchBrand, searchCategory, searchModelId]);
  const selectedBrandIds = apiBrands
    .filter((item) => selectedBrands.includes(item.brand_name))
    .map((item) => item.brand_id);
  const modelsLoading = allModelsQuery.isLoading;
  const models = useMemo(() => {
    const uniqueModels = new Map<string, ModelRecord>();
    (allModelsQuery.data ?? [])
      .filter((record) => !selectedBrandIds.length || selectedBrandIds.includes(record.brand_id))
      .forEach((record) => uniqueModels.set(record.model_id, record));
    return [...uniqueModels.values()];
  }, [allModelsQuery.data, selectedBrandIds.join(",")]);
  const allProducts = apiProducts.length ? apiProducts : firstPageProducts;
  const availableBrandNames = apiBrands.map((item) => item.brand_name);
  const availableCategoryNames = apiCategories.map((item) => item.category_name);
  const productsError = paginationError || initialProductsError;
  const products = useMemo(() => {
    const q = (search.q ?? "").toLowerCase();
    const filtered = allProducts.filter(
      (p) =>
        (!selectedBrands.length || selectedBrands.some((value) => p.brand.toLowerCase() === value.toLowerCase())) &&
        (!selectedCategories.length || selectedCategories.includes(p.category)) &&
        (!selectedModels.length || selectedModels.includes(p.modelId ?? "")) &&
        Number(p.price.replace(/\D/g, "")) >= priceMin &&
        Number(p.price.replace(/\D/g, "")) <= priceMax &&
        (!q || `${p.brand} ${p.name} ${p.category}`.toLowerCase().includes(q)) &&
        (!topRated || !p.rating || p.rating >= 4.8),
    );
    const priceValue = (price: string) => Number(price.replace(/\D/g, "")) || 0;
    return [...filtered].sort((a, b) => {
      if (sort === "Rating") return b.rating - a.rating;
      if (sort === "Name: A to Z") return a.name.localeCompare(b.name);
      if (sort === "Name: Z to A") return b.name.localeCompare(a.name);
      if (sort === "Price: Low to High") return priceValue(a.price) - priceValue(b.price);
      if (sort === "Price: High to Low") return priceValue(b.price) - priceValue(a.price);
      return 0;
    });
  }, [allProducts, selectedBrands, selectedCategories, selectedModels, priceMin, priceMax, search.q, sort, topRated]);
  const formatPrice = (value: number) => `₹${new Intl.NumberFormat("en-IN").format(value)}`;
  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedModels([]);
    setPriceMin(0);
    setPriceMax(999999);
    setPaginationError("");
    if (searchModelId) void navigate({ search: (previous) => ({ ...previous, model_id: undefined }) });
  };
  const toggleSelection = (values: string[], setValues: (next: string[]) => void, value: string) => {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };
  return (
    <PageShell>
      <main className="mx-auto max-w-[1400px] px-4 py-7 md:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl md:text-4xl">
              {selectedBrands.length === 1 ? selectedBrands[0] : "All Products"}
            </h1>
          </div>
          <Button variant="outline" onClick={() => setDrawer(true)}>
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>
        </div>
       
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {productsLoading && Array.from({ length: 8 }, (_, index) => <div key={`product-skeleton-${index}`} className="aspect-[.78] animate-pulse rounded-card bg-muted" />)}
          {!productsLoading && products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        {!productsLoading && products.length === 0 && !hasMoreProducts && (
          <div className="py-24 text-center">
            <PackageEmpty />
            <h2 className="mt-3 font-display text-2xl">{productsError || !allProducts.length ? "No data found" : "No products match"}</h2>
            {productsError && <p className="mt-2 text-sm text-muted-foreground">{productsError}</p>}
            <Button
              className="mt-4"
              onClick={() => {
                resetFilters();
                setTopRated(false);
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
        {hasMoreProducts && (
          <div ref={paginationSentinelRef} className="mt-6 min-h-8" aria-live="polite">
            {(loadingMore || productsError) && (
              <p className="py-3 text-center text-sm text-muted-foreground">
                {loadingMore ? "Loading more products…" : productsError}
              </p>
            )}
          </div>
        )}
      </main>
      {drawer && (
        <div className="fixed inset-0 z-[70] bg-foreground/35" onClick={() => setDrawer(false)}>
          <aside
            className="ml-auto flex h-full w-[min(92vw,520px)] flex-col bg-background shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border p-5">
              <Button size="icon" variant="ghost" onClick={() => setDrawer(false)}>
                <X />
              </Button>
              <h2 className="font-display text-2xl">Filter</h2>
              <button
                className="text-sm font-semibold text-primary"
                onClick={() => {
                  resetFilters();
                }}
              >
                Reset
              </button>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-[130px_minmax(0,1fr)]">
              <div className="border-r border-border bg-muted p-3">
                {(
                  [
                    ["brand", "Brand"],
                    ["category", "Category"],
                    ["model", "Model"],
                    ["price", "Price"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveFilter(key)}
                    className={`mb-1 w-full rounded-md px-3 py-3 text-left text-sm transition ${activeFilter === key ? "bg-background font-semibold text-primary shadow-sm" : "hover:bg-background/70"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="overflow-y-auto p-5">
                {activeFilter === "brand" && (
                  <>
                    <p className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
                      Choose brand
                    </p>
                    {[
                      "All",
                      ...availableBrandNames,
                    ].map((value) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center justify-between border-b border-border py-3 text-sm"
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={value === "All" ? selectedBrands.length === 0 : selectedBrands.includes(value)}
                            onChange={() => {
                              if (value === "All") {
                                setSelectedBrands([]);
                                setSelectedModels([]);
                              } else {
                                toggleSelection(selectedBrands, setSelectedBrands, value);
                                setSelectedModels([]);
                              }
                            }}
                            className="accent-[var(--primary)]"
                          />
                          {value}
                        </span>
                        <small className="text-muted-foreground">
              {value === "All"
                            ? allProducts.length
                            : allProducts.filter((p) => p.brand === value).length}
                        </small>
                      </label>
                    ))}
                  </>
                )}
                {activeFilter === "category" && (
                  <>
                    <p className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
                      Choose category
                    </p>
                    {[
                      "All",
                      ...availableCategoryNames,
                      ].map((value) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center justify-between border-b border-border py-3 text-sm"
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={value === "All" ? selectedCategories.length === 0 : selectedCategories.includes(value)}
                            onChange={() => value === "All"
                              ? setSelectedCategories([])
                              : toggleSelection(selectedCategories, setSelectedCategories, value)}
                            className="accent-[var(--primary)]"
                          />
                          {value}
                        </span>
                        <small className="text-muted-foreground">
                          {value === "All" ? allProducts.length : allProducts.filter((p) => p.category === value).length}
                        </small>
                      </label>
                    ))}
                  </>
                )}
                {activeFilter === "model" && (
                  <>
                    <p className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
                      Choose model
                    </p>
                    {modelsLoading ? (
                      <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                        Loading models…
                      </p>
                    ) : (
                      <>
                        {[
                          {
                            model_id: "All",
                            model_name: "All models",
                            model_image: "",
                            model_image_url: "",
                          },
                          ...models,
                        ].map((item) => (
                          <label
                            key={item.model_id}
                            className="flex w-full cursor-pointer items-center gap-3 border-b border-border px-2 py-3 text-left text-sm transition hover:bg-muted"
                          >
                            {item.model_image_url ? (
                              <img
                                src={item.model_image_url}
                                alt=""
                                className="size-10 rounded-md bg-white object-contain"
                              />
                            ) : (
                              <span className="size-10 rounded-md bg-muted" />
                            )}
                            <input
                              type="checkbox"
                              checked={item.model_id === "All" ? selectedModels.length === 0 : selectedModels.includes(item.model_id)}
                              onChange={() => item.model_id === "All"
                                ? setSelectedModels([])
                                : toggleSelection(selectedModels, setSelectedModels, item.model_id)}
                              className="accent-[var(--primary)]"
                            />
                            <span className="flex-1">{item.model_name}</span>
                            <small className="text-muted-foreground">
                              {item.model_id === "All" ? allProducts.length : allProducts.filter((p) => p.modelId === item.model_id).length}
                            </small>
                          </label>
                        ))}
                      </>
                    )}
                  </>
                )}
                {activeFilter === "price" && (
                  <section aria-label="Price range filter" className="space-y-7">
                    <div className="flex items-end justify-between gap-4">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Set your price range
                      </p>
                      <span className="text-xs text-muted-foreground">INR</span>
                    </div>
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <span className="block text-xs text-muted-foreground">Min price</span>
                        <span className="mt-1 block truncate font-semibold text-primary">
                          {formatPrice(priceMin)}
                        </span>
                      </div>
                      <div className="min-w-0 text-right">
                        <span className="block text-xs text-muted-foreground">Max price</span>
                        <span className="mt-1 block truncate font-semibold text-primary">
                          {formatPrice(priceMax)}
                        </span>
                      </div>
                    </div>
                    <div
                      className="relative h-8 touch-none"
                      aria-label="Choose minimum and maximum price"
                    >
                      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted" />
                      <div
                        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
                        style={{
                          left: `${(priceMin / 999999) * 100}%`,
                          width: `${((priceMax - priceMin) / 999999) * 100}%`,
                        }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={999999}
                        step={1}
                        value={priceMin}
                        onChange={(event) =>
                          setPriceMin(Math.min(Number(event.target.value), priceMax))
                        }
                        className="pointer-events-none absolute inset-0 h-8 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-md [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                        aria-label="Minimum price"
                      />
                      <input
                        type="range"
                        min={0}
                        max={999999}
                        step={1}
                        value={priceMax}
                        onChange={(event) =>
                          setPriceMax(Math.max(Number(event.target.value), priceMin))
                        }
                        className="pointer-events-none absolute inset-0 h-8 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-md [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                        aria-label="Maximum price"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₹0</span>
                      <span>₹9,99,999</span>
                    </div>
                    <p className="rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                      Move the sliders to narrow the products to your budget.
                    </p>
                  </section>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-border p-4">
              <Button variant="outline" onClick={() => setDrawer(false)}>
                Cancel
              </Button>
              <Button onClick={() => setDrawer(false)}>
                <Check className="size-4" />
                Apply ({products.length})
              </Button>
            </div>
          </aside>
        </div>
      )}
    </PageShell>
  );
}

function PackageEmpty() {
  return <SlidersHorizontal className="mx-auto size-10 text-muted-foreground" />;
}
