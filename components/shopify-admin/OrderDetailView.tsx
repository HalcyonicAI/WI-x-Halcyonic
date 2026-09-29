"use client";

/* eslint-disable @next/next/no-img-element -- mock render thumbnails */
import Link from "next/link";
import { AdminBadge, AdminButton, AdminCard } from "./ui";
import { AIDesignBlock } from "./AIDesignBlock";
import { STATUS_META } from "@/lib/session/status";
import { SAMPLE_CONCEPTS } from "@/lib/ai/samples";
import { PAYMENT_METHOD_LABEL } from "@/lib/catalog/options";
import { finalGeneration, selectedGeneration, useDemoSession } from "@/lib/session/use-demo-session";
import { formatDateTime, orderSlug } from "@/lib/utils";


export function OrderDetailView({ orderId }: { orderId: string }) {
  const session = useDemoSession();
  if (!session) return <div className="h-[60vh]" aria-busy="true" />;

  const order = session.order;
  if (!order || orderSlug(order.name) !== orderId) {
    return (
      <div className="mx-auto max-w-[640px] pt-10">
        <AdminCard>
          <p className="text-[15px] font-semibold">Order #{orderId} not found</p>
          <p className="mt-1 text-[#616161]">
            In this demo, orders are created by completing the AI Custom Design booking checkout on the storefront.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/mock-shopify-admin" className="text-[#005bd3] hover:underline">
              View orders
            </Link>
            <span className="text-[#8a8a8a]">·</span>
            <Link href="/ai-design" className="text-[#005bd3] hover:underline">
              Go to AI Custom Design
            </Link>
          </div>
        </AdminCard>
      </div>
    );
  }

  const customer = session.customer;
  const item = order.lineItems[0];
  // Production: the AI request note would also be written to the Shopify order note.
  const customerNote = (finalGeneration(session) ?? selectedGeneration(session))?.request.additionalRequest ?? "";

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/mock-shopify-admin" aria-label="Back to orders" className="grid size-10 place-items-center rounded-md hover:bg-black/5">
              ←
            </Link>
            <h1 className="text-[20px] font-bold">{order.name}</h1>
            <AdminBadge dot>Paid</AdminBadge>
            <AdminBadge tone="attention" dot>
              Unfulfilled
            </AdminBadge>
            <AdminBadge tone={STATUS_META[session.status].tone}>AI: {STATUS_META[session.status].label}</AdminBadge>
          </div>
          <p className="ml-12 mt-1 text-[12px] text-[#616161]">{formatDateTime(order.createdAt)} from Online Store</p>
        </div>
        <div className="flex gap-2">
          <AdminButton disabled title="Not part of this preview">
            Refund
          </AdminButton>
          <AdminButton disabled title="Not part of this preview">
            More actions
          </AdminButton>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <AdminCard title={<AdminBadge tone="attention" dot>Unfulfilled (1)</AdminBadge>}>
            <div className="flex items-center gap-3">
              <img src={SAMPLE_CONCEPTS[0].image} alt="" className="size-12 rounded-lg border border-[#e3e3e3] object-cover object-top" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[#005bd3]">{item.title}</p>
                <p className="text-[12px] text-[#616161]">SKU: {item.sku}</p>
              </div>
              <p className="hidden text-[#616161] sm:block">
                RM{item.price} × {item.quantity}
              </p>
              <p className="w-16 text-right sm:w-20">RM{item.price}</p>
            </div>
            <p className="mt-4 rounded-lg bg-[#f7f7f7] px-3 py-2 text-[12px] text-[#616161]">
              Digital booking — no shipping required. The AI design below is the deliverable to review.
            </p>
          </AdminCard>

          <AIDesignBlock session={session} />

          <AdminCard title={<AdminBadge dot>Paid</AdminBadge>}>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="text-[#616161]">1 item</dd>
                <dd>RM{order.totalPrice}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd>RM{order.totalPrice}</dd>
              </div>
              <div className="flex justify-between border-t border-[#ebebeb] pt-2">
                <dt>Paid by customer · {PAYMENT_METHOD_LABEL[order.paymentMethod]}</dt>
                <dd>RM{order.totalPrice}</dd>
              </div>
            </dl>
          </AdminCard>

          <AdminCard title="Timeline">
            <ol className="relative space-y-4 border-l border-[#e3e3e3] pl-5">
              {session.events
                .filter((e) => e.type !== "payment_failed" && (!session.paidAt || e.at >= session.paidAt))
                .reverse()
                .map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[25px] top-1 size-2.5 rounded-full border-2 border-[#f1f1f1] bg-[#8a8a8a]" aria-hidden="true" />
                  <p>{e.label}</p>
                  <p className="text-[12px] text-[#616161]">{formatDateTime(e.at)}</p>
                </li>
              ))}
            </ol>
          </AdminCard>
        </div>

        <div className="space-y-4">
          <AdminCard title="Notes">
            {customerNote ? (
              <>
                <p>{customerNote}</p>
                <p className="mt-2 text-[12px] text-[#616161]">Synced from the customer&apos;s AI design request</p>
              </>
            ) : (
              <p className="text-[#616161]">No notes from customer</p>
            )}
          </AdminCard>
          <AdminCard title="Customer">
            <p className="font-medium text-[#005bd3]">{customer?.name}</p>
            <p className="text-[#616161]">1 order</p>
            <p className="mt-4 text-[12px] font-semibold">Contact information</p>
            <p className="mt-1 break-all text-[#005bd3]">{customer?.email}</p>
            <p className="text-[#616161]">{customer?.phone ?? "No phone number"}</p>
            <p className="mt-4 text-[12px] font-semibold">Shipping address</p>
            <p className="mt-1 text-[#616161]">No shipping required</p>
          </AdminCard>
          <AdminCard title="Tags">
            <div className="flex flex-wrap gap-1.5">
              {[...order.tags, `ai-status:${session.status}`].map((t) => (
                <span key={t} className="rounded-md bg-[#e3e3e3] px-2 py-0.5 text-[12px]">
                  {t}
                </span>
              ))}
            </div>
          </AdminCard>
          <AdminCard title="Halcyonic AI">
            <p className="text-[#616161]">
              Booking <span className="text-[#303030]">{session.bookingId}</span>
            </p>
            <p className="mt-1 text-[#616161]">
              Status <span className="text-[#303030]">{STATUS_META[session.status].label}</span>
            </p>
            <p className="mt-3 text-[12px] text-[#616161]">
              Shown here via an Admin block extension. Staff never need to leave Shopify Admin.
            </p>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
