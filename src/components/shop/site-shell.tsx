import { Link } from "@tanstack/react-router";
import { Facebook, Home, Instagram, Mail, MapPin, Menu, PackageSearch, Phone, Search, ShoppingBag, Smartphone, UserRound, Youtube, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { catalog } from "@/lib/catalog";

const nav = [
  { label: "Home", to: "/" as const }, { label: "Subscription", to: "/subscription" as const },
  { label: "EMI Store", to: "/products" as const }, { label: "Products", to: "/products" as const },
  { label: "About Us", to: "/about" as const }, { label: "Cart", to: "/cart" as const },
  { label: "My Profile", to: "/profile" as const },
];

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const matches = useMemo(() => query.trim().length < 2 ? [] : catalog.filter((p) => `${p.brand} ${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5), [query]);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:px-8">
        <Link to="/" aria-label="BytePe home" className="grid size-11 shrink-0 place-items-center rounded-full bg-logo font-display text-xs leading-none text-logo-foreground transition-transform hover:scale-105">Byte<br />Pe</Link>
        <div className="relative min-w-0">
          <label className="flex min-w-0 items-center rounded-full bg-muted px-4 py-2.5 ring-primary transition focus-within:ring-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" className="min-w-0 flex-1 bg-transparent text-base outline-none md:text-sm" placeholder="Search products, brands..." />
            <Search className="size-5 shrink-0" />
          </label>
          {matches.length > 0 && <div className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-card border border-border bg-card shadow-card">
            {matches.map((product) => <Link key={product.slug} to="/products/$slug" params={{ slug: product.slug }} onClick={() => setQuery("")} className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border p-3 last:border-0 hover:bg-muted"><img src={product.image} alt="" className="size-11 rounded-md object-cover" style={{ objectPosition: product.imagePosition ?? "center" }} /><span className="min-w-0"><b className="block truncate text-sm">{product.name}</b><small className="text-muted-foreground">{product.brand} · {product.category}</small></span><span className="text-xs font-semibold text-primary">{product.price}</span></Link>)}
            <a href={`/products?q=${encodeURIComponent(query)}`} className="block bg-muted px-4 py-3 text-center text-xs font-semibold text-primary">See all results</a>
          </div>}
        </div>
        <nav className="hidden items-center gap-5 text-sm lg:flex">{nav.map((item) => <Link key={item.label} to={item.to} activeProps={{ className: "text-primary" }} activeOptions={{ exact: item.to === "/" }} className="whitespace-nowrap transition-colors hover:text-primary">{item.label}</Link>)}</nav>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</Button>
      </div>
      {open && <nav className="grid grid-cols-2 gap-1 border-t border-border p-3 lg:hidden">{nav.map((item) => <Link key={item.label} to={item.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">{item.label}</Link>)}</nav>}
      {!compact && <div className="h-0" />}
    </header>
  );
}

export function MobileAppNav() {
  const items = [{ label: "Home", to: "/" as const, Icon: Home }, { label: "EMI Store", to: "/products" as const, Icon: ShoppingBag }, { label: "Subscription", to: "/subscription" as const, Icon: Smartphone }, { label: "Products", to: "/products" as const, Icon: PackageSearch }, { label: "Profile", to: "/profile" as const, Icon: UserRound }];
  return <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-border bg-background/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">{items.map(({ label, to, Icon }) => <Link key={label} to={to} activeProps={{ className: "text-primary" }} activeOptions={{ exact: to === "/" }} className="flex min-w-0 flex-col items-center gap-1 py-2 text-[10px] text-muted-foreground"><Icon className="size-5" /><span className="truncate">{label}</span></Link>)}</nav>;
}

export function SiteFooter() {
  return <footer className="mt-16 border-t border-border bg-muted"><div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-10 md:grid-cols-[1fr_1fr_2fr] md:px-8"><div className="space-y-2 text-sm"><Link to="/about" className="block underline">About Us</Link><Link to="/orders" className="block underline">My Orders</Link><a href="#" className="block underline">Privacy Policy</a><a href="#" className="block underline">Terms of Use</a></div><div className="space-y-2 text-sm"><a href="#" className="block underline">Cancellation & Refund</a><a href="#" className="block underline">Shipping Policy</a><Link to="/checkout/payment" className="block underline">Payments</Link><Link to="/" hash="faqs" className="block underline">FAQs</Link></div><div className="space-y-3 text-sm"><h3 className="font-display text-xl">Contact Us</h3><p className="flex items-center gap-2"><Phone className="size-4" /> +91 8065918016</p><p className="flex items-center gap-2"><Mail className="size-4" /> care@bytepe.com</p><p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" /><span><b>Operating address:</b><br />Jbr Tech Park, Plot No. 77, 6th Rd, EPIP Zone, Whitefield, Bengaluru, Karnataka 560066</span></p><div className="flex gap-2">{[Facebook, Youtube, Instagram].map((Icon, i) => <span key={i} className="grid size-9 place-items-center rounded-full border border-border"><Icon className="size-4" /></span>)}</div></div></div><div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">Copyright © 2026, GoLuxea Internet Services Private Limited. All Rights Reserved.</div></footer>;
}

export function PageShell({ children, compactHeader = false, footer = true }: { children: ReactNode; compactHeader?: boolean; footer?: boolean }) {
  return <div className="min-h-screen bg-background pb-16 text-foreground md:pb-0"><SiteHeader compact={compactHeader} />{children}{footer && <SiteFooter />}<MobileAppNav /></div>;
}