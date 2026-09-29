import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { CatalogItem } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: CatalogItem }) {
  return (
    <Link to="/products/$slug" params={{ slug: product.slug }} className="group block min-w-0">
      <article className="h-full overflow-hidden rounded-card border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card">
        <div className={cn("relative grid aspect-[4/3] place-items-center overflow-hidden", product.tone)}>
          {product.tag && <span className="absolute left-2 top-2 z-10 rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">{product.tag}</span>}
          <span className="absolute right-2 top-2 z-10 flex items-center gap-1 text-xs font-semibold"><Star className="size-3 fill-current text-product-sun" />{product.rating}</span>
          <img src={product.image} alt={`${product.brand} ${product.name}`} loading="lazy" width={1600} height={1104} className="size-full object-cover transition duration-500 group-hover:scale-105" style={{ objectPosition: product.imagePosition ?? "center" }} />
        </div>
        <div className="p-4 text-sm">
          <p className="text-xs text-muted-foreground">{product.brand}</p>
          <h3 className="mt-1 truncate font-semibold">{product.name}</h3>
          <p className="mt-2 text-xs">From <span className="font-semibold text-primary">{product.monthly}</span></p>
          <p className="mt-1 font-semibold">{product.price} {product.mrp && <s className="ml-1 text-xs font-normal text-muted-foreground">{product.mrp}</s>}</p>
        </div>
      </article>
    </Link>
  );
}