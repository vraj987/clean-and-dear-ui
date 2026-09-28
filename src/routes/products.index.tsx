import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { PageShell } from "@/components/shop/site-shell";
import { catalog, brands, categories } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { z } from "zod";

const productSearchSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
});

export const Route = createFileRoute("/products/")({
  validateSearch: (search) => productSearchSchema.parse(search),
  head: () => ({ meta: [{ title: "All Products — BytePe" }, { name: "description", content: "Browse phones, audio and more on easy monthly EMI." }] }),
  component: Page,
});

function Page() {
  const { category, brand } = useSearch({ from: "/products/" });
  const navigate = useNavigate({ from: "/products/" });

  const filteredProducts = catalog.filter(p => {
    if (category && p.category !== category) return false;
    if (brand && p.brand !== brand) return false;
    return true;
  });

  const toggleFilter = (key: 'category' | 'brand', value: string) => {
    const current = key === 'category' ? category : brand;
    navigate({
      search: (prev) => ({
        ...prev,
        [key]: current === value ? undefined : value
      })
    });
  };

  return (
    <PageShell>
      <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Filters Sidebar */}
          <aside className="w-full shrink-0 md:w-64">
            <h2 className="mb-4 font-display text-xl">Filters</h2>
            
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold">Categories</h3>
              <div className="flex flex-wrap gap-2 md:flex-col">
                {categories.map((c) => (
                  <Button
                    key={c.value}
                    variant={category === c.value ? "default" : "outline"}
                    size="sm"
                    className="justify-start rounded-full md:rounded-md"
                    onClick={() => toggleFilter('category', c.value)}
                  >
                    <c.icon className="mr-2 size-4" />
                    {c.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold">Brands</h3>
              <div className="flex flex-wrap gap-2 md:flex-col">
                {brands.map((b) => (
                  <Button
                    key={b}
                    variant={brand === b ? "default" : "outline"}
                    size="sm"
                    className="justify-start rounded-full md:rounded-md"
                    onClick={() => toggleFilter('brand', b)}
                  >
                    {b}
                  </Button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <h1 className="font-display text-3xl">
              {category ? categories.find(c => c.value === category)?.label : brand ? brand : "All Products"}
            </h1>
            <div className="mt-6 flex flex-wrap gap-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => <ProductCard key={p.slug} product={p} />)
              ) : (
                <p className="py-12 text-muted-foreground">No products found matching your filters.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
