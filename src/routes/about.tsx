import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/shop/site-shell";
import { ShieldCheck, Truck, RotateCcw, CreditCard } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About BytePe — BytePe" }, { name: "description", content: "BytePe is a subscription-based tech store with easy EMI on the latest gadgets." }] }),
  component: Page,
});

function Page() {
  const values = [
    { icon: CreditCard, title: "Easy EMI", text: "Get your favorite gadgets with flexible monthly payments that fit your budget." },
    { icon: ShieldCheck, title: "BytePe Verified", text: "Every product is 100% genuine and comes with brand warranty." },
    { icon: Truck, title: "Fast Delivery", text: "Quick shipping across India with open-box delivery for peace of mind." },
    { icon: RotateCcw, title: "Easy Returns", text: "Not happy with your purchase? Return it easily within our policy window." },
  ];

  return (
    <PageShell>
      <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl">Affordable tech for everyone.</h1>
          <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
            BytePe is redefining how India shops for technology. We believe that everyone should have access to the latest gadgets without the burden of upfront costs.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl bg-muted p-8">
              <v.icon className="size-8 text-primary" />
              <h3 className="mt-6 font-display text-xl">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>

        <section className="mt-24 rounded-3xl bg-logo p-8 text-logo-foreground md:p-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl">Our Mission</h2>
            <p className="mt-4 text-lg opacity-90">
              To empower every individual to own the best technology through innovative financial solutions and a seamless shopping experience. We're not just a store; we're your partner in staying ahead in the digital world.
            </p>
          </div>
        </section>

        <section className="mt-24">
          <h2 className="font-display text-3xl text-center">How BytePe Works</h2>
          <div className="mt-12 grid gap-12 md:grid-cols-3">
            {[
              { step: "01", title: "Choose Your Gadget", text: "Browse our wide range of phones, audio, and wearables." },
              { step: "02", title: "Select EMI Plan", text: "Pick a monthly payment plan that works for you." },
              { step: "03", title: "Verify & Get It", text: "Complete a quick KYC and get your product delivered fast." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <span className="text-6xl font-display text-primary/20">{s.step}</span>
                <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
