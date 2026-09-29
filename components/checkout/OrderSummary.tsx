"use client";

import { useState } from "react";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { ChevronDownIcon } from "@/components/ui/icons";
import { SAMPLE_CONCEPTS } from "@/lib/ai/samples";
import { BOOKING_PRICE_MYR, DEFAULT_LIMITS } from "@/lib/usage/quota";
import { cn, formatMYR } from "@/lib/utils";

const price = formatMYR(BOOKING_PRICE_MYR);

function Summary() {
  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="size-16 overflow-hidden rounded-lg border border-line bg-studio">
            <RemoteImage src={SAMPLE_CONCEPTS[0].image} alt="" className="h-full w-full object-cover object-top" />
          </div>
          <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-[#666] text-[11px] text-white">
            1
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium">AI Custom Design Booking</p>
          <p className="text-[12px] text-muted">
            {DEFAULT_LIMITS.generationLimit} design generations · {DEFAULT_LIMITS.tryOnLimit} virtual try-on
          </p>
        </div>
        <p className="text-[14px]">{price}</p>
      </div>
      <dl className="mt-6 space-y-2 text-[14px]">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{price}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd className="text-muted">Not required</dd>
        </div>
        <div className="flex items-baseline justify-between pt-2 text-[19px] font-semibold">
          <dt>Total</dt>
          <dd>
            <span className="mr-2 text-[12px] font-normal text-muted">MYR</span>
            {price}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/** Right-hand order summary (desktop) / collapsible summary bar (mobile), Shopify-style. */
export function OrderSummary() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="border-b border-line bg-mist lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="mx-auto flex w-full max-w-[560px] items-center justify-between px-4 py-4 text-[14px]"
        >
          <span className="flex items-center gap-1.5 underline-offset-4 hover:underline">
            {open ? "Hide order summary" : "Show order summary"}
            <ChevronDownIcon size={14} className={cn("transition-transform", open && "rotate-180")} />
          </span>
          <span className="font-semibold">{price}</span>
        </button>
        {open ? (
          <div className="mx-auto max-w-[560px] px-4 pb-6">
            <Summary />
          </div>
        ) : null}
      </div>
      <aside aria-label="Order summary" className="hidden border-l border-line bg-mist lg:order-last lg:block">
        <div className="sticky top-0 max-w-[440px] px-10 py-12">
          <Summary />
        </div>
      </aside>
    </>
  );
}
