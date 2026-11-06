import type {
  RazorpayCheckoutOptions,
  RazorpayCheckoutResult,
  RazorpayConstructor,
  RazorpayFailure,
  RazorpayPaymentSuccess,
} from "./types";

const CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise: Promise<void> | null = null;

function loadCheckoutScript() {
  if (typeof window === "undefined")
    return Promise.reject(new Error("Razorpay Checkout requires a browser."));
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SCRIPT}"]`);
    const script = existing ?? document.createElement("script");
    script.src = CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = () =>
      window.Razorpay ? resolve() : reject(new Error("Razorpay Checkout did not initialize."));
    script.onerror = () =>
      reject(new Error("Could not load Razorpay Checkout. Check your connection and try again."));
    if (!existing) document.head.appendChild(script);
  }).catch((error: unknown) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
}

export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions,
): Promise<RazorpayCheckoutResult> {
  await loadCheckoutScript();
  const Razorpay = window.Razorpay as RazorpayConstructor | undefined;
  if (!Razorpay) throw new Error("Razorpay Checkout is unavailable.");

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: RazorpayCheckoutResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const instance = new Razorpay({
      key: options.key,
      order_id: options.orderId,
      amount: options.amount,
      currency: options.currency ?? "INR",
      name: options.name,
      description: options.description,
      prefill: {
        ...(options.customerName ? { name: options.customerName } : {}),
        ...(options.customerEmail ? { email: options.customerEmail } : {}),
        ...(options.customerPhone ? { contact: options.customerPhone } : {}),
      },
      ...(options.notes ? { notes: options.notes } : {}),
      theme: { color: "#0b2a55" },
      modal: { ondismiss: () => finish({ type: "dismissed" }) },
      handler: (payment: RazorpayPaymentSuccess) => finish({ type: "success", payment }),
    });

    instance.on("payment.failed", (response: { error: RazorpayFailure }) =>
      finish({ type: "failed", error: response.error }),
    );
    instance.open();
  });
}
