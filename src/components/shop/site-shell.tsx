import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Menu, Phone, Search, Youtube, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

const nav = [
  { label: "Home", to: "/" as const },
  { label: "Subscription", to: "/subscription" as const },
  { label: "EMI Store", to: "/products" as const },
  { label: "Products", to: "/products" as const },
  { label: "About Us", to: "/about" as const },
  { label: "Cart", to: "/cart" as const },
  { label: "My Profile", to: "/profile" as const },
];

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 md:px-8">
        <Link to="/" aria-label="BytePe home" className="grid size-11 shrink-0 place-items-center rounded-full bg-logo font-display text-xs leading-none text-logo-foreground">Byte<br />Pe</Link>
        <label className="flex min-w-0 flex-1 items-center rounded-full bg-muted px-4 py-2.5">
          <input aria-label="Search products" className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search for Products, brands..." />
          <Search className="size-5 shrink-0" />
        </label>
        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {nav.map((item) => <Link key={item.label} to={item.to} activeProps={{ className: "text-primary" }} activeOptions={item.to === "/" ? { exact: true } : undefined} className="whitespace-nowrap transition-colors hover:text-primary">{item.label}</Link>)}
        </nav>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</Button>
      </div>
      {open && <nav className="grid grid-cols-2 gap-1 border-t border-border p-3 lg:hidden">{nav.map((item) => <Link key={item.label} to={item.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">{item.label}</Link>)}</nav>}
      {!compact && <div className="h-0" />}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-muted">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-10 md:grid-cols-[1fr_1fr_2fr] md:px-8">
        <div className="space-y-2 text-sm"><Link to="/about" className="block underline">About Us</Link><a href="#" className="block underline">Grievance Redressal</a><a href="#" className="block underline">Privacy Policy</a><a href="#" className="block underline">Terms of Use</a><a href="#" className="block underline">Blogs</a></div>
        <div className="space-y-2 text-sm"><a href="#" className="block underline">Order Cancellation & Refund Policy</a><a href="#" className="block underline">Shipping Policy</a><Link to="/checkout/payment" className="block underline">Payments</Link><a href="#faqs" className="block underline">FAQs</a></div>
        <div className="space-y-3 text-sm"><h3 className="font-display text-xl">Contact Us</h3><p className="flex items-center gap-2"><Phone className="size-4" /> +91 8065918016</p><p className="flex items-center gap-2"><Mail className="size-4" /> care@bytepe.com</p><p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" /><span><b>Operating address:</b><br />Jbr Tech Park, Plot No. 77, 6th Rd, EPIP Zone, Whitefield, Bengaluru, Karnataka 560066</span></p><div className="flex gap-2"><span className="grid size-9 place-items-center rounded-full border border-border"><Facebook className="size-4" /></span><span className="grid size-9 place-items-center rounded-full border border-border"><Youtube className="size-4" /></span><span className="grid size-9 place-items-center rounded-full border border-border"><Instagram className="size-4" /></span></div></div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">Copyright © 2026, GoLuxea Internet Services Private Limited. All Rights Reserved.</div>
    </footer>
  );
}

export function PageShell({ children, compactHeader = false, footer = true }: { children: ReactNode; compactHeader?: boolean; footer?: boolean }) {
  return <div className="min-h-screen bg-background text-foreground"><SiteHeader compact={compactHeader} />{children}{footer && <SiteFooter />}</div>;
}
