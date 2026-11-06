import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CreditCard, LockKeyhole, PackageCheck, RefreshCw, Truck } from "lucide-react";
import { PageShell } from "@/components/shop/site-shell";
import { SafeRichHtml } from "@/components/ui/safe-rich-html";
import { companyPolicyContent, useCompanyDetails } from "@/services/api/company.service";

export const Route = createFileRoute("/policies")({
  head: () => ({
    meta: [
      { title: "Policies and help — Kimaat Lock" },
      { name: "description", content: "Kimaat Lock privacy, terms, shipping, refunds and payment information." },
    ],
  }),
  component: PoliciesPage,
});

const policySections = [
  {
    id: "privacy-policy",
    title: "Privacy Policy",
    icon: LockKeyhole,
    intro: "Your information helps us provide and support your Kimaat Lock account and purchases.",
    points: [
      "We use the contact and delivery details you provide to manage your account, orders and customer support.",
      "Keep your sign-in and verification details private. Contact our support team if you believe your account has been accessed without permission.",
      "For questions about your personal information, contact the support team using the details below.",
    ],
  },
  {
    id: "terms-of-use",
    title: "Terms of Use",
    icon: PackageCheck,
    intro: "Using Kimaat Lock means you agree to provide accurate account and order information and follow the terms shown for each product or plan.",
    points: [
      "Product details, availability, pricing and applicable plan benefits are shown on the relevant product or checkout screen.",
      "Kavach protection and assured buyback are subject to the specific plan terms displayed at purchase.",
      "Please review your order information before confirming. Contact support if you need help with an order or account.",
    ],
  },
  {
    id: "cancellation-refund",
    title: "Cancellation & Refund",
    icon: RefreshCw,
    intro: "Cancellation and refund eligibility depends on the product, order status and any plan terms associated with your purchase.",
    points: [
      "Contact Kimaat Lock support with your order number as soon as possible to request help with a cancellation or refund.",
      "Any applicable refund amount and processing information will be shared after the request is reviewed.",
      "For Kavach purchases, the plan terms shown during checkout apply in addition to the order terms.",
    ],
  },
  {
    id: "shipping-policy",
    title: "Shipping Policy",
    icon: Truck,
    intro: "Delivery options and estimated timing may vary by product and delivery location.",
    points: [
      "Check your shipping address carefully before placing the order. Delivery availability is based on the address or pincode entered at checkout.",
      "Where available, order and delivery updates are shown in My Orders.",
      "Contact support if your delivery details need attention or you need help tracking an order.",
    ],
  },
  {
    id: "payments",
    title: "Payments",
    icon: CreditCard,
    intro: "Available payment methods are shown during checkout for your order.",
    points: [
      "Online payments are securely handed off to the payment provider shown at checkout.",
      "Cash on delivery is available only when offered for the order and delivery location.",
      "If a payment is pending or unsuccessful, check My Orders before trying again. Contact support with your order number if the status does not update.",
    ],
  },
];

function PoliciesPage() {
  const companyQuery = useCompanyDetails();
  const company = companyQuery.data?.result?.[0];
  const phone = company?.company_mobile?.trim() || company?.company_landline?.trim() || "";
  const email = company?.company_email?.trim() || "";
  return (
    <PageShell>
      <main className="mx-auto max-w-[1000px] px-4 py-8 md:px-8 md:py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="size-4" /> Back to home
        </Link>
        <header className="mt-5 rounded-3xl bg-logo bg-gradient-to-br from-logo via-logo to-[#174c85] px-5 py-7 text-logo-foreground sm:px-8 sm:py-9">
          <p className="text-xs font-semibold uppercase tracking-[.18em] opacity-75">Kimaat Lock information</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Policies &amp; payments</h1>
          <p className="mt-2 max-w-2xl text-sm opacity-80">Helpful information about your account, orders, delivery and payments.</p>
        </header>
        <nav aria-label="Policy sections" className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {policySections.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
              {section.title}
            </a>
          ))}
        </nav>
        <div className="mt-4 space-y-4">
          {policySections.map(({ id, title, icon: Icon, intro, points }) => (
            <section id={id} key={id} className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="size-5" /></span>
                <div className="min-w-0">
                  <h2 className="font-display text-xl sm:text-2xl">{title}</h2>
                  {id !== "privacy-policy" && id !== "terms-of-use" && <p className="mt-2 text-sm leading-6 text-muted-foreground">{intro}</p>}
                </div>
              </div>
              {id === "privacy-policy" || id === "terms-of-use" ? (
                companyPolicyContent(company, id) ? (
                  <SafeRichHtml html={companyPolicyContent(company, id)} className="company-rich-content mt-4 pl-[52px] text-sm" />
                ) : <p className="mt-4 pl-[52px] text-sm text-muted-foreground">{companyQuery.isLoading ? "Loading policy content…" : "Policy content is not available right now."}</p>
              ) : <ul className="mt-4 space-y-2 pl-[52px] text-sm leading-6 text-foreground/80">{points.map((point) => <li key={point} className="list-disc">{point}</li>)}</ul>}
            </section>
          ))}
        </div>
        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">Need help? {phone && <a className="font-semibold text-primary" href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a>} {email && <a className="font-semibold text-primary" href={`mailto:${email}`}>{email}</a>}</p>
      </main>
    </PageShell>
  );
}
