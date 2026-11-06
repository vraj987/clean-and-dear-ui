import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeHelp,
  CreditCard,
  LockKeyhole,
  PackageCheck,
  RefreshCw,
  Truck,
} from "lucide-react";
import { PageShell } from "@/components/shop/site-shell";
import { SafeRichHtml } from "@/components/ui/safe-rich-html";
import { companyPolicyContent, useCompanyDetails } from "@/services/api/company.service";

export const Route = createFileRoute("/help/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${helpPages[params.slug]?.title ?? "Help"} — Kimaat Lock` },
      {
        name: "description",
        content:
          helpPages[params.slug]?.description ?? "Kimaat Lock customer information and support.",
      },
    ],
  }),
  component: HelpPage,
});

type HelpSection = { title: string; paragraphs: string[]; bullets?: string[] };
type HelpPageData = {
  title: string;
  eyebrow: string;
  description: string;
  icon: typeof LockKeyhole;
  sections: HelpSection[];
};

const helpPages: Record<string, HelpPageData> = {
  "privacy-policy": {
    title: "Privacy Policy",
    eyebrow: "Your information",
    description:
      "How Kimaat Lock uses information you provide while browsing, placing orders, and using your account.",
    icon: LockKeyhole,
    sections: [
      {
        title: "Information you provide",
        paragraphs: [
          "When you create or use a Kimaat Lock account, place an order, request a service, or contact support, you may provide details such as your name, mobile number, email address, delivery address, and order information. If you use a device protection or buyback service, you may also provide device, invoice, and purchase details needed to process that request.",
          "You can choose whether to provide optional profile details. Information marked as required in a form is needed to complete that particular account, order, or service action.",
        ],
      },
      {
        title: "How information is used",
        paragraphs: [
          "Kimaat Lock uses submitted information to verify your account, process and deliver orders, provide requested protection services, show order and payment status, respond to support requests, and maintain the operation and security of the service.",
          "Payment information is handled as part of the checkout flow. When you choose online payment, the payment step may be provided by the payment provider displayed during checkout.",
        ],
      },
      {
        title: "Account and device safety",
        paragraphs: [
          "Keep one-time passwords and other verification codes private. They are used to confirm access to your account. Contact Kimaat Lock if you believe someone has accessed your account without your permission.",
          "Please provide accurate contact and delivery details and update them when they change. Incorrect information may prevent verification, delivery, or support from being completed.",
        ],
      },
      {
        title: "Your choices and questions",
        paragraphs: [
          "You can review and update profile information through the account area where those controls are available. For help with a privacy or account request, contact the support team using the details shown below.",
          "This page describes Kimaat Lock's current customer-facing information practices. The specific information requested can vary depending on the product or service you choose.",
        ],
      },
    ],
  },
  "terms-of-use": {
    title: "Terms of Use",
    eyebrow: "Using Kimaat Lock",
    description:
      "Guidance for browsing Kimaat Lock, using an account, and placing product or Kavach orders.",
    icon: PackageCheck,
    sections: [
      {
        title: "Accounts and accurate information",
        paragraphs: [
          "Use Kimaat Lock in accordance with applicable law and provide complete, accurate information when creating an account, requesting a service, or placing an order. You are responsible for keeping your sign-in and verification details secure and for activity performed through your account.",
          "Kimaat Lock may ask you to verify account or order details before completing a transaction or service request. Keep your mobile number and delivery information current so that required updates can reach you.",
        ],
      },
      {
        title: "Products, prices, and availability",
        paragraphs: [
          "Product names, images, specifications, prices, offers, and availability are presented on the relevant product and checkout screens. Information can vary by product variant, delivery location, and time. Review the selected product, storage or variant, quantity, delivery address, and total before confirming an order.",
          "If a product detail appears incorrect or unclear, contact support before completing the purchase. An order confirmation and the order information shown in your account provide the details available for that transaction.",
        ],
      },
      {
        title: "Kavach and assured buyback",
        paragraphs: [
          "Kavach is an optional plan where offered. The selected plan, duration, package price, and assured buyback amount are shown during selection and checkout. Eligibility and benefits depend on the details and terms shown for that plan and on the information submitted for the device.",
          "Review the plan details before purchase and retain the invoice and device information requested during enrollment. A displayed estimate or amount is tied to the selected device details, purchase information, package, and duration.",
        ],
      },
      {
        title: "Orders and support",
        paragraphs: [
          "After placing an order, use My Orders to review the order details and available status updates. If you need help with an order, provide its order number when contacting Kimaat Lock support.",
          "These terms should be read together with the relevant product, checkout, payment, shipping, cancellation, and plan information shown for your transaction.",
        ],
      },
    ],
  },
  "cancellation-refund": {
    title: "Cancellation & Refund",
    eyebrow: "Order changes",
    description:
      "How to request help with an order cancellation or refund and what information to include.",
    icon: RefreshCw,
    sections: [
      {
        title: "Requesting a cancellation",
        paragraphs: [
          "If you need to cancel an order, contact Kimaat Lock support as soon as possible and share your order number, registered mobile number, and the reason for the request. Whether an order can be cancelled depends on its current processing, dispatch, delivery, and service status.",
          "Check My Orders for the latest status. A cancellation request is not complete until the order status or support team confirms the outcome.",
        ],
      },
      {
        title: "Refund review",
        paragraphs: [
          "Refund eligibility and the amount, when applicable, are reviewed against the order, payment, delivery, and product or plan terms. The support team will share the outcome and any next steps after reviewing the request.",
          "For an online payment, a refund that has been approved is handled through the applicable payment process. The time for the credit to appear can depend on the payment provider and the bank or payment method. Keep your payment reference and order number available if you need help tracking it.",
        ],
      },
      {
        title: "Kavach and combined orders",
        paragraphs: [
          "Orders that include a Kavach plan or more than one product may have separate order or service details. Tell support which product or plan your request concerns so that the correct part of the order can be reviewed.",
          "Any cancellation or refund for Kavach is subject to the plan and transaction details shown at the time of purchase and the current status of the service.",
        ],
      },
      {
        title: "Contact support",
        paragraphs: [
          "Contact support with your order number and registered contact details. Do not include passwords or one-time verification codes in your request.",
        ],
      },
    ],
  },
  "shipping-policy": {
    title: "Shipping Policy",
    eyebrow: "Delivery information",
    description:
      "What to check about delivery availability, addresses, and order updates on Kimaat Lock.",
    icon: Truck,
    sections: [
      {
        title: "Delivery availability",
        paragraphs: [
          "Delivery availability depends on the selected product and the pincode entered at checkout. Available delivery options and any estimated timing are shown for the order when that information is available.",
          "An estimate is provided to help you plan and can change as an order is processed. Check the order status in My Orders for the latest information associated with your purchase.",
        ],
      },
      {
        title: "Shipping address",
        paragraphs: [
          "Enter a complete address, including the recipient name, reachable mobile number, house or flat details, area and street, city, state, and pincode. Review the address carefully before placing the order. An incomplete or incorrect address can make delivery difficult or delay fulfillment.",
          "If you notice an address issue after placing an order, contact Kimaat Lock support promptly with the order number. Address changes may depend on the order's current processing or dispatch status.",
        ],
      },
      {
        title: "Receiving your order",
        paragraphs: [
          "Please ensure someone is available at the delivery address to receive the order and complete any verification requested for that delivery. Keep the order confirmation and relevant delivery updates available until the order is received.",
          "If delivery is delayed, an order update is missing, or the parcel arrives with an issue, contact support and share your order number and a description of the concern.",
        ],
      },
      {
        title: "Help with delivery",
        paragraphs: [
          "For delivery questions, contact support and include your order number and the mobile number used for the order so the team can locate the correct details.",
        ],
      },
    ],
  },
  payments: {
    title: "Payments",
    eyebrow: "Checkout and payment help",
    description:
      "Information about online payments, cash on delivery where available, and payment status.",
    icon: CreditCard,
    sections: [
      {
        title: "Payment methods",
        paragraphs: [
          "The payment methods available for your purchase are shown at checkout. Depending on the order and delivery location, checkout may offer online payment or cash on delivery.",
          "Review the order total, delivery details, and selected payment method before confirming. The final amount due is shown in the order summary before you place the order.",
        ],
      },
      {
        title: "Online payment",
        paragraphs: [
          "When you choose online payment, Kimaat Lock opens the payment flow provided for the transaction. Follow the provider's instructions and do not refresh or close the payment step while it is processing if you can avoid doing so.",
          "After returning to Kimaat Lock, check My Orders for the payment and order status. If the status is pending, allow it to update before attempting another payment to avoid duplicate attempts.",
        ],
      },
      {
        title: "Failed, pending, or duplicated payment",
        paragraphs: [
          "A bank or payment-provider notification may arrive before the order status updates. Use the status in My Orders as the reference for the order and give the payment flow time to finish before retrying.",
          "If money appears to have been debited but the order remains unpaid, contact Kimaat Lock support with the order number, payment reference, amount, and approximate transaction time. Never share your password, card PIN, or one-time code with support.",
        ],
      },
      {
        title: "Cash on delivery",
        paragraphs: [
          "Cash on delivery appears only when it is available for the order. If selected, pay the amount shown in the order summary when the order is delivered and follow any verification steps presented for the delivery.",
        ],
      },
    ],
  },
  faqs: {
    title: "Frequently Asked Questions",
    eyebrow: "Here to help",
    description:
      "Answers to common questions about Kimaat Lock accounts, orders, protection plans, delivery, and payment.",
    icon: BadgeHelp,
    sections: [
      {
        title: "How do I place an order?",
        paragraphs: [
          "Choose a product and variant, review its price and details, then add it to your cart. Confirm the products, delivery address, and payment method during checkout. Your order and available status updates can be reviewed in My Orders.",
        ],
      },
      {
        title: "How can I check my order status?",
        paragraphs: [
          "Sign in to the account used for the purchase and open My Orders. Select an order to see its product details, payment information, delivery address, and status updates when available.",
        ],
      },
      {
        title: "What is Kavach?",
        paragraphs: [
          "Kavach is an optional device plan offered on eligible products. Available packages, duration choices, package price, and assured buyback amount are displayed during selection. Review the displayed plan information and applicable terms before purchase.",
        ],
      },
      {
        title: "Why is a duration unavailable?",
        paragraphs: [
          "Duration availability can depend on the device's purchase date and the schedule supplied for the selected plan. Only the available options are selectable. Check that the device and purchase details entered are correct if the options do not look right.",
        ],
      },
      {
        title: "What should I do if payment is pending or failed?",
        paragraphs: [
          "Check the order's payment status in My Orders before trying again. If the payment was debited but the order still appears unpaid, contact support with the order number and payment reference.",
        ],
      },
      {
        title: "Can I change my shipping address?",
        paragraphs: [
          "Contact Kimaat Lock support as soon as possible with your order number. Whether an address can be updated depends on the order's processing and dispatch status.",
        ],
      },
      {
        title: "How do I request cancellation or delivery help?",
        paragraphs: [
          "Contact support and include your order number and registered mobile number. The team will review the order status and explain the available next steps.",
        ],
      },
    ],
  },
};

