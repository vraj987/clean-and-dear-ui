import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Box, CheckCircle2, Heart, PackageCheck, Share2, ShieldCheck, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { catalog } from "@/lib/catalog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export const Route = createFileRoute("/products/$slug")({
  beforeLoad: ({ params }) => { 
    const product = catalog.find(p => p.slug === params.slug);
    if (!product) throw notFound(); 
  },
  head: ({ params }) => {
    const product = catalog.find(p => p.slug === params.slug);
    return { meta: [
      { title: `${product?.brand} ${product?.name} — BytePe` },
      { name: "description", content: product?.description },
    ]};
  },
  component: ProductDetail,
});

const offers = ["Axis Bank", "ICICI Bank", "HDFC Bank"];

function ProductDetail() {
  const { slug } = Route.useParams();
  const product = catalog.find(p => p.slug === slug)!;
  const [color, setColor] = useState("Iceblue");
  const [ram, setRam] = useState("8GB");
  const [tab, setTab] = useState("Description");
  const [activeImage, setActiveImage] = useState(0);

  return (
    <PageShell compactHeader>
      <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,1fr)]">
          {/* Gallery Section */}
          <section className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative flex flex-col gap-4">
              <div className="relative grid min-h-[430px] place-items-center rounded-card bg-muted p-6 md:min-h-[620px]">
                <img 
                  src={product.images[activeImage]} 
                  alt={product.name} 
                  className="max-h-[570px] w-full object-contain" 
                />
                <div className="absolute right-3 top-3 flex gap-2">
                  <Button size="icon" variant="outline" aria-label="Share"><Share2 className="size-4" /></Button>
                  <Button size="icon" variant="outline" aria-label="Add to wishlist"><Heart className="size-4" /></Button>
                </div>
              </div>
              
              {/* Thumbnails */}
              <div className="flex justify-center gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "size-20 overflow-hidden rounded-md border-2 bg-muted transition-all",
                      activeImage === idx ? "border-primary" : "border-transparent"
                    )}
                  >
                    <img src={img} alt="" className="size-full object-contain p-2" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Details Section */}
          <section>
            <h1 className="font-display text-3xl">{product.brand} {product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <b className="text-2xl">{product.price}</b>
              {product.mrp && <s className="text-muted-foreground">{product.mrp}</s>}
              {product.tag && <span className="rounded bg-success px-2 py-1 text-xs font-semibold text-primary-foreground">{product.tag}</span>}
            </div>
            <p className="mt-1 text-sm">EMI From <b className="text-primary">{product.monthly}</b></p>
            
            <div className="mt-6">
              <p className="text-sm">Color - Awesome {color}</p>
              <div className="mt-3 flex gap-3">
                {["Iceblue", "Lavender", "Graphite"].map((value) => (
                  <Button key={value} variant="outline" size="icon" onClick={() => setColor(value)} className={cn("rounded-full", color === value && "ring-2 ring-primary")}>
                    <span className={cn("size-7 rounded-full", value === "Iceblue" ? "bg-product-blue" : value === "Lavender" ? "bg-product-lilac" : "bg-logo")} />
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="mt-5">
              <p className="text-sm">Storage</p>
              <Button className="mt-2 rounded-full bg-logo hover:bg-logo">256GB</Button>
            </div>
            
            <div className="mt-5">
              <p className="text-sm">RAM</p>
              <div className="mt-2 flex gap-2">
                {["8GB", "12GB"].map((value) => (
                  <Button key={value} variant={ram === value ? "default" : "outline"} className={cn("rounded-full", ram === value && "bg-logo hover:bg-logo")} onClick={() => setRam(value)}>{value}</Button>
                ))}
              </div>
            </div>

            <div className="mt-7 rounded-card border border-primary p-4">
              <div className="flex justify-between text-sm">
                <span><b className="text-primary">●</b> EMI<br /><small className="ml-4 text-muted-foreground">No Cost EMI</small></span>
                <b>{product.monthly} x 24mo</b>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {offers.map((offer) => (
                  <div key={offer} className="rounded-md border border-border p-3">
                    <b>₹2,500 Off</b>
                    <p className="text-xs text-muted-foreground">{offer}</p>
                    <button className="mt-2 text-xs font-semibold text-primary">Apply</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-y border-border py-5">
              <div>
                <span className="text-xs text-muted-foreground">EMI</span>
                <p className="text-xl font-semibold">{product.monthly} x 24mo</p>
              </div>
              <Button asChild className="w-56 rounded-full">
                <Link to="/cart"><ShoppingCart className="size-4" />Buy Now</Link>
              </Button>
            </div>

            <div className="mt-6">
              <h2 className="font-display text-2xl">Delivery details</h2>
              <p className="mt-2 text-sm text-muted-foreground">Orders are checked at delivery so you can verify the product is genuine, undamaged and in perfect working condition.</p>
              <div className="mt-5 flex gap-4 rounded-card bg-muted p-5">
                <Box className="size-6 text-primary" />
                <div>
                  <b>Open Box Delivery for Your Peace of Mind</b>
                  <p className="mt-1 text-xs text-muted-foreground">Your order will be opened in your presence at delivery.</p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-card border border-primary p-5">
              <h3 className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-5 text-success" />BytePe Verified</h3>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
                <div><ShieldCheck className="mx-auto mb-2 text-primary" />Authorised Seller</div>
                <div><Star className="mx-auto mb-2 text-primary" />Top Rated</div>
                <div><PackageCheck className="mx-auto mb-2 text-primary" />Brand New</div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl">All Details</h2>
          <div className="mt-4 flex gap-6 border-b border-border">
            {["Description", "Specifications"].map((value) => (
              <button key={value} onClick={() => setTab(value)} className={cn("border-b-2 pb-3 text-sm", tab === value ? "border-primary font-semibold" : "border-transparent text-muted-foreground")}>{value}</button>
            ))}
          </div>
          {tab === "Description" ? (
            <div className="py-5 text-sm">
              <p>{product.description}</p>
              <ul className="mt-5 list-disc space-y-1 pl-5">
                {product.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </div>
          ) : (
            <div className="grid gap-3 py-5 text-sm sm:grid-cols-2">
              <p><b>Brand:</b> {product.brand}</p>
              <p><b>Category:</b> {product.category}</p>
              <p><b>Storage:</b> 256GB</p>
              <p><b>RAM:</b> {ram}</p>
            </div>
          )}
        </section>
      </main>
    </PageShell>
  );
}
