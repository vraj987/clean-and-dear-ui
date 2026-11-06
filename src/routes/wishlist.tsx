import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronDown, ChevronRight, Heart, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { mapApiProduct, type CatalogItem } from "@/lib/catalog";
import { readAuthSession, type AuthSession } from "@/services/api/auth";
import { getMyWishlist } from "@/services/api/wishlist.service";

type FilterKey = "brand" | "category" | "model" | "price";
type SortKey = "Featured" | "Name: A to Z" | "Name: Z to A" | "Price: Low to High" | "Price: High to Low";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Kimaat Lock" },
      { name: "description", content: "View and manage your saved Kimaat Lock products." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("brand");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(999999);
  const [sort, setSort] = useState<SortKey>("Featured");

  const refreshWishlist = useCallback(async (accountId?: string) => {
    if (!accountId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setItems((await getMyWishlist(accountId)).map(mapApiProduct));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Wishlist could not be loaded.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = readAuthSession();
    setSession(saved);
    setReady(true);
    void refreshWishlist(saved?.accountId);
  }, [refreshWishlist]);

  const brands = [...new Set(items.map((item) => item.brand).filter(Boolean))].sort();
  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))].sort();
  const models = [...new Set(items.map((item) => item.modelName || item.name).filter(Boolean))].sort();
  const products = useMemo(() => {
    const price = (item: CatalogItem) => Number(item.price.replace(/\D/g, "")) || 0;
    const filtered = items.filter((item) =>
      (!selectedBrands.length || selectedBrands.includes(item.brand)) &&
      (!selectedCategories.length || selectedCategories.includes(item.category)) &&
      (!selectedModels.length || selectedModels.includes(item.modelName || item.name)) &&
      price(item) >= priceMin && price(item) <= priceMax,
    );
    return filtered.sort((a, b) => {
      if (sort === "Name: A to Z") return a.name.localeCompare(b.name);
      if (sort === "Name: Z to A") return b.name.localeCompare(a.name);
      if (sort === "Price: Low to High") return price(a) - price(b);
      if (sort === "Price: High to Low") return price(b) - price(a);
      return 0;
    });
  }, [items, selectedBrands, selectedCategories, selectedModels, priceMin, priceMax, sort]);

  function toggle(values: string[], setValues: (next: string[]) => void, value: string) {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  function clearFilters() {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedModels([]);
    setPriceMin(0);
    setPriceMax(999999);
    setSort("Featured");
  }

  function formatPrice(value: number) {
    return `₹${new Intl.NumberFormat("en-IN").format(value)}`;
  }

  if (!ready) {
    return (
      <PageShell>
        <main className="mx-auto grid min-h-[60vh] max-w-[1100px] place-items-center px-4 py-10">
          <p role="status" className="text-sm text-muted-foreground">Loading your wishlist…</p>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="mx-auto min-h-[60vh] max-w-[1400px] px-4 py-7 md:px-8">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="size-3" />
          <Link to="/profile" className="hover:text-primary">My Profile</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">Wishlist</span>
        </nav>

        {!session ? (
          <section className="mx-auto max-w-lg rounded-2xl border border-border bg-card px-6 py-12 text-center">
            <Heart className="mx-auto size-10 text-primary" />
            <h1 className="mt-4 font-display text-3xl">Sign in to view your wishlist</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your saved products will be here after you sign in.</p>
            <Button asChild className="mt-5 rounded-full"><Link to="/profile">Sign in</Link></Button>
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Your Kimaat Lock account</p>
                <h1 className="mt-1 font-display text-4xl">Wishlist</h1>
                <p className="mt-2 text-sm text-muted-foreground">{products.length} saved {products.length === 1 ? "product" : "products"}</p>
              </div>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setDrawer(true)}>
                <SlidersHorizontal className="size-4" /> Filters
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 rounded-full border border-border px-4 text-sm">
                <span>Sort</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="h-10 bg-transparent outline-none">
                  <option>Featured</option>
                  <option>Name: A to Z</option>
                  <option>Name: Z to A</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
                <ChevronDown className="size-4" />
              </label>
              {(selectedBrands.length > 0 || selectedCategories.length > 0 || selectedModels.length > 0 || priceMin > 0 || priceMax < 999999 || sort !== "Featured") && (
                <Button type="button" variant="ghost" className="rounded-full" onClick={clearFilters}><X className="size-4" /> Clear filters</Button>
              )}
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => void refreshWishlist(session?.accountId)} disabled={loading}>Refresh</Button>
            </div>

            {loading ? (
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[.78] animate-pulse rounded-card bg-muted" />)}
              </div>
            ) : error ? (
              <div className="py-20 text-center"><p role="status" className="text-sm text-muted-foreground">{error}</p><Button className="mt-4 rounded-full" onClick={() => void refreshWishlist(session?.accountId)}>Try again</Button></div>
            ) : products.length ? (
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {products.map((product) => <ProductCard
                  key={product.productId ?? product.slug}
                  product={product}
                  onWishlistChange={() => setItems((current) => current.filter((item) => item.productId !== product.productId))}
                />)}
              </div>
            ) : (
              <div className="py-24 text-center">
                <Heart className="mx-auto size-10 text-muted-foreground" />
                <h2 className="mt-3 font-display text-2xl">{items.length ? "No products match these filters" : "Your wishlist is empty"}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{items.length ? "Change your filters to see saved products." : "Save products using the heart button and they’ll appear here."}</p>
                <Button asChild variant="outline" className="mt-5 rounded-full"><Link to="/products">Browse products</Link></Button>
              </div>
            )}
          </>
        )}
      </main>

      {drawer && session && (
        <div className="fixed inset-0 z-[70] bg-foreground/35" onClick={() => setDrawer(false)}>
          <aside className="ml-auto flex h-full w-[min(92vw,520px)] flex-col bg-background shadow-card" onClick={(event) => event.stopPropagation()}>
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border p-5">
              <Button size="icon" variant="ghost" onClick={() => setDrawer(false)} aria-label="Close filters"><X /></Button>
              <h2 className="font-display text-2xl">Filter wishlist</h2>
              <button type="button" className="text-sm font-semibold text-primary" onClick={clearFilters}>Reset</button>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-[130px_minmax(0,1fr)]">
              <div className="border-r border-border bg-muted p-3">
                {([ ["brand", "Brand"], ["category", "Category"], ["model", "Model"], ["price", "Price"] ] as const).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setActiveFilter(key)} className={`mb-1 w-full rounded-md px-3 py-3 text-left text-sm ${activeFilter === key ? "bg-background font-semibold text-primary shadow-sm" : "hover:bg-background/70"}`}>{label}</button>
                ))}
              </div>
              <div className="overflow-y-auto p-5">
                {activeFilter !== "price" && (() => {
                  const options = activeFilter === "brand" ? brands : activeFilter === "category" ? categories : models;
                  const selected = activeFilter === "brand" ? selectedBrands : activeFilter === "category" ? selectedCategories : selectedModels;
                  const setSelected = activeFilter === "brand" ? setSelectedBrands : activeFilter === "category" ? setSelectedCategories : setSelectedModels;
                  return <>
                    <p className="mb-4 text-xs font-semibold uppercase text-muted-foreground">Choose {activeFilter}</p>
                    <label className="flex cursor-pointer items-center gap-3 border-b border-border py-3 text-sm">
                      <input type="checkbox" checked={selected.length === 0} onChange={() => setSelected([])} className="accent-[var(--primary)]" /> All {activeFilter === "model" ? "models" : activeFilter === "brand" ? "brands" : "categories"}
                    </label>
                    {options.map((value) => <label key={value} className="flex cursor-pointer items-center gap-3 border-b border-border py-3 text-sm">
                      <input type="checkbox" checked={selected.includes(value)} onChange={() => toggle(selected, setSelected, value)} className="accent-[var(--primary)]" />
                      <span className="flex-1">{value}</span><small className="text-muted-foreground">{items.filter((item) => activeFilter === "brand" ? item.brand === value : activeFilter === "category" ? item.category === value : (item.modelName || item.name) === value).length}</small>
                    </label>)}
                  </>;
                })()}
                {activeFilter === "price" && <section aria-label="Price range filter" className="space-y-7">
                  <div className="flex items-end justify-between gap-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Set your price range</p><span className="text-xs text-muted-foreground">INR</span></div>
                  <div className="flex items-start justify-between gap-5">
                    <div><span className="block text-xs text-muted-foreground">Min price</span><span className="mt-1 block font-semibold text-primary">{formatPrice(priceMin)}</span></div>
                    <div className="text-right"><span className="block text-xs text-muted-foreground">Max price</span><span className="mt-1 block font-semibold text-primary">{formatPrice(priceMax)}</span></div>
                  </div>
                  <div className="relative h-8 touch-none">
                    <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted" />
                    <div className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary" style={{ left: `${(priceMin / 999999) * 100}%`, width: `${((priceMax - priceMin) / 999999) * 100}%` }} />
                    <input type="range" min={0} max={999999} value={priceMin} onChange={(event) => setPriceMin(Math.min(Number(event.target.value), priceMax))} aria-label="Minimum price" className="pointer-events-none absolute inset-0 h-8 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-primary [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary" />
                    <input type="range" min={0} max={999999} value={priceMax} onChange={(event) => setPriceMax(Math.max(Number(event.target.value), priceMin))} aria-label="Maximum price" className="pointer-events-none absolute inset-0 h-8 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-primary [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground"><span>₹0</span><span>₹9,99,999</span></div>
                </section>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-border p-4">
              <Button variant="outline" onClick={() => setDrawer(false)}>Cancel</Button>
              <Button onClick={() => setDrawer(false)}><Check className="size-4" />Apply ({products.length})</Button>
            </div>
          </aside>
        </div>
      )}
    </PageShell>
  );
}
