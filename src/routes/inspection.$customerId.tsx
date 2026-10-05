import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  LoaderCircle,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from "react";
import { PageShell } from "@/components/shop/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { catalog } from "@/lib/catalog";
import {
  accessoryChecks,
  damageChecks,
  inspectionCustomers,
  inspectionStatusOptions,
  physicalChecks,
  repairChecks,
  type InspectionStatus,
} from "@/lib/inspection";
import { readAuthSession, type AuthSession } from "@/services/api/auth";

export const Route = createFileRoute("/inspection/$customerId")({
  head: () => ({
    meta: [
      { title: "Device Inspection — BytePe" },
      { name: "description", content: "Complete a customer device inspection." },
    ],
  }),
  component: InspectionDetailPage,
});

type Eligibility = "eligible" | "not-eligible" | null;

function InspectionDetailPage() {
  const { customerId } = Route.useParams();
  const customer = inspectionCustomers.find((item) => item.id === customerId);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [verifiedDevice, setVerifiedDevice] = useState(false);
  const [serialChecked, setSerialChecked] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, InspectionStatus>>({});
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [calculating, setCalculating] = useState(false);
  const [stage, setStage] = useState<
    "inspection" | "valuation" | "payment" | "customer-otp" | "agreement" | "handover" | "waiting" | "cancelled" | "completed"
  >("inspection");
  const [eligibility, setEligibility] = useState<Eligibility>(null);
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [selectedPhoneSlug, setSelectedPhoneSlug] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash" | "">("");
  const [customerOtp, setCustomerOtp] = useState("");
  const [signatureDrawn, setSignatureDrawn] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [activationStatus, setActivationStatus] = useState("");
  const [newPhoneHandedOver, setNewPhoneHandedOver] = useState(false);
  const [oldPhoneCollected, setOldPhoneCollected] = useState(false);
  const timerRef = useRef<number | null>(null);
  const availablePhones = catalog.filter((product) => product.category === "Mobile");
  const selectedPhone = availablePhones.find((product) => product.slug === selectedPhoneSlug);
  const newPhonePrice = selectedPhone
    ? Number(selectedPhone.price.replace(/[^\d]/g, ""))
    : 0;
  const oldPhoneValue = 45000;
  const customerPayable = Math.max(newPhonePrice - oldPhoneValue, 0);

  useEffect(() => {
    setSession(readAuthSession());
    setReady(true);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  function setStatus(item: string, value: InspectionStatus) {
    setStatuses((current) => ({ ...current, [item]: value }));
  }

  function submitInspection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCalculating(true);
    timerRef.current = window.setTimeout(() => {
      setCalculating(false);
      setStage("valuation");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 5000);
  }

  if (!ready) return null;
  if (session?.accountType !== "employee") {
    return (
      <PageShell>
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <ShieldCheck className="mx-auto size-10 text-primary" />
          <h1 className="mt-4 font-display text-3xl">Employee access only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with an employee account to complete inspections.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/profile">Go to profile</Link>
          </Button>
        </main>
      </PageShell>
    );
  }
  if (!customer) {
    return (
      <PageShell>
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-display text-3xl">Customer visit not found</h1>
          <Button asChild variant="outline" className="mt-6 rounded-full">
            <Link to="/inspection">Back to inspections</Link>
          </Button>
        </main>
      </PageShell>
    );
  }

  if (stage === "waiting") {
    return (
      <PageShell>
        <main className="mx-auto flex min-h-[65vh] max-w-2xl items-center px-4 py-10">
          <section className="w-full rounded-3xl border border-border bg-card p-6 text-center shadow-card sm:p-10">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="size-8" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[.16em] text-primary">
              Inspection submitted
            </p>
            <h1 className="mt-2 font-display text-3xl">Waiting for admin approval</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The inspection for {customer.name} has been added to your list. You can check back
              here after an administrator reviews the device.
            </p>
            <div className="mt-6 rounded-2xl bg-muted/70 p-4 text-left">
              <p className="text-xs text-muted-foreground">System-generated Kavach value</p>
              <p className="mt-1 font-display text-3xl font-semibold">₹45,000</p>
              <p className="mt-2 text-sm">
                Eligibility: <b>{eligibility === "eligible" ? "Eligible" : "Not eligible"}</b>
              </p>
              {eligibility === "not-eligible" && reason && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Reason: {reason === "Other" ? otherReason : reason}
                </p>
              )}
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900">
                <span className="size-2 rounded-full bg-amber-600" /> Pending review
              </p>
            </div>
            <Button asChild className="mt-6 w-full rounded-full sm:w-auto">
              <Link to="/inspection">
                Go to inspection list <ArrowRight className="size-4" />
              </Link>
            </Button>
          </section>
        </main>
      </PageShell>
    );
  }

  if (stage === "completed") {
    return (
      <PageShell>
        <main className="mx-auto flex min-h-[65vh] max-w-2xl items-center px-4 py-10">
          <section className="w-full rounded-3xl border border-emerald-200 bg-card p-6 text-center shadow-card sm:p-10">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="size-8" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[.16em] text-emerald-700">
              Transaction completed
            </p>
            <h1 className="mt-2 font-display text-3xl">Phone exchange complete</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Payment is verified, the customer OTP and digital agreement are complete, the new
              phone has been handed over, and the old device has been collected.
            </p>
            <div className="mt-6 rounded-2xl bg-muted/70 p-4 text-left">
              <p className="font-semibold">{selectedPhone?.brand} {selectedPhone?.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">New phone: ₹{newPhonePrice.toLocaleString("en-IN")}</p>
              <p className="text-sm text-muted-foreground">Old phone value: ₹{oldPhoneValue.toLocaleString("en-IN")}</p>
              <p className="mt-2 text-lg font-bold">Customer paid: ₹{customerPayable.toLocaleString("en-IN")}</p>
              <p className="mt-1 text-xs text-muted-foreground">Payment method: {paymentMethod === "online" ? "Online" : "Cash"}</p>
            </div>
            <Button asChild className="mt-6 w-full rounded-full sm:w-auto">
              <Link to="/inspection">Return to inspection list <ArrowRight className="size-4" /></Link>
            </Button>
          </section>
        </main>
      </PageShell>
    );
  }

  if (stage === "cancelled") {
    return (
      <PageShell>
        <main className="mx-auto flex min-h-[65vh] max-w-2xl items-center px-4 py-10">
          <section className="w-full rounded-3xl border border-border bg-card p-6 text-center shadow-card sm:p-10">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
              <Check className="size-8" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">Exchange cancelled</p>
            <h1 className="mt-2 font-display text-3xl">Customer declined the exchange</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              No payment or handover was recorded. The inspection can be reopened from the list if the customer wants to continue later.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/inspection">Return to inspection list <ArrowRight className="size-4" /></Link>
            </Button>
          </section>
        </main>
      </PageShell>
    );
  }

  if (stage === "payment" || stage === "customer-otp" || stage === "agreement" || stage === "handover") {
    const steps = ["Payment", "Customer OTP", "Agreement", "Handover"] as const;
    const activeStep =
      stage === "payment" ? 0 : stage === "customer-otp" ? 1 : stage === "agreement" ? 2 : 3;
    return (
      <PageShell>
        <main className="mx-auto min-h-[65vh] max-w-[800px] px-4 py-8 md:px-8">
          <button
            type="button"
            onClick={() => setStage("valuation")}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Kavach value review
          </button>
          <section className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-card sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">Phone exchange</p>
            <h1 className="mt-1 font-display text-3xl">
              {stage === "payment" ? "Collect customer payment" : stage === "customer-otp" ? "Verify customer OTP" : stage === "agreement" ? "Digital agreement" : "Device handover"}
            </h1>
            <div className="mt-5 grid grid-cols-4 gap-2" aria-label="Exchange completion steps">
              {steps.map((step, index) => (
                <div key={step} className={`rounded-xl px-2 py-2 text-center text-[11px] font-semibold sm:text-xs ${index <= activeStep ? "bg-[#0F172A] text-white" : "bg-muted text-muted-foreground"}`}>
                  {step}
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-muted/70 p-4">
              <p className="font-semibold">{selectedPhone?.brand} {selectedPhone?.name}</p>
              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">New phone</p><b>₹{newPhonePrice.toLocaleString("en-IN")}</b></div>
                <div><p className="text-xs text-muted-foreground">Old phone</p><b>₹{oldPhoneValue.toLocaleString("en-IN")}</b></div>
                <div><p className="text-xs text-muted-foreground">Customer payable</p><b className="text-primary">₹{customerPayable.toLocaleString("en-IN")}</b></div>
              </div>
            </div>

            {stage === "payment" && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold">Choose how the customer pays</h2>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {(["online", "cash"] as const).map((method) => (
                    <button key={method} type="button" aria-pressed={paymentMethod === method} onClick={() => setPaymentMethod(method)} className={`min-h-12 rounded-xl border px-4 py-3 text-sm font-semibold capitalize ${paymentMethod === method ? "border-primary bg-primary-soft text-primary" : "border-border bg-background"}`}>
                      {method === "online" ? "Pay online" : "Pay by cash"}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Demo UI only: no payment is processed. Mark the payment verified to continue.</p>
                <Button disabled={!paymentMethod} className="mt-5 w-full rounded-full sm:w-auto" onClick={() => setStage("customer-otp")}>
                  Mark payment verified <CheckCircle2 className="size-4" />
                </Button>
                <Button variant="outline" className="mt-3 w-full rounded-full text-muted-foreground sm:ml-2 sm:mt-5 sm:w-auto" onClick={() => setStage("cancelled")}>
                  Customer declined · Cancel exchange
                </Button>
              </div>
            )}

            {stage === "customer-otp" && (
              <div className="mt-6">
                <label className="block max-w-sm text-sm font-semibold">
                  Enter the customer’s 4-digit confirmation OTP
                  <Input value={customerOtp} onChange={(event) => setCustomerOtp(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" maxLength={4} placeholder="••••" className="mt-2 h-12 text-center text-xl tracking-[.6em]" />
                </label>
                <p className="mt-2 text-xs text-muted-foreground">Preview only: any 4 digits confirm the customer handover.</p>
                <Button disabled={customerOtp.length !== 4} className="mt-5 w-full rounded-full sm:w-auto" onClick={() => setStage("agreement")}>
                  Verify OTP <CheckCircle2 className="size-4" />
                </Button>
              </div>
            )}

            {stage === "agreement" && (
              <div className="mt-6">
                <div className="rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed">
                  <h2 className="font-semibold">Digital device exchange agreement</h2>
                  <p className="mt-2 text-muted-foreground">The customer confirms the old device details and Kavach value shown above, pays the balance for the selected new phone, and agrees to hand over the inspected device after receiving the new phone.</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold">Customer signature</p>
                  <p className="mt-1 text-xs text-muted-foreground">Ask the customer to sign in the box using a finger or stylus.</p>
                  <SignaturePad onChange={setSignatureDrawn} />
                </div>
                <label className="mt-4 flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={agreementAccepted} onChange={(event) => setAgreementAccepted(event.target.checked)} className="mt-0.5 size-4 accent-blue-600" />
                  <span>Customer has reviewed and signed the digital agreement.</span>
                </label>
                <Button disabled={!signatureDrawn || !agreementAccepted} className="mt-5 w-full rounded-full sm:w-auto" onClick={() => setStage("handover")}>
                  Confirm agreement <ArrowRight className="size-4" />
                </Button>
              </div>
            )}

            {stage === "handover" && (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-muted-foreground">Confirm both devices have changed hands to complete this transaction.</p>
                <label className="flex items-center gap-3 rounded-xl border border-border p-4 text-sm font-medium">
                  <input type="checkbox" checked={newPhoneHandedOver} onChange={(event) => setNewPhoneHandedOver(event.target.checked)} className="size-4 accent-blue-600" />
                  New phone handed over to {customer.name}
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-border p-4 text-sm font-medium">
                  <input type="checkbox" checked={oldPhoneCollected} onChange={(event) => setOldPhoneCollected(event.target.checked)} className="size-4 accent-blue-600" />
                  Old phone collected from {customer.name}
                </label>
                <Button disabled={!newPhoneHandedOver || !oldPhoneCollected} className="mt-2 w-full rounded-full sm:w-auto" onClick={() => setStage("completed")}>
                  Complete transaction <CheckCircle2 className="size-4" />
                </Button>
              </div>
            )}
          </section>
        </main>
      </PageShell>
    );
  }

  if (stage === "valuation") {
    const canSubmit =
      eligibility === "eligible" ||
      (eligibility === "not-eligible" &&
        Boolean(reason) &&
        (reason !== "Other" || Boolean(otherReason.trim())));

    return (
      <PageShell>
        <main className="mx-auto min-h-[65vh] max-w-[800px] px-4 py-8 md:px-8">
          <Link
            to="/inspection"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Inspection list
          </Link>
          <section className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-card sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">
                  Inspection complete
                </p>
                <h1 className="font-display text-2xl">Kavach value review</h1>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-[#0F172A] p-5 text-white sm:p-7">
              <p className="text-sm text-white/70">System-generated Kavach value</p>
              <p className="mt-1 font-display text-4xl font-bold">₹45,000</p>
              <p className="mt-2 text-sm text-white/75">
                {customer.brand} {customer.model} · {customer.variant}
              </p>
            </div>
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold">Is this device eligible for Kavach?</legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {([
                  ["eligible", "Eligible"],
                  ["not-eligible", "Not eligible"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={eligibility === value}
                    onClick={() => {
                      setEligibility(value);
                      if (value === "not-eligible") setSelectedPhoneSlug("");
                    }}
                    className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                      eligibility === value
                        ? value === "eligible"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-rose-500 bg-rose-50 text-rose-800"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {eligibility === value && <Check className="size-4" />}
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            {eligibility === "eligible" && (
              <section className="mt-5 rounded-2xl border border-border bg-muted/30 p-4 sm:p-5">
                <label className="block text-sm font-semibold" htmlFor="replacement-phone">
                  Would the customer like to purchase a new phone?
                  <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
                </label>
                <div className="mt-2">
                  <SearchableDropdown
                    value={selectedPhoneSlug}
                    placeholder="No new phone — submit for admin approval"
                    options={[
                      { value: "", label: "No new phone — submit for admin approval" },
                      ...availablePhones.map((phone) => ({
                        value: phone.slug,
                        label: `${phone.brand} ${phone.name} · ${phone.storage} · ${phone.price}`,
                      })),
                    ]}
                    onChange={setSelectedPhoneSlug}
                  />
                </div>
                {selectedPhone && (
                  <div className="mt-4 grid gap-3 rounded-xl bg-background p-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Old phone value</p>
                      <p className="mt-1 font-semibold">₹{oldPhoneValue.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">New phone price</p>
                      <p className="mt-1 font-semibold">₹{newPhonePrice.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs text-muted-foreground">Customer payable</p>
                      <p className="mt-1 font-display text-xl font-bold text-primary">
                        ₹{customerPayable.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                )}
              </section>
            )}
            {eligibility === "not-eligible" && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold sm:col-span-2">
                  Reason for ineligibility
                  <div className="mt-1.5 font-normal">
                    <SearchableDropdown
                      value={reason}
                      placeholder="Choose a reason"
                      options={[
                        { value: "", label: "Choose a reason" },
                        ...["Display damage", "Device repaired", "Original invoice unavailable", "IMEI or serial number mismatch", "Water damage", "Other"].map((item) => ({ value: item, label: item })),
                      ]}
                      onChange={setReason}
                    />
                  </div>
                </label>
                {reason === "Other" && (
                  <label className="text-sm font-semibold sm:col-span-2">
                    Add a reason
                    <Input
                      required
                      value={otherReason}
                      onChange={(event) => setOtherReason(event.target.value)}
                      className="mt-1.5 h-12"
                      placeholder="Describe why this device is not eligible"
                    />
                  </label>
                )}
              </div>
            )}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setStage("inspection")}
              >
                Back to inspection
              </Button>
              <Button
                type="button"
                disabled={!canSubmit}
                className="rounded-full"
                onClick={() => setStage(eligibility === "eligible" && selectedPhone ? "payment" : "waiting")}
              >
                {eligibility === "eligible" && selectedPhone
                  ? "Continue to payment"
                  : "Submit for admin approval"} <ArrowRight className="size-4" />
              </Button>
            </div>
          </section>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="mx-auto max-w-[1100px] px-4 py-7 md:px-8">
        <Link
          to="/inspection"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Inspection list
        </Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4 rounded-3xl bg-[#0F172A] p-5 text-white sm:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-white/60">
              Device inspection
            </p>
            <h1 className="mt-1 font-display text-3xl">{customer.name}</h1>
            <p className="mt-2 text-sm text-white/75">
              {customer.brand} {customer.model} · {customer.variant}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-full border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              <a href={`tel:${customer.mobile.replace(/\D/g, "")}`}>
                <Phone className="size-4" /> Call customer
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${customer.address}, ${customer.city}`)}`}
                target="_blank"
                rel="noreferrer"
              >
                <MapPin className="size-4" /> Directions
              </a>
            </Button>
          </div>
        </div>

        <form className="mt-6 space-y-5" onSubmit={submitInspection}>
          <InspectionStep number="1" title="Device verification" description="Confirm the device details and identifiers before inspection.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DeviceDetail label="Brand" value={customer.brand} />
              <DeviceDetail label="Model" value={customer.model} />
              <DeviceDetail label="Variant" value={customer.variant} />
              <DeviceDetail label="Device details" value={customer.deviceDetails} />
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3.5">
              <input
                type="checkbox"
                checked={verifiedDevice}
                onChange={(event) => setVerifiedDevice(event.target.checked)}
                className="mt-0.5 size-4 accent-blue-600"
              />
              <span>
                <span className="block text-sm font-semibold">Device details verified</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Brand, model, variant, and device details match the customer’s phone.
                </span>
              </span>
              {verifiedDevice && <CheckCircle2 className="ml-auto size-5 shrink-0 text-blue-600" />}
            </label>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="IMEI 1" placeholder="Enter 15-digit IMEI 1" />
              <Field label="IMEI 2" placeholder="Enter 15-digit IMEI 2" />
              <div className="flex items-end gap-3 sm:col-span-2">
                <Field label="Serial number" placeholder="Enter device serial number" />
                <Button
                  type="button"
                  variant="outline"
                  className={`mb-0.5 shrink-0 rounded-full ${serialChecked ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:text-white" : ""}`}
                  onClick={() => setSerialChecked((value) => !value)}
                >
                  {serialChecked ? <CheckCircle2 className="size-4" /> : <FileCheck2 className="size-4" />}
                  {serialChecked ? "Verified" : "Mark checked"}
                </Button>
              </div>
              <label className="text-sm font-semibold">
                Device activation status
                <div className="mt-1.5 font-normal">
                  <SearchableDropdown
                    value={activationStatus}
                    placeholder="Select activation status"
                    options={[
                      { value: "", label: "Select activation status" },
                      ...["Activated", "Not activated", "Unable to verify"].map((item) => ({ value: item, label: item })),
                    ]}
                    onChange={setActivationStatus}
                  />
                </div>
              </label>
              <Field label="Invoice number" placeholder="Enter invoice number" />
              <Field label="Invoice date" type="date" />
            </div>
          </InspectionStep>

          <InspectionStep number="2" title="Physical inspection" description="Mark the condition of each device component. Add photos when a condition needs evidence.">
            <InspectionChecks items={physicalChecks} statuses={statuses} setStatus={setStatus} photos={photos} setPhotos={setPhotos} />
            <label className="mt-4 block text-sm font-semibold">
              Battery health
              <span className="mt-1.5 flex h-11 items-center rounded-xl border border-border bg-background px-3">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter battery health percentage"
                  className="h-10 border-0 px-0 shadow-none focus-visible:ring-0"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </span>
            </label>
          </InspectionStep>

          <InspectionStep number="3" title="Damage" description="Record visible damage and attach supporting photos where needed.">
            <InspectionChecks items={damageChecks} statuses={statuses} setStatus={setStatus} photos={photos} setPhotos={setPhotos} />
          </InspectionStep>

          <InspectionStep number="4" title="Repair history" description="Check whether parts have previously been repaired or replaced.">
            <InspectionChecks items={repairChecks} statuses={statuses} setStatus={setStatus} photos={photos} setPhotos={setPhotos} />
          </InspectionStep>

          <InspectionStep number="5" title="Accessories" description="Confirm included items and attach proof when available.">
            <InspectionChecks items={accessoryChecks} statuses={statuses} setStatus={setStatus} photos={photos} setPhotos={setPhotos} />
            <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background p-4 text-sm">
              <Camera className="size-5 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">Upload original invoice</span>
                <span className="block truncate text-xs text-muted-foreground">UI preview only · PDF or image</span>
              </span>
              <input type="file" accept="image/*,.pdf" className="sr-only" />
              <span className="text-xs font-semibold text-primary">Choose file</span>
            </label>
          </InspectionStep>

          {calculating ? (
            <div className="sticky bottom-4 flex items-center justify-center gap-3 rounded-2xl bg-[#0F172A] p-4 text-sm font-semibold text-white shadow-xl">
              <LoaderCircle className="size-5 animate-spin" /> Reviewing inspection and calculating Kavach value…
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-3 pb-5 sm:flex-row sm:justify-between">
              <Button asChild type="button" variant="outline" className="rounded-full">
                <Link to="/inspection">Back to inspection list</Link>
              </Button>
              <Button type="submit" className="rounded-full">
                Submit inspection <ArrowRight className="size-4" />
              </Button>
            </div>
          )}
        </form>
      </main>
    </PageShell>
  );
}

function SearchableDropdown({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedLabel = options.find((option) => option.value === value)?.label ?? "";
  const filtered = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  return (
    <div
      className="relative z-[999]"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
          setQuery("");
        }
      }}
    >
      <div className="flex h-12 items-center rounded-xl border border-border bg-white px-3 focus-within:border-primary">
        <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />
        <input
          value={open ? query : selectedLabel}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          aria-label={placeholder}
          aria-expanded={open}
          aria-autocomplete="list"
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm font-normal text-foreground outline-none placeholder:text-muted-foreground"
        />
        <ChevronDown className={`ml-2 size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div role="listbox" className="absolute left-0 right-0 top-[calc(100%+6px)] z-[1000] max-h-64 overflow-y-auto rounded-xl border border-border bg-white p-1.5 shadow-xl">
          {filtered.length ? filtered.map((option) => (
            <button
              key={option.value || "empty"}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
                setQuery("");
              }}
              className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm ${value === option.value ? "bg-primary-soft font-semibold text-primary" : "text-foreground hover:bg-muted"}`}
            >
              {option.label}
            </button>
          )) : (
            <p className="px-3 py-3 text-sm text-muted-foreground">No matching options</p>
          )}
        </div>
      )}
    </div>
  );
}

function SignaturePad({ onChange }: { onChange: (signed: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
    };
  }

  function startDrawing(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const position = point(event);
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !position) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    drawing.current = true;
    context.beginPath();
    context.moveTo(position.x, position.y);
    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#1F2A44";
    onChange(true);
  }

  function draw(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const context = canvasRef.current?.getContext("2d");
    const position = point(event);
    if (!context || !position) return;
    event.preventDefault();
    context.lineTo(position.x, position.y);
    context.stroke();
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
    onChange(false);
  }

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-border bg-white">
      <canvas
        ref={canvasRef}
        width={900}
        height={220}
        aria-label="Draw customer signature here"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={() => { drawing.current = false; }}
        onPointerCancel={() => { drawing.current = false; }}
        className="block h-36 w-full touch-none cursor-crosshair sm:h-40"
      />
      <div className="flex items-center justify-between border-t border-border px-3 py-2">
        <span className="text-xs text-muted-foreground">Sign above with a finger or stylus</span>
        <button type="button" onClick={clearSignature} className="text-xs font-semibold text-primary">Clear</button>
      </div>
    </div>
  );
}

function InspectionStep({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">
          {number}
        </span>
        <div>
          <h2 className="font-display text-xl sm:text-2xl">{title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function DeviceDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-muted/70 p-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block min-w-0 text-sm font-semibold">
      {label}
      <Input type={type} placeholder={placeholder} className="mt-1.5 h-11 min-w-0 font-normal" />
    </label>
  );
}

function InspectionChecks({
  items,
  statuses,
  setStatus,
  photos,
  setPhotos,
}: {
  items: string[];
  statuses: Record<string, InspectionStatus>;
  setStatus: (item: string, value: InspectionStatus) => void;
  photos: Record<string, string>;
  setPhotos: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-background px-3 sm:px-4">
      {items.map((item, index) => {
        const key = item === "Battery health" && index === 0 ? "Battery health condition" : item;
        return (
          <div key={key} className="py-3">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium">{key}</p>
              <div className="flex flex-wrap gap-1.5">
                {inspectionStatusOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={statuses[key] === option}
                    onClick={() => setStatus(key, option)}
                    className={`min-h-8 rounded-full border px-3 text-xs font-semibold transition-colors ${
                      statuses[key] === option
                        ? option === "Pass"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : option === "Fail"
                            ? "border-rose-500 bg-rose-50 text-rose-800"
                            : "border-slate-500 bg-slate-100 text-slate-800"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary">
              <Camera className="size-3.5" />
              {photos[key] || "Add supporting photo"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const fileName = event.target.files?.[0]?.name;
                  if (fileName) setPhotos((current) => ({ ...current, [key]: fileName }));
                }}
              />
            </label>
          </div>
        );
      })}
    </div>
  );
}
