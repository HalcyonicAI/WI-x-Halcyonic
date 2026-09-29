"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import type { Customer, DemoSession, PaymentMethod } from "@/types/booking";
import { Button } from "@/components/ui/Button";
import { LockIcon } from "@/components/ui/icons";
import { api, ApiError } from "@/lib/client/api";
import { isValidEmail } from "@/lib/api/validate";
import { applyPaidOrder, applyPaymentFailure } from "@/lib/session/actions";
import { peekNextOrderNumber } from "@/lib/session/store";
import { BOOKING_PRICE_MYR } from "@/lib/usage/quota";
import { cn, formatMYR } from "@/lib/utils";

/** Demo customer — prefilled so the presenter can move quickly. Clearly fictional. */
const DEMO_CUSTOMER: Customer = {
  name: "Nur Aisyah Rahman",
  email: "aisyah.rahman@example.com",
  phone: "+60 12-345 6789",
};

const METHODS: { value: PaymentMethod; label: string; hint: string }[] = [
  { value: "fpx", label: "FPX Online Banking", hint: "After clicking “Pay now”, you would be redirected to your bank to complete payment." },
  { value: "card", label: "Credit / Debit Card", hint: "Card details are entered on Shopify's secure payment page. Card entry is disabled in this demo." },
  { value: "ewallet", label: "Touch 'n Go eWallet", hint: "You would approve the payment in your eWallet app." },
];

type FieldErrors = Partial<Record<"email" | "name", string>>;

function validate(c: Customer): FieldErrors {
  const e: FieldErrors = {};
  if (!c.email.trim()) e.email = "Enter an email so we can send your booking confirmation";
  else if (!isValidEmail(c.email)) e.email = "Enter an email address like name@example.com";
  if (!c.name.trim()) e.name = "Enter the name for this booking";
  return e;
}

export function CheckoutForm({ session }: { session: DemoSession }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer>(session.customer ?? DEMO_CUSTOMER);
  const [touched, setTouched] = useState<Partial<Record<keyof FieldErrors, boolean>>>({});
  const [method, setMethod] = useState<PaymentMethod>("fpx");
  const [status, setStatus] = useState<"idle" | "processing">("idle");
  const [declined, setDeclined] = useState<string | null>(
    session.lastError?.state === "PAYMENT_FAILED" ? session.lastError.message : null,
  );
  const errors = validate(customer);
  const visibleErrors: FieldErrors = {
    email: touched.email ? errors.email : undefined,
    name: touched.name ? errors.name : undefined,
  };

  async function pay(simulateDecline: boolean) {
    setTouched({ email: true, name: true });
    if (Object.keys(errors).length) {
      document.getElementById(errors.email ? "checkout-email" : "checkout-name")?.focus();
      return;
    }
    setStatus("processing");
    setDeclined(null);
    try {
      const res = await api.checkout({
        orderNumber: peekNextOrderNumber(),
        customer: { ...customer, name: customer.name.trim(), email: customer.email.trim() },
        paymentMethod: method,
        simulateDecline: simulateDecline || session.demo.failNextPayment,
      });
      applyPaidOrder({
        order: res.order,
        bookingId: res.bookingId,
        customer,
        generationLimit: res.generationLimit,
        tryOnLimit: res.tryOnLimit,
      });
      router.push("/ai-design/checkout/confirmed");
    } catch (err) {
      const message =
        err instanceof ApiError && err.code === "PAYMENT_FAILED"
          ? err.message
          : "We couldn't complete your payment. No charge was made — please try again.";
      applyPaymentFailure(message);
      setDeclined(message);
      setStatus("idle");
    }
  }

  const processing = status === "processing";

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void pay(false);
      }}
      className="space-y-9"
    >
      <p className="rounded-md bg-cream px-4 py-3 text-[13px] leading-relaxed">
        <span className="font-medium">Demo checkout.</span> This page simulates Shopify checkout for the approval review.
        No payment is taken and no real order is created.
      </p>

      <fieldset className="space-y-3">
        <legend className="mb-3 text-[21px] font-semibold">Contact</legend>
        <Field
          id="checkout-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={customer.email}
          error={visibleErrors.email}
          onChange={(v) => setCustomer((c) => ({ ...c, email: v }))}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        />
        <Field
          id="checkout-name"
          label="Full name"
          autoComplete="name"
          value={customer.name}
          error={visibleErrors.name}
          onChange={(v) => setCustomer((c) => ({ ...c, name: v }))}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
        />
        <Field
          id="checkout-phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          value={customer.phone ?? ""}
          onChange={(v) => setCustomer((c) => ({ ...c, phone: v }))}
        />
      </fieldset>

      <fieldset>
        <legend className="text-[21px] font-semibold">Payment</legend>
        <p className="mb-3 mt-1 text-[13px] text-muted">All transactions are secure and encrypted.</p>
        {declined ? (
          <div role="alert" className="mb-3 rounded-md border border-danger/40 bg-[#fff6f6] px-4 py-3 text-[14px]">
            <p className="font-semibold text-danger">Your payment was declined</p>
            <p className="mt-0.5 text-[13px] text-ink/80">
              {declined} Please try again or choose another payment method.
            </p>
          </div>
        ) : null}
        <div className="overflow-hidden rounded-md border border-line">
          {METHODS.map((m, i) => {
            const selected = m.value === method;
            return (
              <div key={m.value} className={cn(i > 0 && "border-t border-line")}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-4 py-4 text-[14px]",
                    selected ? "bg-[#f6f6f6]" : "bg-white",
                  )}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={m.value}
                    checked={selected}
                    onChange={() => setMethod(m.value)}
                    className="size-4 accent-black"
                  />
                  {m.label}
                </label>
                {selected ? (
                  <p className="border-t border-line bg-[#f6f6f6] px-4 py-4 text-[13px] text-ink/75">{m.hint}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-3">
        <Button type="submit" full loading={processing} className="min-h-14 rounded-md text-[13px]">
          {processing ? "Processing payment…" : `Pay now · ${formatMYR(BOOKING_PRICE_MYR)}`}
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-[12px] text-muted">
          <LockIcon size={13} /> Mock payment — nothing will be charged
        </p>
        <div className="text-center">
          <button
            type="button"
            disabled={processing}
            onClick={() => void pay(true)}
            className="text-[12px] text-muted underline underline-offset-4 hover:text-ink disabled:opacity-50"
          >
            Demo: simulate a declined payment
          </button>
        </div>
      </div>

      <nav aria-label="Policies" className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-4 text-[12px] text-muted">
        <span>Refund policy</span>
        <span>Privacy policy</span>
        <span>Terms of service</span>
      </nav>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  const errId = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[12px] text-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errId : undefined}
        className={cn(
          "w-full rounded-md border bg-white px-3.5 py-3 text-[16px] outline-none transition-shadow focus:border-black focus:ring-1 focus:ring-black sm:text-[14px]",
          error ? "border-danger" : "border-line",
        )}
      />
      {error ? (
        <p id={errId} className="mt-1.5 text-[12px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
