import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/shop/site-shell";
import { catalog } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/product-card";
export const Route = createFileRoute("/products/")({
  head: () => ({ meta: [{ title: "All Products — BytePe" }, { name: "description", content: "Browse phones, audio and more on easy monthly EMI." }, { property: "og:title", content: "All Products — BytePe" }, { property: "og:description", content: "Browse phones, audio and more on easy monthly EMI." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});

function Page() {
  return <PageShell><main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8"><h1 className="font-display text-3xl">All Products</h1><div className="mt-6 flex flex-wrap gap-4">{catalog.map((p) => <ProductCard key={p.slug} product={p} />)}</div></main></PageShell>;
}
