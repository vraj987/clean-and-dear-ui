import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, Landmark, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { ApiStatusError } from "@/services/api/client";
import {
  checkSavedSession,
  clearAuthSession,
  clearSavedAccountData,
  readAuthSession,
  type AuthSession,
} from "@/services/api/auth";

export const Route = createFileRoute("/checkout/payment")({
  head: () => ({
    meta: [
      { title: "Payment Options — BytePe" },
      { name: "description", content: "Choose a payment option for your BytePe order." },
    ],
  }),
  component: PaymentPage,
});
const BILLING_KEY = "kimaat-lock-billing-address";
function PaymentPage() {
  const navigate = useNavigate({ from: "/checkout/payment" });
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [address, setAddress] = useState<Record<string, string>>({});
  useEffect(() => {
    let mounted = true;
    const saved = readAuthSession();
    if (!saved) {
      setChecking(false);
      return;
    }
    setSession(saved);
    try {
      setAddress(JSON.parse(localStorage.getItem(BILLING_KEY) || "{}") as Record<string, string>);
    } catch {
      setAddress({});
    }
    void checkSavedSession(saved)
      .catch((error: unknown) => {
        if (error instanceof ApiStatusError) {
          if (String(error.status) === "3") clearSavedAccountData();
          else clearAuthSession();
          if (mounted) {
            setSession(null);
            void navigate({ to: "/profile" });
          }
        }
      })
      .finally(() => {
        if (mounted) setChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, [navigate]);
  if (checking)
    return (
      <PageShell footer={false}>
        <main className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
          Checking your account…
        </main>
      </PageShell>
    );
  if (!session)
    return (
      <PageShell footer={false}>
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Sign in to continue</h1>
          <p className="mt-3 text-muted-foreground">Please verify your profile before checkout.</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/profile">Continue to profile</Link>
          </Button>
        </main>
      </PageShell>
    );
  return (
    <PageShell footer={false}>
      <main className="mx-auto max-w-[900px] px-4 py-8 md:px-8">
        <Link to="/checkout/address" className="text-sm">
          ← Shipping Address
        </Link>
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_300px]">
          <section>
            <h1 className="font-display text-3xl">Payment Options</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose how you would like to pay your monthly plan.
            </p>
            <div className="mt-5 rounded-xl bg-muted p-4 text-sm">
              <b>Delivering to {address["name"] || session.name}</b>
              <p className="mt-1 text-muted-foreground">
                {address["address"]}
                {address["area"] ? `, ${address["area"]}` : ""}
                {address["city_id"] ? `, ${address["city_id"]}` : ""}
                {address["pincode"] ? ` · ${address["pincode"]}` : ""}
              </p>
            </div>
            <div className="mt-6 space-y-3">
              {[
                [CreditCard, "Credit or Debit Card", "All major cards"],
                [Landmark, "Bank EMI", "Select from available partner banks"],
                [Smartphone, "UPI", "Pay using any UPI app"],
              ].map(([Icon, title, text], index) => {
                const PaymentIcon = Icon as typeof CreditCard;
                return (
                  <label
                    key={title as string}
                    className="flex cursor-pointer items-center gap-4 rounded-card border border-border bg-card p-5 shadow-card"
                  >
                    <input
                      type="radio"
                      name="payment"
                      defaultChecked={index === 0}
                      className="accent-[var(--primary)]"
                    />
                    <PaymentIcon className="size-6 text-primary" />
                    <span>
                      <b>{title as string}</b>
                      <small className="block text-muted-foreground">{text as string}</small>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
          <aside className="rounded-card bg-muted p-5">
            <h2 className="font-display text-xl">Order total</h2>
            <p className="mt-4 flex justify-between text-sm">
              <span>Galaxy A57 5G</span>
              <b>₹49,999</b>
            </p>
            <p className="mt-2 flex justify-between text-sm">
              <span>Monthly EMI</span>
              <b>₹2,326</b>
            </p>
            <Button className="mt-8 w-full rounded-full" onClick={() => undefined}>
              Proceed to Pay
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Payment is a visual checkout preview. No charge will be made.
            </p>
          </aside>
        </div>
      </main>
    </PageShell>
  );
}
