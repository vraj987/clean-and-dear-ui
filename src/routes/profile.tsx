import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgePercent,
  ClipboardCheck,
  FileText,
  Package,
  Phone,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  clearSavedAccountData,
  accountTypeLabel,
  logoutSavedSession,
  readAuthSession,
  registerCustomer,
  requestLoginOtp,
  saveAuthSession,
  updateCustomerProfile,
  updateSavedAuthAccount,
  verifyLoginOtp,
  type AuthSession,
} from "@/services/api/auth";
import { getCities, getStates, type CityRecord, type StateRecord } from "@/services/api/catalog";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — BytePe" },
      { name: "description", content: "Access your BytePe profile and order history." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profilePincode, setProfilePincode] = useState("");
  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");
  const [states, setStates] = useState<StateRecord[]>([]);
  const [cities, setCities] = useState<CityRecord[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const saved = readAuthSession();
    setSession(saved);
    if (saved) loadProfileFields(saved);
    void getStates()
      .then(setStates)
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    document.title = session
      ? "My Profile — BytePe"
      : `${mode === "login" ? "Login" : "Register"} — BytePe`;
  }, [mode, session]);
  useEffect(() => {
    if (!stateId) {
      setCities([]);
      setCitiesLoading(false);
      return;
    }
    let active = true;
    setCities([]);
    setCitiesLoading(true);
    void getCities(stateId)
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
  }, [stateId]);

  function selectState(value: string) {
    if (value !== stateId) {
      setCityId("");
    }
    setStateId(value);
  }
  function selectCity(value: string) {
    setCityId(value);
  }

  function changeMode(value: "login" | "register") {
    setMode(value);
    setOtpSent(false);
    setOtp("");
    setMessage("");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "register") {
        if (!stateId || !cityId) throw new Error("Choose a state and city from the suggestions.");
        const result = await registerCustomer({
          customer_mobile: mobile,
          customer_email: email,
          customer_name: name,
          state_id: stateId,
          city_id: cityId,
        });
        const account = result.accounts[0];
        if (account?.["customer_id"] && account["customer_auth_token"]) {
          const saved = saveAuthSession(account);
          setSession(saved);
          loadProfileFields(saved);
          return;
        }
        setMode("login");
        setOtpSent(false);
        setMessage(
          result.message ||
            "Registration completed. Continue with your mobile number to verify your account.",
        );
        return;
      }
      if (!otpSent) {
        await requestLoginOtp(mobile);
        setOtpSent(true);
        setMessage("OTP sent. Enter the 4-digit code to continue.");
      } else {
        if (otp.length !== 4) throw new Error("Enter the 4-digit OTP.");
        const result = await verifyLoginOtp(mobile, otp);
        const account = result.accounts[0];
        if (!account)
          throw new Error("The server verified the number but returned no account details.");
        const saved = saveAuthSession(account);
        setSession(saved);
        loadProfileFields(saved);
        setMessage("");
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    if (session) void logoutSavedSession(session).catch(() => undefined);
    else clearSavedAccountData();
    setSession(null);
    setMessage("You have been signed out.");
  }

  function loadProfileFields(accountSession: AuthSession) {
    setProfileName(accountSession.account["customer_name"] ?? accountSession.name);
    setProfileEmail(accountSession.account["customer_email"] ?? "");
    setProfileAddress(accountSession.account["customer_address"] ?? "");
    setProfilePincode(accountSession.account["customer_pincode"] ?? "");
    setStateId(accountSession.account["state_id"] ?? "");
    setCityId(accountSession.account["city_id"] ?? "");
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    if (!stateId || !cityId) {
      setProfileMessage("Choose a state and city from the suggestions.");
      return;
    }
    setSavingProfile(true);
    setProfileMessage("");
    try {
      const values = {
        customer_id: session.accountId,
        customer_name: profileName.trim(),
        customer_email: profileEmail.trim(),
        customer_address: profileAddress.trim(),
        customer_pincode: profilePincode.trim(),
        state_id: stateId,
        city_id: cityId,
      };
      const result = await updateCustomerProfile(values);
      const saved = updateSavedAuthAccount(values);
      if (saved) setSession(saved);
      setEditingProfile(false);
      setProfileMessage(result.message || "Your profile details have been updated.");
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "Could not update your profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  if (session)
    return (
      <PageShell>
        <main className="mx-auto max-w-[1100px] px-4 py-8 md:px-8">
          <section className="relative overflow-hidden rounded-3xl bg-logo p-6 text-logo-foreground sm:p-9">
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="grid size-14 place-items-center rounded-full bg-white/10">
                  <UserRound className="size-7" />
                </span>
                <div>
                  <p className="text-xs text-white/65">
                    Welcome{session.name ? `, ${session.name}` : " to BytePe"}
                  </p>
                  <h1 className="mt-1 font-display text-3xl">Your profile</h1>
                  <p className="mt-1 text-sm text-white/70">
                    {session.mobile} · {accountTypeLabel(session.accountType)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={logout}
              >
                Sign out
              </Button>
            </div>
            <p className="relative mt-5 max-w-xl text-sm text-white/70">
              Manage orders, member offers and account information in one simple place.
            </p>
          </section>
          <section className="mt-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl">Personal details</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep your contact and delivery details up to date.
                </p>
              </div>
              {!editingProfile && (
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    loadProfileFields(session);
                    setEditingProfile(true);
                    setProfileMessage("");
                  }}
                >
                  Edit details
                </Button>
              )}
            </div>
            {editingProfile ? (
              <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
                <label className="block text-xs font-semibold">
                  Full name
                  <Input
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </label>
                <label className="block text-xs font-semibold">
                  Email address
                  <Input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </label>
                <label className="block text-xs font-semibold sm:col-span-2">
                  Address
                  <Input
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </label>
                <label className="block text-xs font-semibold">
                  Pincode
                  <Input
                    inputMode="numeric"
                    value={profilePincode}
                    onChange={(e) =>
                      setProfilePincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="mt-1.5 h-11"
                  />
                </label>
                <label className="block text-xs font-semibold">
                  State
                  <SearchableSelect
                    options={states.map((state) => ({
                      value: state.state_id,
                      label: state.state_name,
                    }))}
                    value={stateId}
                    onValueChange={selectState}
                    placeholder="Search your state"
                    className="mt-1.5"
                  />
                </label>
                <label className="block text-xs font-semibold">
                  City
                  <SearchableSelect
                    options={cities.map((city) => ({
                      value: city.city_id,
                      label: city.city_name,
                    }))}
                    value={cityId}
                    onValueChange={selectCity}
                    disabled={!stateId}
                    loading={citiesLoading}
                    placeholder="Search your city"
                    className="mt-1.5"
                  />
                </label>
                {profileMessage && (
                  <p
                    role="status"
                    className="rounded-lg bg-muted p-3 text-sm text-muted-foreground sm:col-span-2"
                  >
                    {profileMessage}
                  </p>
                )}
                <div className="flex gap-3 sm:col-span-2">
                  <Button type="submit" disabled={savingProfile} className="rounded-full">
                    {savingProfile ? "Saving…" : "Save changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      setEditingProfile(false);
                      loadProfileFields(session);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Name</span>
                  <br />
                  <b>{session.account["customer_name"] || session.name || "Not provided"}</b>
                </p>
                <p>
                  <span className="text-muted-foreground">Mobile</span>
                  <br />
                  <b>{session.mobile || "Not provided"}</b>
                </p>
                <p>
                  <span className="text-muted-foreground">Email</span>
                  <br />
                  <b>{session.account["customer_email"] || "Not provided"}</b>
                </p>
                <p>
                  <span className="text-muted-foreground">Address</span>
                  <br />
                  <b>{session.account["customer_address"] || "Not provided"}</b>
                </p>
                <p>
                  <span className="text-muted-foreground">Pincode</span>
                  <br />
                  <b>{session.account["customer_pincode"] || "Not provided"}</b>
                </p>
              </div>
            )}
            {!editingProfile && profileMessage && (
              <p role="status" className="mt-4 text-sm text-primary">
                {profileMessage}
              </p>
            )}
          </section>
          <div className="mt-7 grid gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {[
              [Package, "My Orders", "Track deliveries and see order details", "/orders"],
              [BadgePercent, "Coupon Code", "See available member offers", "coupons"],
              [FileText, "Terms & Conditions", "Read the terms for your plans", "terms"],
              [
                WalletCards,
                "My Subscription",
                "Review your plan and upgrade options",
                "/subscription",
              ],
            ].map(([Icon, title, description, destination]) => {
              const I = Icon as typeof Package;
              const card = (
                <>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                    <I className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1 sm:block">
                    <h2 className="font-semibold sm:mt-4">{title as string}</h2>
                    <p className="mt-1 hidden text-xs leading-relaxed text-muted-foreground sm:block">
                      {description as string}
                    </p>
                    <span className="mt-4 hidden items-center gap-1 text-xs font-semibold text-primary sm:inline-flex">
                      Open <ArrowRight className="size-3" />
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground sm:hidden" />
                </>
              );
              const cls =
                "group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card sm:block sm:p-5";
              return destination === "coupons" ? (
                <button
                  key={title as string}
                  onClick={() => setShowCoupons((open) => !open)}
                  className={cls}
                >
                  {card}
                </button>
              ) : destination === "terms" ? (
                <a key={title as string} href="#terms" className={cls}>
                  {card}
                </a>
              ) : (
                <Link
                  key={title as string}
                  to={destination as "/orders" | "/subscription"}
                  className={cls}
                >
                  {card}
                </Link>
              );
            })}
          </div>
          {session.accountType === "employee" && (
            <Link
              to="/inspection"
              className="group mt-4 flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary/40 sm:mt-5 sm:p-5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                <ClipboardCheck className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <h2 className="font-semibold">Inspection</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Visit customers and complete device inspections.
                </p>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          )}
          {showCoupons && (
            <section className="mt-5 rounded-2xl border border-dashed border-primary/50 bg-primary-soft/50 p-5">
              <h2 className="font-display text-2xl">Your member offers</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-background p-4">
                  <b className="text-primary">BYTEPE2500</b>
                  <p className="mt-1">₹2,500 off select devices</p>
                </div>
                <div className="rounded-xl bg-background p-4">
                  <b className="text-primary">FREESHIP</b>
                  <p className="mt-1">Free delivery on your next upgrade</p>
                </div>
              </div>
            </section>
          )}
          <section className="mt-5 rounded-2xl border border-border p-5" id="terms">
            <h2 className="flex items-center gap-2 font-display text-xl">
              <ShieldCheck className="size-5 text-primary" />
              Account information
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your verified profile details are saved on this device to help prefill billing and
              checkout forms.
            </p>
            <Link
              to="/subscription"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              Explore subscription options <ArrowRight className="size-4" />
            </Link>
          </section>
        </main>
      </PageShell>
    );

  return (
    <PageShell>
      <main className="mx-auto grid min-h-[70vh] max-w-[1100px] items-center gap-7 px-4 py-6 sm:gap-10 sm:py-10 md:grid-cols-2 md:px-8">
        <section className="hidden md:block">
          <span className="grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
            <UserRound className="size-7" />
          </span>
          <h1 className="mt-5 max-w-md font-display text-5xl">
            Your tech journey, all in one place.
          </h1>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Track subscriptions, check delivery progress and discover your next upgrade.
          </p>
        </section>
        <section className="mx-auto w-full max-w-md rounded-[28px] border border-border bg-card p-6 shadow-card transition-shadow duration-300 hover:shadow-xl sm:p-9">
          <div className="mb-5 flex items-center gap-3 md:hidden">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
              <UserRound className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Welcome to BytePe</p>
              <p className="font-display text-xl">Your account</p>
            </div>
          </div>
          <div className="grid grid-cols-2 rounded-2xl bg-muted p-1.5">
            <button
              type="button"
              onClick={() => changeMode("login")}
              className={`rounded-xl py-2.5 text-sm font-semibold ${mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => changeMode("register")}
              className={`rounded-xl py-2.5 text-sm font-semibold ${mode === "register" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              Register
            </button>
          </div>
          <h2 className="mt-6 font-display text-3xl">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Verify your mobile number to continue."
              : "Add your details to register."}
          </p>
          <form className="mt-5 space-y-4" onSubmit={submit}>
            {mode === "register" && (
              <>
                <label className="block text-xs font-semibold">
                  Full name
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="mt-1.5 h-11"
                  />
                </label>
                <label className="block text-xs font-semibold">
                  Email address
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1.5 h-11"
                  />
                </label>
              </>
            )}
            <label className="block text-xs font-semibold">
              Mobile number
              <span className="mt-1.5 flex items-center gap-2 rounded-md border border-border px-3 focus-within:ring-2 focus-within:ring-ring">
                <Phone className="size-4 text-muted-foreground" />
                <Input
                  required
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className="h-11 border-0 px-0 shadow-none focus-visible:ring-0"
                />
              </span>
            </label>
            {mode === "register" && (
              <>
                <label className="block text-xs font-semibold">
                  State
                  <SearchableSelect
                    options={states.map((state) => ({
                      value: state.state_id,
                      label: state.state_name,
                    }))}
                    value={stateId}
                    onValueChange={selectState}
                    placeholder="Search your state"
                    className="mt-1.5"
                  />
                </label>
                <label className="block text-xs font-semibold">
                  City
                  <SearchableSelect
                    options={cities.map((city) => ({ value: city.city_id, label: city.city_name }))}
                    value={cityId}
                    onValueChange={selectCity}
                    disabled={!stateId}
                    loading={citiesLoading}
                    placeholder="Search your city"
                    className="mt-1.5"
                  />
                </label>
              </>
            )}
            {otpSent && <OtpCodeInput otp={otp} setOtp={setOtp} refs={otpRefs} mobile={mobile} />}
            {message && (
              <p
                role="status"
                className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground"
              >
                {message}
              </p>
            )}
            <Button
              disabled={busy}
              className="h-12 w-full rounded-xl text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              {busy
                ? "Please wait…"
                : mode === "register"
                  ? "Create account"
                  : otpSent
                    ? "Verify OTP"
                    : "Send OTP"}
              <ArrowRight className="size-4" />
            </Button>
          </form>
          <div className="mt-5 border-t border-border pt-5">
            <Button asChild variant="outline" className="h-12 w-full rounded-xl">
              <Link to="/orders">
                <Package className="size-4" />
                View orders
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
            An OTP is sent to your mobile number to securely verify your account.
          </p>
        </section>
      </main>
    </PageShell>
  );
}

