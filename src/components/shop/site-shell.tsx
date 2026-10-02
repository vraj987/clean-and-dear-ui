import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Briefcase,
  Dumbbell,
  Footprints,
  Home,
  Instagram,
  Mail,
  MapPin,
  Menu,
  PackageSearch,
  Laptop,
  Phone,
  Plug,
  Search,
  ShoppingBag,
  Smartphone,
  Speaker,
  UserRound,
  Watch,
  WashingMachine,
  Youtube,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { catalog } from "@/lib/catalog";

const nav = [
  { label: "Home", to: "/" as const },
  { label: "Subscription", to: "/subscription" as const },
  { label: "EMI Store", to: "/products" as const },
  { label: "Products", to: "/products" as const },
  { label: "About Us", to: "/about" as const },
  { label: "Cart", to: "/cart" as const },
  { label: "My Profile", to: "/profile" as const },
];

const shopCategories = [
  { label: "For You", category: "All", Icon: ShoppingBag },
  { label: "Mobile", category: "Mobile", Icon: Smartphone },
  { label: "Audio", category: "Audio", Icon: Speaker },
  { label: "Accessories", category: "Accessories", Icon: Plug },
  { label: "Luggage", category: "Accessories", Icon: Briefcase },
  { label: "Wearables", category: "Wearables", Icon: Watch },
  { label: "Sports", category: "Footwear", Icon: Dumbbell },
  { label: "Appliances", category: "Electronics", Icon: WashingMachine },
  { label: "Electronics", category: "Electronics", Icon: Laptop },
  { label: "Footwear", category: "Footwear", Icon: Footprints },
];

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [activeCategory, setActiveCategory] = useState("For You");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!searchRef.current?.contains(event.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);
  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (
      term
        ? catalog.filter((p) => `${p.brand} ${p.name} ${p.category}`.toLowerCase().includes(term))
        : catalog
    ).slice(0, 5);
  }, [query]);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:px-8">
        <Link
          to="/"
          aria-label="BytePe home"
          className="flex h-11 w-[100px] shrink-0 items-center justify-center transition-transform hover:scale-105"
        >
          {import.meta.env["VITE_LOGO_URL"] && !logoFailed ? (
            <img
              src={import.meta.env["VITE_LOGO_URL"]}
              alt="BytePe"
              className="max-h-11 max-w-full object-contain"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="grid size-11 place-items-center rounded-full bg-logo font-display text-xs leading-none text-logo-foreground">
              Byte
              <br />
              Pe
            </span>
          )}
        </Link>
        <div ref={searchRef} className="relative min-w-0">
          <label className="flex min-w-0 items-center rounded-full bg-muted px-4 py-2.5 ring-primary transition focus-within:ring-2 lg:border lg:border-white">
            <input
              value={query}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setSearchOpen(false);
              }}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              aria-label="Search products"
              aria-expanded={searchOpen}
              aria-controls="product-search-suggestions"
              className="min-w-0 flex-1 bg-transparent text-base outline-none md:text-sm"
              placeholder="Search for Products, brands..."
            />
            <Search className="size-5 shrink-0" />
          </label>
          {searchOpen && (
            <div
              id="product-search-suggestions"
              className="absolute left-0 right-0 top-[calc(100%+8px)] max-h-[min(70vh,560px)] overflow-y-auto rounded-card border border-border bg-card shadow-card"
              style={{ zIndex: 999 }}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {query.trim() ? "Matching products" : "Popular right now"}
                </span>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search suggestions"
                  className="grid size-7 place-items-center rounded-full hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              </div>
              {matches.length ? (
                matches.map((product) => (
                  <Link
                    key={product.slug}
                    to="/products/$slug"
                    params={{ slug: product.slug }}
                    onClick={() => {
                      setQuery("");
                      setSearchOpen(false);
                    }}
                    className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border p-3 last:border-0 hover:bg-muted"
                  >
                    <img
                      src={product.image}
                      alt=""
                      className="size-11 rounded-md object-cover"
                      style={{ objectPosition: product.imagePosition ?? "center" }}
                    />
                    <span className="min-w-0">
                      <b className="block truncate text-sm">{product.name}</b>
                      <small className="text-muted-foreground">
                        {product.brand} · {product.category}
                      </small>
                    </span>
                    <span className="text-xs font-semibold text-primary">{product.price}</span>
                  </Link>
                ))
              ) : (
                <p className="px-4 py-5 text-sm text-muted-foreground">
                  No matches yet. Try another product or brand.
                </p>
              )}
              {query.trim() && (
                <div className="flex flex-wrap gap-2 border-t border-border px-3 py-3">
                  {[
                    ...new Set(
                      catalog
                        .filter((item) =>
                          `${item.brand} ${item.category}`
                            .toLowerCase()
                            .includes(query.toLowerCase()),
                        )
                        .map((item) => item.brand),
                    ),
                  ]
                    .slice(0, 3)
                    .map((brand) => (
                      <Link
                        key={brand}
                        to="/products"
                        search={{ brand, category: "All" }}
                        onClick={() => setSearchOpen(false)}
                        className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-primary hover:text-primary"
                      >
                        {brand}
                      </Link>
                    ))}
                </div>
              )}
              {/* <Link
                to="/products"
                search={{ brand: "All", category: "All", ...(query ? { q: query } : {}) }}
                onClick={() => setSearchOpen(false)}
                className="block bg-muted px-4 py-3 text-center text-xs font-semibold text-primary"
              >
                See all results{query ? ` for “${query}”` : ""}
              </Link> */}
            </div>
          )}
        </div>
        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
              className="whitespace-nowrap transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav className="grid grid-cols-2 gap-1 border-t border-border p-3 lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
      <nav aria-label="Shop categories" className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-3 scrollbar-none md:justify-between md:px-8">
          {shopCategories.map(({ label, category, Icon }) => (
            <Link
              key={label}
              to="/products"
              search={{ category }}
              onClick={() => setActiveCategory(label)}
              className={`group relative flex min-w-[76px] shrink-0 flex-col items-center gap-1 px-3 py-2.5 text-[11px] transition-colors hover:bg-primary-soft/60 hover:text-primary md:min-w-[88px] md:py-3 ${activeCategory === label ? "text-primary" : "text-muted-foreground"}`}
              aria-current={activeCategory === label ? "page" : undefined}
            >
              <Icon
                className="size-5 transition-transform duration-200 group-hover:-translate-y-0.5"
                strokeWidth={1.6}
              />
              <span className="whitespace-nowrap">{label}</span>
              <span
                className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary transition-transform ${activeCategory === label ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
              />
            </Link>
          ))}
        </div>
      </nav>
      {!compact && <div className="h-0" />}
    </header>
  );
}