function HelpPage() {
  const { slug } = Route.useParams();
  const page = helpPages[slug];
  const companyQuery = useCompanyDetails();
  const company = companyQuery.data?.result?.[0];
  const policyHtml = companyPolicyContent(company, slug);
  const usesCompanyPolicyHtml = [
    "privacy-policy",
    "terms-of-use",
    "cancellation-refund",
    "shipping-policy",
  ].includes(slug);
  const phone = company?.company_mobile?.trim() || company?.company_landline?.trim() || "";
  const email = company?.company_email?.trim() || "";
  if (!page) {
    return (
      <PageShell>
        <main className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8">
          <h1 className="font-display text-3xl">Page not found</h1>
          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <ArrowLeft className="size-4" /> Back to home
          </Link>
        </main>
      </PageShell>
    );
  }
  const Icon = page.icon;

  return (
    <PageShell>
      <main className="mx-auto max-w-[1000px] px-4 py-8 md:px-8 md:py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="size-4" /> Back to home
        </Link>
        <header className="mt-5 rounded-3xl bg-logo bg-gradient-to-br from-logo via-logo to-[#174c85] px-5 py-7 text-logo-foreground sm:px-8 sm:py-9">
          <span className="grid size-11 place-items-center rounded-2xl bg-white/10">
            <Icon className="size-5" />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[.18em] opacity-75">
            {page.eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">{page.title}</h1>
          {slug !== "privacy-policy" && slug !== "terms-of-use" && (
            <p className="mt-3 max-w-2xl text-sm leading-6 opacity-85">{page.description}</p>
          )}
        </header>
        {usesCompanyPolicyHtml ? (
          policyHtml ? (
            <SafeRichHtml html={policyHtml} className="company-rich-content mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7" />
          ) : (
            <p className="mt-5 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">{companyQuery.isLoading ? "Loading policy content…" : "Policy content is not available right now."}</p>
          )
        ) : (
        <div className="mt-5 space-y-4">
          {page.sections.map((section, index) => (
            <section
              key={section.title}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl sm:text-2xl">{section.title}</h2>
                  <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.bullets && (
                      <ul className="space-y-2 pl-5">
                        {section.bullets.map((item) => (
                          <li key={item} className="list-disc">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
        )}
        <footer className="mt-6 rounded-2xl bg-muted p-5 text-sm text-muted-foreground sm:flex sm:items-center sm:justify-between sm:gap-5">
          <p>Need help with this information? Contact the support team.</p>
          <div className="mt-2 flex shrink-0 flex-col gap-1 font-semibold text-primary sm:mt-0 sm:items-end">
            {phone && <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a>}
            {email && <a href={`mailto:${email}`} className="break-all">{email}</a>}
          </div>
        </footer>
      </main>
    </PageShell>
  );
}
