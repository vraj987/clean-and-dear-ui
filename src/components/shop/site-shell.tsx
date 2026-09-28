import { Link, useNavigate } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Menu, Phone, Search, Youtube, ShoppingCart, User, Heart } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { categories } from "@/lib/catalog";

const navLinks = [
  { label: "EMI Store", to: "/products" as const },
  { label: "Subscription", to: "/subscription" as const },
  { label: "About Us", to: "/about" as const },
];

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate({ to: "/products", search: { brand: search.trim() } as any });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 md:px-8">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Toggle menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left font-display">BytePe</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Shop by Category</p>
                  {categories.map((c) => (
                    <SheetClose asChild key={c.value}>
                      <Link 
                        to="/products" 
                        search={{ category: c.value }} 
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
                      >
                        <c.icon className="size-4" />
                        {c.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
                <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                  {navLinks.map((item) => (
                    <SheetClose asChild key={item.label}>
                      <Link to={item.to} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
                <div className="mt-auto border-t pt-4">
                  <SheetClose asChild>
                    <Link to="/login" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
                      <User className="size-4" /> Sign In / Sign Up
                    </Link>
                  </SheetClose>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          
          <Link to="/" aria-label="BytePe home" className="grid size-11 shrink-0 place-items-center rounded-full bg-logo font-display text-xs leading-none text-logo-foreground">
            Byte<br />Pe
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex min-w-0 flex-1 items-center rounded-full bg-muted px-4 py-2.5">
          <input 
            aria-label="Search products" 
            className="min-w-0 flex-1 bg-transparent text-sm outline-none" 
            placeholder="Search for Products, brands..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">
            <Search className="size-5 shrink-0 text-muted-foreground" />
          </button>
        </form>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((item) => (
            <Link key={item.label} to={item.to} activeProps={{ className: "text-primary" }} className="text-sm font-medium transition-colors hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/profile" className="hidden size-10 items-center justify-center rounded-full hover:bg-muted md:flex">
            <User className="size-5" />
          </Link>
          <Link to="/cart" className="relative flex size-10 items-center justify-center rounded-full hover:bg-muted">
            <ShoppingCart className="size-5" />
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              0
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-muted">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-10 md:grid-cols-[1fr_1fr_2fr] md:px-8">
        <div className="space-y-2 text-sm">
          <Link to="/about" className="block underline">About Us</Link>
          <a href="#" className="block underline">Grievance Redressal</a>
          <a href="#" className="block underline">Privacy Policy</a>
          <a href="#" className="block underline">Terms of Use</a>
          <a href="#" className="block underline">Blogs</a>
        </div>
        <div className="space-y-2 text-sm">
          <a href="#" className="block underline">Order Cancellation & Refund Policy</a>
          <a href="#" className="block underline">Shipping Policy</a>
          <Link to="/checkout/payment" className="block underline">Payments</Link>
          <a href="#faqs" className="block underline">FAQs</a>
        </div>
        <div className="space-y-3 text-sm">
          <h3 className="font-display text-xl">Contact Us</h3>
          <p className="flex items-center gap-2"><Phone className="size-4" /> +91 8065918016</p>
          <p className="flex items-center gap-2"><Mail className="size-4" /> care@bytepe.com</p>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span><b>Operating address:</b><br />Jbr Tech Park, Plot No. 77, 6th Rd, EPIP Zone, Whitefield, Bengaluru, Karnataka 560066</span>
          </p>
          <div className="flex gap-2">
            <span className="grid size-9 place-items-center rounded-full border border-border"><Facebook className="size-4" /></span>
            <span className="grid size-9 place-items-center rounded-full border border-border"><Youtube className="size-4" /></span>
            <span className="grid size-9 place-items-center rounded-full border border-border"><Instagram className="size-4" /></span>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">
        Copyright © 2026, GoLuxea Internet Services Private Limited. All Rights Reserved.
      </div>
    </footer>
  );
}

export function PageShell({ children, compactHeader = false, footer = true }: { children: ReactNode; compactHeader?: boolean; footer?: boolean }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader compact={compactHeader} />
      {children}
      {footer && <SiteFooter />}
    </div>
  );
}
