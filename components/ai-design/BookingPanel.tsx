"use client";

import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { LockIcon } from "@/components/ui/icons";
import { Notice } from "./Notice";
import { useDemoSession } from "@/lib/session/use-demo-session";
import { BOOKING_PRICE_SHORT, isFinalized, isPaid, remainingGenerations } from "@/lib/usage/quota";

/** The booking CTA on the product page — changes with the customer's booking state. */
export function BookingPanel() {
  const session = useDemoSession();

  if (!session) return <div className="h-[104px]" aria-hidden="true" />;

  if (isFinalized(session)) {
    return (
      <div className="space-y-3">
        <Notice title={`Design submitted · Order ${session.shopifyOrderId}`}>
          Your design has been sent to Wajie&apos;s team for review.
        </Notice>
        <ButtonLink href="/ai-design/complete" full>
          View submitted design
        </ButtonLink>
      </div>
    );
  }

  if (isPaid(session)) {
    const started = session.generations.length > 0;
    return (
      <div className="space-y-3">
        <Notice title={`Booking confirmed · Order ${session.shopifyOrderId}`}>
          {remainingGenerations(session)} of {session.generationLimit} design generations remaining.
        </Notice>
        <ButtonLink href={started ? "/ai-design/result" : "/ai-design/form"} full>
          {started ? "Continue your design" : "Start designing"}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {session.lastError?.state === "PAYMENT_FAILED" ? (
        <Notice tone="error" title="Your last payment didn't go through">
          No charge was made. You can try again with the same or a different payment method.
        </Notice>
      ) : null}
      <ButtonLink href="/ai-design/checkout" full>
        Book AI Design — {BOOKING_PRICE_SHORT}
      </ButtonLink>
      <p className="flex items-start gap-2 text-[12px] text-muted">
        <LockIcon size={14} className="mt-0.5 shrink-0" />
        Secure Shopify checkout. Your design session unlocks as soon as payment is confirmed.
      </p>
    </div>
  );
}

/** Compact CTA for the bottom of the page — same state logic, single button. */
export function BookingCTA() {
  const session = useDemoSession();
  if (!session) return <div className="h-12" aria-hidden="true" />;
  const [href, label] = isFinalized(session)
    ? ["/ai-design/complete", "View submitted design"]
    : isPaid(session)
      ? session.generations.length
        ? ["/ai-design/result", "Continue your design"]
        : ["/ai-design/form", "Start designing"]
      : ["/ai-design/checkout", `Book AI Design — ${BOOKING_PRICE_SHORT}`];
  return (
    <ButtonLink href={href} className="min-w-[260px]">
      {label}
    </ButtonLink>
  );
}

/** Shown when a customer is sent back here by the paid-access guard. */
export function LockedNotice() {
  const params = useSearchParams();
  const session = useDemoSession();
  if (params.get("access") !== "locked" || !session || isPaid(session)) return null;
  return (
    <div className="border-b border-line bg-cream">
      <Notice tone="locked" title="Paid booking required" className="mx-auto max-w-[1600px] px-4 sm:px-8">
        AI design unlocks once your {BOOKING_PRICE_SHORT} booking is paid. This keeps every design session linked to a confirmed Wajie
        Ibrahim order.
      </Notice>
    </div>
  );
}