export function MobileAppNav() {
  const items = [
    { label: "Home", to: "/" as const, Icon: Home },
    { label: "EMI Store", to: "/products" as const, Icon: ShoppingBag },
    { label: "Subscription", to: "/subscription" as const, Icon: Smartphone },
    { label: "Products", to: "/products" as const, Icon: PackageSearch },
    { label: "Profile", to: "/profile" as const, Icon: UserRound },
  ];
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-border bg-background/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_28px_rgba(20,24,35,0.08)] backdrop-blur md:hidden"
    >
      {items.map(({ label, to, Icon }) => (
        <Link
          key={label}
          to={to}
          activeProps={{
            className:
              "!text-primary [&_.mobile-nav-icon]:-translate-y-2.5 [&_.mobile-nav-icon]:bg-logo [&_.mobile-nav-icon]:text-logo-foreground [&_.mobile-nav-icon]:shadow-lg [&_.mobile-nav-icon]:ring-4 [&_.mobile-nav-icon]:ring-background [&_.mobile-nav-label]:font-bold",
          }}
          activeOptions={{ exact: to === "/" }}
          className="group flex min-w-0 flex-col items-center gap-0.5 py-2.5 text-[10px] text-muted-foreground transition-colors"
        >
          <span className="mobile-nav-icon grid size-9 place-items-center rounded-full transition-all duration-300 group-hover:bg-primary-soft group-hover:text-primary">
            <Icon className="size-5" />
          </span>
          <span className="mobile-nav-label truncate transition-all">{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-muted">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-10 md:grid-cols-[1fr_1fr_2fr] md:px-8">
        <div className="space-y-2 text-sm">
          <Link to="/about" className="block underline">
            About Us
          </Link>
          <Link to="/orders" className="block underline">
            My Orders
          </Link>
          <a href="#" className="block underline">
            Privacy Policy
          </a>
          <a href="#" className="block underline">
            Terms of Use
          </a>
        </div>
        <div className="space-y-2 text-sm">
          <a href="#" className="block underline">
            Cancellation & Refund
          </a>
          <a href="#" className="block underline">
            Shipping Policy
          </a>
          <Link to="/checkout/payment" className="block underline">
            Payments
          </Link>
          <Link to="/" hash="faqs" className="block underline">
            FAQs
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <h3 className="font-display text-xl">Contact Us</h3>
          <p className="flex items-center gap-2">
            <Phone className="size-4" /> +91 8065918016
          </p>
          <p className="flex items-center gap-2">
            <Mail className="size-4" /> care@bytepe.com
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>
              <b>Operating address:</b>
              <br />
              Jbr Tech Park, Plot No. 77, 6th Rd, EPIP Zone, Whitefield, Bengaluru, Karnataka 560066
            </span>
          </p>
          <div className="flex gap-2">
            {[Facebook, Youtube, Instagram].map((Icon, i) => (
              <span
                key={i}
                className="grid size-9 place-items-center rounded-full border border-border"
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">
        Copyright © 2026, GoLuxea Internet Services Private Limited. All Rights Reserved.
      </div>
    </footer>
  );
}

export function PageShell({
  children,
  compactHeader = false,
  footer = true,
}: {
  children: ReactNode;
  compactHeader?: boolean;
  footer?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background pb-16 text-foreground md:pb-0">
      <SiteHeader compact={compactHeader} />
      {children}
      {footer && <SiteFooter />}
      <MobileAppNav />
    </div>
  );
}
