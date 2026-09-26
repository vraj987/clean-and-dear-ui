import { Link } from "@tanstack/react-router";
import type { CatalogItem } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: CatalogItem }) {
  const Icon = product.icon;
  return <Link to="/products/$slug" params={{ slug: product.slug }} className="group block w-60 shrink-0">
    <div className={cn("relative grid h-52 place-items-center overflow-hidden rounded-lg", product.tone)}>
      {product.tag && <span className="absolute left-2 top-3 rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">{product.tag}</span>}
      <Icon className="size-24 stroke-[1] transition-transform group-hover:scale-105" />
    </div>
    <div className="px-2 pt-3 text-sm"><p className="truncate"><b>{product.brand}</b> {product.name}</p><p className="text-xs">From <span className="font-semibold text-primary">{product.monthly}</span></p><p className="text-xs font-semibold">{product.price} {product.mrp && <s className="font-normal text-muted-foreground">{product.mrp}</s>}</p></div>
  </Link>;
}
