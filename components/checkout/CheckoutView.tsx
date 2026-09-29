"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { CheckoutForm } from "./CheckoutForm";
import { OrderSummary } from "./OrderSummary";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { useDemoSession } from "@/lib/session/use-demo-session";
import { isPaid } from "@/lib/usage/quota";

/** Mock Shopify checkout for the RM5 "AI Custom Design Booking" product. */
export function CheckoutView() {
  const session = useDemoSession();
  const router = useRouter();
  const paid = session ? isPaid(session) : false;

  useEffect(() => {
    // Already booked — go to the order confirmation instead of paying twice.
    if (paid) router.replace("/ai-design/checkout/confirmed");
  }, [paid, router]);

  return (
    <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[1fr_minmax(0,44%)]">
      <OrderSummary />
      <div className="flex justify-center lg:justify-end">
        <div className="w-full max-w-[560px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-[12px] text-muted">
            <Link href="/ai-design" className="inline-flex items-center gap-1 hover:text-ink">
              <ArrowLeftIcon size={13} /> AI Custom Design
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink">Information &amp; payment</span>
          </nav>
          <h1 className="sr-only">Checkout: AI Custom Design Booking</h1>
          {session && !paid ? (
            <CheckoutForm session={session} />
          ) : (
            <div className="h-[520px]" aria-busy="true" aria-label="Loading checkout" />
          )}
        </div>
      </div>
    </div>
  );
}
