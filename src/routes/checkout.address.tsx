import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LocateFixed } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { PageShell, rememberAuthReturnPath } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ApiStatusError } from "@/services/api/client";
import {
  checkSavedSession,
  clearSavedAccountData,
  readAuthSession,
  type AuthSession,
} from "@/services/api/auth";
import { getCities, getStates, type CityRecord, type StateRecord } from "@/services/api/catalog";

export const Route = createFileRoute("/checkout/address")({
  head: () => ({
    meta: [
      { title: "Shipping Address — Kimaat Lock" },
      { name: "description", content: "Enter your delivery address for your Kimaat Lock order." },
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
  pincode: string;
  state_id: string;
  city_id: string;
  remarks: string;
};
function normalizePlaceName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(district|city|taluka|taluk|tehsil)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function matchPlace<T extends { state_name: string }>(places: T[], name: string) {
  const normalized = normalizePlaceName(name);
  if (!normalized) return undefined;
  return places.find((place) => normalizePlaceName(place.state_name) === normalized);
}

function matchCity(places: CityRecord[], names: string[]) {
  const candidates = names.map(normalizePlaceName).filter(Boolean);
  for (const candidate of candidates) {
    const exact = places.find((place) => normalizePlaceName(place.city_name) === candidate);
    if (exact) return exact;
  }
  for (const candidate of candidates) {
    const similar = places.find((place) => {
      const city = normalizePlaceName(place.city_name);
      return city.length >= 4 && (candidate.startsWith(city) || city.startsWith(candidate));
    });
    if (similar) return similar;
  }
  return undefined;
}
const blank: Billing = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  pincode: "",
  state_id: "",
  city_id: "",
  remarks: "",
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
  const [locationLoading, setLocationLoading] = useState(false);
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
      const savedAddress = saved.account["customer_address"]?.trim() ?? "";
      const legacyCachedArea = (cached as Partial<Billing> & { area?: string }).area?.trim() ?? "";
      setForm({
        ...blank,
        ...cached,
        name: cached.name || saved.name,
        email: cached.email || saved.account["customer_email"] || "",
        mobile: saved.mobile,
        address: [cached.address, legacyCachedArea, savedAddress]
          .map((part) => part?.trim() ?? "")
          .filter(Boolean)
          .filter((part, index, list) => list.indexOf(part) === index)
          .join(", "),
        state_id: cached.state_id || saved.account["state_id"] || "",
        city_id: cached.city_id || saved.account["city_id"] || "",
        pincode: cached.pincode || saved.account["customer_pincode"] || "",
        remarks: cached.remarks || "",
      });
    } catch {
      const savedAddress = saved.account["customer_address"]?.trim() ?? "";
      setForm({
        ...blank,
        name: saved.name,
        email: saved.account["customer_email"] || "",
        mobile: saved.mobile,
        address: savedAddress,
        state_id: saved.account["state_id"] || "",
        city_id: saved.account["city_id"] || "",
        pincode: saved.account["customer_pincode"] || "",
      });
    }
    void getStates()
      .then((v) => {
        if (mounted) setStates(v);
      })
      .catch(() => undefined);
    void checkSavedSession(saved)
      .catch((error: unknown) => {
        if (error instanceof ApiStatusError) {
          if (String(error.status) === "3") {
            clearSavedAccountData();
            if (mounted) setSession(null);
          }
          if (mounted) setNotice(error.message);
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
  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setNotice("Location is not available in this browser. Enter your address below.");
      return;
    }

    setLocationLoading(true);
    setNotice("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void (async () => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=en&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`,
              { headers: { Accept: "application/json", "Accept-Language": "en" } },
            );
            if (!response.ok) throw new Error("Could not look up this location.");
            const data = (await response.json()) as {
              address?: Record<string, string | undefined>;
              display_name?: string;
            };
            const address = data.address ?? {};
            const availableStates = states.length ? states : await getStates();
            if (!states.length) setStates(availableStates);
            const stateName = address["state"] ?? "";
            const matchedState = matchPlace(availableStates, stateName);
            let matchedCity: CityRecord | undefined;
            if (matchedState) {
              const availableCities = await getCities(matchedState.state_id);
              setCities(availableCities);
              matchedCity = matchCity(availableCities, [
                address["city"] ?? "",
                address["town"] ?? "",
                address["village"] ?? "",
                address["municipality"] ?? "",
                address["suburb"] ?? "",
                address["county"] ?? "",
                address["state_district"] ?? "",
              ]);
            }
            const addressLine = [
              address["house_number"],
              address["building"],
              address["road"],
              address["residential"],
              address["neighbourhood"],
              address["suburb"],
              address["quarter"],
              address["hamlet"],
              address["village"],
            ]
              .filter(Boolean)
              .filter((part, index, values) => values.indexOf(part) === index)
              .join(", ");
            setForm((current) => ({
              ...current,
              address: addressLine || data.display_name || current.address,
              pincode: address["postcode"] ?? "",
              state_id: matchedState?.state_id ?? "",
              city_id: matchedCity?.city_id ?? "",
            }));
            if (!matchedState || !matchedCity) {
              setNotice(
                "Location found, but we could not match the state or city with the delivery list. Please select them and verify the address before continuing.",
              );
            } else {
              setNotice(
                `${data.display_name ? `Address found: ${data.display_name}. ` : ""}Please review the address and fill in any missing building details.`,
              );
            }
          } catch {
            setNotice("We could not read the full address for this location. Please enter it below.");
          } finally {
            setLocationLoading(false);
          }
        })();
      },
      (error) => {
        setLocationLoading(false);
        setNotice(
          error.code === error.PERMISSION_DENIED
            ? "Location access was denied. Allow location access or enter your address below."
            : "Could not get your current location. Please enter your address below.",
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
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
            <Link to="/profile" onClick={rememberAuthReturnPath}>Continue to profile</Link>
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
        <Button
          type="button"
          variant="outline"
          className="mt-5 w-full rounded-full"
          onClick={() => void useCurrentLocation()}
          disabled={locationLoading}
        >
          <LocateFixed className="size-4 text-primary" />
          {locationLoading ? "Finding your address…" : "Use my current location"}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Location lookup uses OpenStreetMap. Please review the address before continuing.
        </p>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={proceed}>
          {(
            [
              ["Full name", "name", "text"],
              ["Mobile number", "mobile", "tel"],
              ["Email address", "email", "email"],
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
                readOnly={key === "mobile"}
                aria-readonly={key === "mobile"}
                className={`mt-1 h-11 ${key === "mobile" ? "cursor-not-allowed bg-muted text-muted-foreground" : ""}`}
              />
            </label>
          ))}
          <label className="block text-xs md:col-span-2">
            Address <b className="text-primary">*</b>
            <Input
              required
              type="text"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="mt-1 h-11"
            />
          </label>
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
          <label className="block text-xs">
            Pincode <b className="text-primary">*</b>
            <Input
              required
              type="text"
              inputMode="numeric"
              value={form.pincode}
              onChange={(e) => update("pincode", e.target.value)}
              className="mt-1 h-11"
            />
          </label>
          <label className="block text-xs md:col-span-2">
            Delivery instructions <span className="text-muted-foreground">(optional)</span>
            <textarea
              value={form.remarks}
              onChange={(e) => update("remarks", e.target.value)}
              rows={3}
              className="mt-1 w-full resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Add delivery instructions, if any"
            />
          </label>
          <Button type="submit" className="mt-4 w-full rounded-full md:col-span-2">
            Save &amp; Proceed
          </Button>
        </form>
      </main>
    </PageShell>
  );
}
