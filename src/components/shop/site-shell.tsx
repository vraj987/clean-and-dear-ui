import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Briefcase,
  Dumbbell,
  Mail,
  Footprints,
  Home,
  Heart,
  Instagram,
  MapPin,
  Menu,
  Laptop,
  Phone,
  Plug,
  Search,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Speaker,
  UserRound,
  Watch,
  WashingMachine,
  Youtube,
  X,
} from "lucide-react";
import { memo, useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { catalog, mapApiProduct } from "@/lib/catalog";
import { versionedAssetUrl } from "@/lib/versioned-asset-url";
import { cn } from "@/lib/utils";
import { getProducts } from "@/services/api/product.service";
import {
  getCompanyDetails,
  normalizeCompanyWebUrl,
  resolveCompanyLogoUrl,
} from "@/services/api/company.service";
import { apiQueryKeys } from "@/services/api/query-keys";

const nav = [
  { label: "Home", to: "/" as const },
  { label: "Shop Online", to: "/shop-online" as const },
  { label: "Cart", to: "/cart" as const },
  { label: "Profile", to: "/profile" as const },
];

export function rememberAuthReturnPath() {
  if (typeof window === "undefined" || window.location.pathname.endsWith("/profile")) return;
  window.sessionStorage.setItem(
    "kimaat_auth_return_to",
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
  );
}

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

export const SiteHeader = memo(function SiteHeader({ compact = false, hideMobileActions = false }: { compact?: boolean; hideMobileActions?: boolean }) {
  const [open, setOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const companyQuery = useQuery({
    queryKey: apiQueryKeys.companyDetails,
    queryFn: getCompanyDetails,
  });
  const company = companyQuery.data?.result?.[0];
  const companyName =
    company?.company_name?.trim() || import.meta.env["VITE_PROJECT_NAME"] || "Kimaat Lock";
  const logoUrl = versionedAssetUrl(
    (hydrated && resolveCompanyLogoUrl(company?.company_header_logo)) ||
      import.meta.env["VITE_LOGO_URL"],
  );
  const [activeCategory, setActiveCategory] = useState("For You");
  const [query, setQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [searchRun, setSearchRun] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);
  const [apiMatches, setApiMatches] = useState<typeof catalog>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const searchRequestId = useRef(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setHydrated(true), []);
  useEffect(() => setLogoFailed(false), [logoUrl]);
  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
        setMobileSearchExpanded(false);
      }
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);
  useEffect(() => {
    if (!mobileSearchExpanded) return;
    searchInputRef.current?.focus();
  }, [mobileSearchExpanded]);
  useEffect(() => {
    const term = submittedSearch.trim();
    if (term.length < 3) {
      return;
    }
    const requestId = ++searchRequestId.current;
    const controller = new AbortController();
    setSearchLoading(true);
    setSearchError(false);
    console.info("[Kimaat search] request started");
    void getProducts(
      { search: term, limit: "5", offset: "0" },
      { signal: controller.signal, maxResponseBytes: 512 * 1024 },
    )
      .then((records) => {
        if (requestId !== searchRequestId.current) return;
        const normalizedTerm = term.toLowerCase();
        setApiMatches(
          records
            .filter((record) =>
              [record.brand_name, record.model_name, record.pro_name, record.product_variant]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(normalizedTerm),
            )
            .slice(0, 5)
            .map(mapApiProduct),
        );
        console.info("[Kimaat search] request completed", {
          resultCount: Math.min(records.length, 5),
        });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted && requestId === searchRequestId.current) {
          setApiMatches([]);
          setSearchError(true);
          console.error("[Kimaat search] request failed", error);
        }
      })
      .finally(() => {
        if (requestId === searchRequestId.current) setSearchLoading(false);
      });
    return () => {
      controller.abort();
    };
  }, [searchRun, submittedSearch]);
  useEffect(() => {
    const term = query.trim();
    if (term.length < 3 || term === submittedSearch) return;
    const timer = window.setTimeout(() => {
      setSubmittedSearch(term);
      setSearchRun((run) => run + 1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [query, submittedSearch]);
  function submitSearch() {
    const term = query.trim();
    if (term.length < 3) {
      setSearchError(true);
      setSearchOpen(true);
      return;
    }
    setApiMatches([]);
    setSearchError(false);
    setSubmittedSearch(term);
    setSearchRun((run) => run + 1);
    setSearchOpen(true);
  }
  function closeMobileSearch(clear = false) {
    setMobileSearchExpanded(false);
    setSearchOpen(false);
    if (clear) {
      setQuery("");
      setSubmittedSearch("");
      setApiMatches([]);
      setSearchError(false);
    }
  }
  const matches = submittedSearch && submittedSearch === query.trim() ? apiMatches : [];
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:px-8">
        <Link
          to="/"
          aria-label={`${companyName} home`}
          className={cn(
            "h-20 w-[180px] shrink-0 items-center justify-center transition-transform hover:scale-105",
            mobileSearchExpanded ? "hidden md:flex" : "flex",
          )}
        >
          {logoUrl && !logoFailed ? (
            <img
              src={logoUrl}
              alt={companyName}
              className="max-h-11 max-w-full object-contain"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="grid size-11 place-items-center rounded-full bg-logo font-display text-xs leading-none text-logo-foreground">
              Kimaat
              <br />
              Lock
            </span>
          )}
        </Link>
        <div
          ref={searchRef}
          className={cn(
            "relative min-w-0",
            mobileSearchExpanded ? "col-span-2 block md:col-span-1" : "hidden md:block",
          )}
        >
          <div className="flex min-w-0 items-center rounded-full bg-muted px-4 py-2.5 ring-primary transition focus-within:ring-2 lg:border lg:border-white">
            <input
              ref={searchInputRef}
              id="site-product-search"
              name="product_search"
              value={query}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") closeMobileSearch();
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitSearch();
                }
              }}
              onChange={(e) => {
                setQuery(e.target.value);
                setSubmittedSearch("");
                setApiMatches([]);
                setSearchLoading(false);
                setSearchError(false);
                searchRequestId.current += 1;
                setSearchOpen(true);
              }}
              autoComplete="off"
              spellCheck={false}
              aria-label="Search products"
              aria-expanded={searchOpen}
              aria-controls="product-search-suggestions"
              className="min-w-0 flex-1 bg-transparent text-base outline-none md:text-sm"
              placeholder="Search for Products, brands..."
            />
            <button
              type="button"
              onClick={submitSearch}
              aria-label="Search products"
              className="ml-2 grid size-8 shrink-0 place-items-center rounded-full hover:bg-background/70"
            >
              <Search className="size-5" />
            </button>
            {mobileSearchExpanded && (
              <button
                type="button"
                onClick={() => closeMobileSearch(true)}
                aria-label="Cancel search"
                className="ml-1 grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-background/70 hover:text-foreground md:hidden"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
          {searchOpen && (
            <div
              id="product-search-suggestions"
              className="absolute left-0 right-0 top-[calc(100%+8px)] max-h-[min(70vh,560px)] overflow-y-auto rounded-card border border-border bg-card shadow-card"
              style={{ zIndex: 999 }}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {submittedSearch && submittedSearch === query.trim()
                    ? "Matching products"
                    : "Search products"}
                </span>
                <button
                  type="button"
                  onClick={() => closeMobileSearch()}
                  aria-label="Close search suggestions"
                  className="grid size-7 place-items-center rounded-full hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              </div>
              {searchLoading && submittedSearch === query.trim() ? (
                <p className="px-4 py-5 text-sm text-muted-foreground">Searching products…</p>
              ) : matches.length ? (
                matches.map((product) => (
                  <Link
                    key={product.slug}
                    to="/products/$slug"
                    params={{ slug: product.slug }}
                    onClick={() => {
                      setQuery("");
                      setSearchOpen(false);
                      setMobileSearchExpanded(false);
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
                  {searchError
                    ? query.trim().length < 3
                      ? "Enter at least 3 characters to search."
                      : "Products could not be searched right now. Please try again."
                    : submittedSearch === query.trim() && query.trim().length >= 3
                      ? "No products found. Try another product or brand."
                      : "Type at least 3 characters, then press Enter or tap search."}
                </p>
              )}
              {submittedSearch &&
                submittedSearch === query.trim() &&
                query.trim().length >= 3 &&
                !searchLoading && (
                  <div className="flex flex-wrap gap-2 border-t border-border px-3 py-3">
                    {[
                      ...new Set(
                        apiMatches
                          .filter((item) =>
                            `${item.brand} ${item.category}`
                              .toLowerCase()
                              .includes(submittedSearch.toLowerCase()),
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
        <nav className="hidden items-center gap-3 text-xs md:flex lg:gap-5 lg:text-sm">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
              className="whitespace-nowrap transition-colors hover:text-primary"
              onClick={() => {
                if (item.to === "/profile") rememberAuthReturnPath();
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {!hideMobileActions && <div className={cn("flex items-center justify-end gap-1 md:hidden", mobileSearchExpanded && "hidden")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setMobileSearchExpanded(true);
              setSearchOpen(true);
            }}
            aria-label="Open product search"
          >
            <Search className="size-5" />
          </Button>
          {/* <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(92vw,520px)] max-w-[520px] border-l border-border p-0 sm:max-w-[520px] md:hidden"
            >
              <SheetHeader className="border-b border-border p-5 text-left">
                <SheetTitle className="font-display text-2xl">Menu</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-2 p-4" aria-label="Mobile menu">
                {nav.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    activeProps={{ className: "bg-primary/10 text-primary" }}
                    activeOptions={{ exact: item.to === "/" }}
                    onClick={() => {
                      setOpen(false);
                      if (item.to === "/profile") rememberAuthReturnPath();
                    }}
                    className="rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet> */}
        </div>}
      </div>
      {!compact && <div className="h-0" />}
    </header>
  );
});

export const MobileAppNav = memo(function MobileAppNav() {
  const items = [
    { label: "Shop Online", to: "/shop-online" as const, Icon: ShoppingBag },
    { label: "Cart", to: "/cart" as const, Icon: ShoppingCart },
    { label: "Home", to: "/" as const, Icon: Home },
    { label: "Wishlist", to: "/wishlist" as const, Icon: Heart },
    { label: "Profile", to: "/profile" as const, Icon: UserRound },
  ];
  return (
    <nav
      aria-label="Mobile and tablet navigation"
      className="fixed bottom-0 left-0 right-0 z-50 box-border grid h-[calc(76px+env(safe-area-inset-bottom))] w-auto min-w-0 grid-cols-5 overflow-x-clip border-t border-[#0b2a55]/10 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_28px_rgba(11,42,85,0.12)] backdrop-blur lg:hidden"
    >
      {items.map(({ label, to, Icon }) => {
        const isCenterHome = label === "Home";
        return (
          <Link
            key={label}
            to={to}
            onClick={() => {
              if (label === "Profile") rememberAuthReturnPath();
            }}
            activeProps={{
              className: isCenterHome
                ? "!text-[#0b2a55] [&_.mobile-nav-icon]:ring-2 [&_.mobile-nav-icon]:ring-[#f58220]/35 [&_.mobile-nav-label]:font-bold"
                : "!text-[#0b2a55] [&_.mobile-nav-icon]:bg-[#0b2a55] [&_.mobile-nav-icon]:text-white [&_.mobile-nav-label]:font-bold",
            }}
            activeOptions={{ exact: to === "/" }}
            className={cn(
              "group flex w-full min-w-0 flex-col items-center justify-center gap-0.5 pt-2 text-[9px] text-[#65748b] transition-colors sm:text-[10px]",
              isCenterHome && "relative z-10 pt-0",
            )}
          >
            <span
              className={cn(
                "mobile-nav-icon grid size-8 place-items-center rounded-full transition-all duration-300 group-hover:bg-[#eaf1f8] group-hover:text-[#0b2a55]",
                isCenterHome &&
                  "-mt-7 size-14 border-4 border-white bg-gradient-to-br from-[#ff9b32] to-[#f36f16] text-white shadow-[0_5px_16px_rgba(245,130,32,.42)] group-hover:bg-gradient-to-br group-hover:from-[#ff9b32] group-hover:to-[#f36f16] group-hover:text-white",
              )}
            >
              <Icon className={cn(isCenterHome ? "size-6" : "size-5")} />
            </span>
            <span
              className={cn(
                "mobile-nav-label max-w-full truncate transition-all",
                isCenterHome && "font-semibold text-[#0b2a55]",
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
});

export const SiteFooter = memo(function SiteFooter() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const companyQuery = useQuery({
    queryKey: apiQueryKeys.companyDetails,
    queryFn: getCompanyDetails,
  });
  // Company details may already be cached on the client, while SSR has no
  // matching snapshot. Render contact links only after hydration to keep the
  // server and first client render identical.
  const company = mounted ? companyQuery.data?.result?.[0] : undefined;
  const phone = company?.company_mobile?.trim() || company?.company_landline?.trim() || "";
  const email = company?.company_email?.trim() || "";
  const address = company?.company_address?.trim() || "";
  const socialLinks = [
    { url: normalizeCompanyWebUrl(company?.facebook_url), Icon: Facebook, label: "Facebook" },
    { url: normalizeCompanyWebUrl(company?.youtube_url), Icon: Youtube, label: "YouTube" },
    { url: normalizeCompanyWebUrl(company?.instagram_url), Icon: Instagram, label: "Instagram" },
  ].filter((item) => Boolean(item.url));
  return (
    <footer className="mt-16 hidden border-t border-border bg-muted lg:block">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-10 md:grid-cols-[1fr_1fr_2fr] md:px-8">
        <div className="space-y-2 text-sm">
          <Link to="/" className="block underline">
            Home
          </Link>
          <Link to="/shop-online" className="block underline">
            Shop Online
          </Link>
         
          <Link to="/orders" className="block underline">
            My Orders
          </Link>
          <Link to="/cart" className="block underline">
            My Cart
          </Link>
          <Link to="/profile" className="block underline">
            My Profile
          </Link>
          
        </div>
        <div className="space-y-2 text-sm">
          <Link to="/help/$slug" params={{ slug: "privacy-policy" }} className="block underline">
            Privacy Policy
          </Link>
          <Link to="/help/$slug" params={{ slug: "terms-of-use" }} className="block underline">
            Terms of Use
          </Link>
          <Link
            to="/help/$slug"
            params={{ slug: "cancellation-refund" }}
            className="block underline"
          >
            Cancellation & Refund
          </Link>
          <Link to="/help/$slug" params={{ slug: "shipping-policy" }} className="block underline">
            Shipping Policy
          </Link>
          <Link
            to="/shop-online"
            hash="frequently-asked-questions"
            className="block underline"
          >
            FAQs
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <h3 className="font-display text-xl">Contact Us</h3>
          {phone && (
            <a
              href={`tel:${phone.replace(/[^+\d]/g, "")}`}
              className="flex items-center gap-2 hover:text-primary"
            >
              <Phone className="size-4" />
              {phone}
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 break-all hover:text-primary"
            >
              <Mail className="size-4 shrink-0" />
              {email}
            </a>
          )}
          {address && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2 hover:text-primary"
            >
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>
                <b>Address:</b>
                <br />
                {address}
              </span>
            </a>
          )}
          {socialLinks.length > 0 && (
            <div className="flex gap-2">
              {socialLinks.map(({ url, Icon, label }) => (
                <a
                  key={label}
                  href={url!}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid size-9 place-items-center rounded-full border border-border hover:border-primary hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">
        Made with <span aria-label="love" className="text-primary">♥</span> by{" "}
        <a
          href="https://bitsinfotech.in/"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-primary transition hover:underline"
        >
          Bits Infotech
        </a>
      </div>
    </footer>
  );
});

export function ProfileFooterLinks() {
  return (
    <section
      className="mx-auto mb-6 mt-8 max-w-[1100px] px-4 lg:hidden"
      aria-labelledby="profile-more-title"
    >
      <h2 id="profile-more-title" className="mb-3 font-display text-xl">
        More from Kimaat Lock
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
        <Link to="/" className="text-primary">
          Home
        </Link>
        <Link to="/shop-online" className="text-primary">
          Shop Online
        </Link>
        <Link to="/help/$slug" params={{ slug: "privacy-policy" }}>
          Privacy Policy
        </Link>
        <Link to="/help/$slug" params={{ slug: "terms-of-use" }}>
          Terms of Use
        </Link>
        <Link to="/help/$slug" params={{ slug: "cancellation-refund" }}>
          Cancellation & Refund
        </Link>
        <Link to="/help/$slug" params={{ slug: "shipping-policy" }}>
          Shipping Policy
        </Link>
        <Link to="/shop-online" hash="frequently-asked-questions">
          FAQs
        </Link>
      </div>
    </section>
  );
}

export function PageShell({
  children,
  compactHeader = false,
  hideMobileHeaderActions = false,
  footer = true,
}: {
  children: ReactNode;
  compactHeader?: boolean;
  hideMobileHeaderActions?: boolean;
  footer?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background pb-[calc(5rem+env(safe-area-inset-bottom))] text-foreground lg:pb-0">
      <SiteHeader compact={compactHeader} hideMobileActions={hideMobileHeaderActions} />
      {children}
      {footer && <SiteFooter />}
      <MobileAppNav />
    </div>
  );
}
