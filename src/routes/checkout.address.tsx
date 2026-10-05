import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LocateFixed } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ApiStatusError } from "@/services/api/client";
import {
  checkSavedSession,
  clearAuthSession,
  clearSavedAccountData,
  readAuthSession,
  type AuthSession,
} from "@/services/api/auth";
import { getCities, getStates, type CityRecord, type StateRecord } from "@/services/api/catalog";

export const Route = createFileRoute("/checkout/address")({
  head: () => ({
    meta: [
      { title: "Shipping Address — BytePe" },
      { name: "description", content: "Enter your delivery address for your BytePe order." },
    ],
  }),
  component: AddressPage,
});
const BILLING_KEY = "kimaat-lock-billing-address";
type Billing = {
  name: string;
  email: string;
  mobile: string;
  address: string;
  area: string;
  landmark: string;
  pincode: string;
  state_id: string;
  city_id: string;
  addressType: string;
};
const blank: Billing = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  area: "",
  landmark: "",
  pincode: "",
  state_id: "",
  city_id: "",
  addressType: "Home",
};
function AddressPage() {
  const navigate = useNavigate({ from: "/checkout/address" });
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState<Billing>(blank);
  const [states, setStates] = useState<StateRecord[]>([]);
  const [cities, setCities] = useState<CityRecord[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  useEffect(() => {
    let mounted = true;
    const saved = readAuthSession();
    if (!saved) {
      setChecking(false);
      return;
    }
    setSession(saved);
    try {
      const billing = localStorage.getItem(BILLING_KEY);
      const cached = billing ? (JSON.parse(billing) as Partial<Billing>) : {};
      setForm({
        ...blank,
        ...cached,
        name: cached.name || saved.name,
        email:
          cached.email || saved.account["customer_email"] || "",
        mobile: cached.mobile || saved.mobile,
        state_id: cached.state_id || saved.account["state_id"] || "",
        city_id: cached.city_id || saved.account["city_id"] || "",
      });
    } catch {
      setForm({ ...blank, name: saved.name, mobile: saved.mobile });
    }
    void getStates()
      .then((v) => {
        if (mounted) setStates(v);
      })
      .catch(() => undefined);
    void checkSavedSession(saved)
      .catch((error: unknown) => {
        if (error instanceof ApiStatusError) {
          if (String(error.status) === "3") clearSavedAccountData();
          else clearAuthSession();
          if (mounted) {
            setSession(null);
            setNotice(error.message);
          }
        } else if (mounted)
          setNotice(
            "Could not validate your session right now. Your saved profile is still available.",
          );
      })
      .finally(() => {
        if (mounted) setChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (!form.state_id) {
      setCities([]);
      setCitiesLoading(false);
      return;
    }
    let active = true;
    setCities([]);
    setCitiesLoading(true);
    void getCities(form.state_id)
      .then((records) => {
        if (active) setCities(records);
      })
      .catch(() => {
        if (active) setCities([]);
      })
      .finally(() => {
        if (active) setCitiesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [form.state_id]);
  function update<K extends keyof Billing>(key: K, value: Billing[K]) {
    setForm((old) => ({ ...old, [key]: value }));
  }
  function chooseState(value: string) {
    setForm((old) => ({ ...old, state_id: value, city_id: "" }));
  }
  function chooseCity(value: string) {
    update("city_id", value);
  }
  function proceed(event: FormEvent) {
    event.preventDefault();
    if (!session) return;
    if (!form.state_id || !form.city_id) {
      setNotice("Choose a state and city before continuing.");
      return;
    }
    localStorage.setItem(BILLING_KEY, JSON.stringify(form));
    void navigate({ to: "/checkout/payment" });
  }
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
          <p className="mt-3 text-muted-foreground">
            Your verified profile helps us prefill your billing details.
          </p>
          {notice && <p className="mt-3 text-sm text-primary">{notice}</p>}
          <Button asChild className="mt-6 rounded-full">
            <Link to="/profile">Continue to profile</Link>
          </Button>
        </main>
      </PageShell>
    );
  return (
    <PageShell footer={false}>
      <main className="mx-auto max-w-[1100px] px-4 py-7 md:px-8">
        <Link to="/cart" className="text-sm">
          ← Cart Summary
        </Link>
        <div className="mx-auto mt-4 flex max-w-xl items-center">
          <span className="size-4 rounded-full border-2 border-primary bg-background" />
          <span className="h-px flex-1 bg-border" />
          <span className="size-4 rounded-full border-2 border-border bg-background" />
        </div>
        <div className="mx-auto mt-2 flex max-w-[570px] justify-between text-xs text-muted-foreground">
          <span>Address</span>
          <span>Payment</span>
        </div>
        <h1 className="mt-10 font-display text-3xl">Shipping Address</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your verified account details are filled in. Review them before continuing.
        </p>
        {notice && (
          <p className="mt-3 rounded-xl bg-muted p-3 text-sm text-muted-foreground">{notice}</p>
        )}
        <Button variant="outline" className="mt-5 w-full rounded-full">
          <LocateFixed className="size-4 text-primary" />
          Use my current location
        </Button>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={proceed}>
          {(
            [
              ["Full name", "name", "text"],
              ["House / flat number", "address", "text"],
              ["Email address", "email", "email"],
              ["Area, street or sector", "area", "text"],
              ["Mobile number", "mobile", "tel"],
              ["Landmark (optional)", "landmark", "text"],
              ["Pincode", "pincode", "text"],
            ] as const
          ).map(([label, key, type]) => (
            <label key={key} className="block text-xs">
              {label}
              {!label.includes("optional") && <b className="text-primary"> *</b>}
              <Input
                required={!label.includes("optional")}
                type={type}
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                className="mt-1 h-11"
              />
            </label>
          ))}
          <label className="block text-xs">
            State <b className="text-primary">*</b>
            <SearchableSelect
              options={states.map((state) => ({ value: state.state_id, label: state.state_name }))}
              value={form.state_id}
              onValueChange={chooseState}
              placeholder="Search your state"
              className="mt-1"
            />
          </label>
          <label className="block text-xs">
            City <b className="text-primary">*</b>
            <SearchableSelect
              options={cities.map((city) => ({ value: city.city_id, label: city.city_name }))}
              value={form.city_id}
              onValueChange={chooseCity}
              disabled={!form.state_id}
              loading={citiesLoading}
              placeholder="Search your city"
              className="mt-1"
            />
          </label>
          <fieldset className="md:col-span-2">
            <legend className="text-sm">Choose address type</legend>
            <div className="mt-2 flex gap-5 text-sm">
              {["Home", "Office", "Other"].map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="addressType"
                    checked={form.addressType === type}
                    onChange={() => update("addressType", type)}
                    className="accent-[var(--primary)]"
                  />
                  {type}
                </label>
              ))}
            </div>
          </fieldset>
          <Button type="submit" className="mt-4 w-full rounded-full md:col-span-2">
            Save &amp; Proceed
          </Button>
        </form>
      </main>
    </PageShell>
  );
}
