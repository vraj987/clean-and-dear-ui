import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronDown, SlidersHorizontal, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/shop/site-shell";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { brands, catalog, categories } from "@/lib/catalog";
import { getBrands } from "@/services/api/brand.service";
import { getCategories } from "@/services/api/category.service";
import { getModels } from "@/services/api/model.service";
import type { BrandRecord, CategoryRecord, ModelRecord } from "@/services/api/models";

type Search = { brand?: string; category?: string; q?: string };
export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ...(typeof search["brand"] === "string" ? { brand: search["brand"] } : {}),
    ...(typeof search["category"] === "string" ? { category: search["category"] } : {}),
    ...(typeof search["q"] === "string" ? { q: search["q"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "All Products — BytePe" },
      {
        name: "description",
        content: "Browse and filter phones, audio and electronics on easy monthly EMI.",
      },
      { property: "og:title", content: "All Products — BytePe" },
      { property: "og:description", content: "Find your next device from leading brands." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const searchBrand = search["brand"];
  const searchCategory = search["category"];
  const [drawer, setDrawer] = useState(false);
  const [brand, setBrand] = useState(searchBrand ?? "All");
  const [category, setCategory] = useState(searchCategory ?? "All");
  const [sort, setSort] = useState("Featured");
  const [topRated, setTopRated] = useState(false);
  const [apiBrands, setApiBrands] = useState<BrandRecord[]>([]);
  const [apiCategories, setApiCategories] = useState<CategoryRecord[]>([]);
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [model, setModel] = useState("All");
  const [modelsLoading, setModelsLoading] = useState(false);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(999999);
  const [activeFilter, setActiveFilter] = useState<"brand" | "category" | "model" | "price">(
    "brand",
  );
  useEffect(() => {
    void Promise.allSettled([getBrands(), getCategories()]).then(
      ([brandResult, categoryResult]) => {
        if (brandResult.status === "fulfilled") setApiBrands(brandResult.value);
        if (categoryResult.status === "fulfilled") setApiCategories(categoryResult.value);
      },
    );
  }, []);
  useEffect(() => {
    setBrand(searchBrand ?? "All");
    setCategory(searchCategory ?? "All");
  }, [searchBrand, searchCategory]);
  const selectedBrandId = apiBrands.find((item) => item.brand_name === brand)?.brand_id ?? "";
  useEffect(() => {
    setModel("All");
    setModels([]);
    if (!selectedBrandId) {
      setModelsLoading(false);
      return;
    }
    let active = true;
    setModelsLoading(true);
    void getModels(selectedBrandId)
      .then((records) => {
        if (active) setModels(records);
      })
      .catch(() => {
        if (active) setModels([]);
      })
      .finally(() => {
        if (active) setModelsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedBrandId]);
  const products = useMemo(() => {
    const q = (search.q ?? "").toLowerCase();
    const filtered = catalog.filter(
      (p) =>
        (brand === "All" || p.brand.toLowerCase() === brand.toLowerCase()) &&
        (category === "All" || p.category === category) &&
        (model === "All" || p.name.toLowerCase().includes(model.toLowerCase())) &&
        Number(p.price.replace(/\D/g, "")) >= priceMin &&
        Number(p.price.replace(/\D/g, "")) <= priceMax &&
        (!q || `${p.brand} ${p.name} ${p.category}`.toLowerCase().includes(q)) &&
        (!topRated || p.rating >= 4.8),
    );
    return [...filtered].sort((a, b) =>
      sort === "Rating"
        ? b.rating - a.rating
        : sort === "Price: Low"
          ? Number(a.price.replace(/\D/g, "")) - Number(b.price.replace(/\D/g, ""))
          : 0,
    );
  }, [brand, category, model, priceMin, priceMax, search.q, sort, topRated]);
  const formatPrice = (value: number) => `₹${new Intl.NumberFormat("en-IN").format(value)}`;
  const resetFilters = () => {
    setBrand("All");
    setCategory("All");
    setModel("All");
    setPriceMin(0);
    setPriceMax(999999);
  };
  return (
    <PageShell>
      <main className="mx-auto max-w-[1400px] px-4 py-7 md:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-primary">EMI Store</p>
            <h1 className="truncate font-display text-3xl md:text-4xl">
              {brand === "All" ? "All Products" : brand}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{products.length} products found</p>
          </div>
          <Button variant="outline" onClick={() => setDrawer(true)}>
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <label className="flex items-center gap-2 rounded-full border border-border px-4 text-sm">
            <span>Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 bg-transparent outline-none"
            >
              <option>Featured</option>
              <option>Rating</option>
              <option>Price: Low</option>
            </select>
            <ChevronDown className="size-4" />
          </label>
          <Button
            variant={topRated ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setTopRated((v) => !v)}
          >
            <Star className="size-4" />
            Top Rated
          </Button>
          {(brand !== "All" ||
            category !== "All" ||
            model !== "All" ||
            priceMin > 0 ||
            priceMax < 999999) && (
            <Button variant="ghost" className="rounded-full" onClick={resetFilters}>
              <X className="size-4" /> Clear filters
            </Button>
          )}
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        {products.length === 0 && (
          <div className="py-24 text-center">
            <PackageEmpty />
            <h2 className="mt-3 font-display text-2xl">No products match</h2>
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
                      ...(apiBrands.length ? apiBrands.map((item) => item.brand_name) : brands),
                    ].map((value) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center justify-between border-b border-border py-3 text-sm"
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="brand"
                            checked={brand === value}
                            onChange={() => {
                              setBrand(value);
                              setModel("All");
                            }}
                            className="accent-[var(--primary)]"
                          />
                          {value}
                        </span>
                        <small className="text-muted-foreground">
                          {value === "All"
                            ? catalog.length
                            : catalog.filter((p) => p.brand === value).length}
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
                      ...(apiCategories.length
                        ? apiCategories.map((item) => item.category_name)
                        : categories),
                    ].map((value) => (
                      <label
                        key={value}
                        className="mr-2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={category === value}
                          onChange={() => setCategory(value)}
                          className="accent-[var(--primary)]"
                        />
                        {value}
                      </label>
                    ))}
                  </>
                )}
                {activeFilter === "model" && (
                  <>
                    <p className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
                      Choose model
                    </p>
                    {!selectedBrandId ? (
                      <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                        Choose a brand first to load its models.
                      </p>
                    ) : modelsLoading ? (
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
                          <button
                            key={item.model_id}
                            type="button"
                            onClick={() =>
                              setModel(item.model_id === "All" ? "All" : item.model_name)
                            }
                            className={`flex w-full items-center gap-3 border-b border-border px-2 py-3 text-left text-sm transition hover:bg-muted ${model === (item.model_id === "All" ? "All" : item.model_name) ? "text-primary" : ""}`}
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
                            <span className="flex-1">{item.model_name}</span>
                            {model === (item.model_id === "All" ? "All" : item.model_name) && (
                              <Check className="size-4" />
                            )}
                          </button>
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
