export type RazorpayPaymentSuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayFailure = {
  code?: string;
  description?: string;
  reason?: string;
  source?: string;
  step?: string;
  metadata?: {
    order_id?: string;
    payment_id?: string;
  };
};

export type RazorpayCheckoutResult =
  | { type: "success"; payment: RazorpayPaymentSuccess }
  | { type: "failed"; error: RazorpayFailure }
  | { type: "dismissed" };

export type RazorpayCheckoutOptions = {
  key: string;
  orderId: string;
  amount: number;
  currency?: string;
  name: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: Record<string, string>;
};

type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  handler: (payment: RazorpayPaymentSuccess) => void;
};

export type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", listener: (response: { error: RazorpayFailure }) => void) => void;
};

export type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}