function OtpCodeInput({
  otp,
  setOtp,
  refs,
  mobile,
}: {
  otp: string;
  setOtp: (value: string) => void;
  refs: React.MutableRefObject<Array<HTMLInputElement | null>>;
  mobile: string;
}) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  function apply(value: string) {
    const next = value.replace(/\D/g, "").slice(0, 4);
    setDigits(Array.from({ length: 4 }, (_, index) => next[index] ?? ""));
    setOtp(next);
    refs.current[Math.min(next.length, 3)]?.focus();
  }
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold">Enter the 4-digit OTP sent to {mobile}</legend>
      <div className="flex gap-3">
        {digits.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            value={digit}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(-1);
              const next = digits.slice();
              next[index] = d;
              setDigits(next);
              setOtp(next.join(""));
              if (d && index < 3) refs.current[index + 1]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digit && index > 0) refs.current[index - 1]?.focus();
              if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
              if (e.key === "ArrowRight" && index < 3) refs.current[index + 1]?.focus();
            }}
            onPaste={(e) => {
              e.preventDefault();
              apply(e.clipboardData.getData("text"));
            }}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={`OTP digit ${index + 1}`}
            className="size-12 rounded-xl p-0 text-center text-lg font-bold shadow-sm"
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        For local testing, use the OTP issued by the account service.
      </p>
    </fieldset>
  );
}
