"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { OrderSummary } from "./OrderSummary";
import { PAYMENT_METHOD_LABEL } from "@/lib/catalog/options";
import { ButtonLink } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";
import { useDemoSession } from "@/lib/session/use-demo-session";
import { isPaid } from "@/lib/usage/quota";
import { firstName, formatDateTime } from "@/lib/utils";


/** Shopify-style order confirmation ("Thank you" page) that unlocks the AI design session. */
export function ConfirmedView() {
  const session = useDemoSession();
  const router = useRouter();
  const paid = session ? isPaid(session) : false;

  useEffect(() => {
    if (session && !paid) router.replace("/ai-design/checkout");
  }, [session, paid, router]);

  if (!session || !paid || !session.order) {
    return <div className="flex-1" aria-busy="true" />;
  }

  const order = session.order;
  const started = session.generations.length > 0;

  return (
    <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[1fr_minmax(0,44%)]">
      <OrderSummary />
      <div className="flex justify-center lg:justify-end">
        <div className="w-full max-w-[560px] animate-fade-up px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <div className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-black">
              <CheckIcon size={24} strokeWidth={2} />
            </span>
            <div>
              <p className="text-[13px] text-muted">Confirmation {order.name}</p>
              <h1 className="text-[22px] font-semibold">Thank you, {firstName(session.customer?.name) || "there"}!</h1>
            </div>
          </div>

          <section className="mt-8 rounded-md border border-line p-5">
            <h2 className="text-[17px] font-semibold">Your AI design session is unlocked</h2>
            <p className="mt-1 text-[14px] text-ink/75">
              Your booking is confirmed. You can start designing right away — your session stays linked to this order.
            </p>
            <dl className="mt-5 divide-y divide-line border-y border-line text-[14px]">
              <div className="flex justify-between py-3">
                <dt className="text-muted">Order</dt>
                <dd className="font-medium">{order.name}</dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-muted">Payment</dt>
                <dd className="inline-flex items-center gap-1.5 font-medium">
                  <span className="size-2 rounded-full bg-ok" aria-hidden="true" /> PAID
                </dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-muted">AI design access</dt>
                <dd className="font-medium">UNLOCKED</dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-muted">Included</dt>
                <dd>
                  {session.generationLimit} designs · {session.tryOnLimit} try-on
                </dd>
              </div>
            </dl>
            <ButtonLink href={started ? "/ai-design/result" : "/ai-design/form"} full className="mt-5 min-h-14 rounded-md text-[13px]">
              {started ? "Continue your design" : "Start designing"}
            </ButtonLink>
          </section>

          <section className="mt-4 rounded-md border border-line p-5 text-[14px]">
            <h2 className="text-[17px] font-semibold">Order details</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-[13px] font-medium">Contact information</p>
                <p className="mt-1 text-ink/75">{session.customer?.name}</p>
                <p className="text-ink/75">{session.customer?.email}</p>
                {session.customer?.phone ? <p className="text-ink/75">{session.customer.phone}</p> : null}
              </div>
              <div>
                <p className="text-[13px] font-medium">Payment method</p>
                <p className="mt-1 text-ink/75">
                  {PAYMENT_METHOD_LABEL[order.paymentMethod]} · RM{order.totalPrice}
                </p>
                <p className="mt-3 text-[13px] font-medium">Placed</p>
                <p className="mt-1 text-ink/75">{formatDateTime(order.createdAt)}</p>
              </div>
            </div>
            <p className="mt-5 text-[12px] text-muted">
              In production, Shopify emails this confirmation to the customer. No email is sent in this demo.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
