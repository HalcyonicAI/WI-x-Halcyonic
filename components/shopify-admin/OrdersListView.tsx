"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminBadge, AdminCard } from "./ui";
import { STATUS_META } from "@/lib/session/status";
import { useDemoSession } from "@/lib/session/use-demo-session";
import { cn, formatDateTime, orderSlug } from "@/lib/utils";

/** Static sample orders so the list looks like a real store. Not part of the demo flow. */
const SAMPLE_ORDERS = [
  { name: "#1188", date: "28 Sept 2026, 9:14 pm", customer: "Siti Hajar A.", total: "RM450.00", item: "ARYAANA ABAYA - COCOA" },
  { name: "#1187", date: "28 Sept 2026, 4:02 pm", customer: "Farah Nadia", total: "RM100.00", item: "ONLINE MEETING" },
  { name: "#1186", date: "27 Sept 2026, 11:47 am", customer: "Amirah Zulkifli", total: "RM250.00", item: "LUNA (STRIPES EDITION) - BANILLA × 2" },
];

export function OrdersListView() {
  const session = useDemoSession();
  const [tab, setTab] = useState<"all" | "ai">("all");
  const aiOrder = session?.order ?? null;

  return (
    <div className="mx-auto max-w-[1100px]">
      <h1 className="text-[20px] font-bold">Orders</h1>
      <AdminCard className="mt-4" flush>
        <div className="flex gap-1 border-b border-[#ebebeb] px-2 pt-2">
          {(
            [
              ["all", "All"],
              ["ai", "AI Custom Design"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={cn("rounded-t-lg px-3 py-2 text-[13px] font-medium", tab === key ? "bg-[#f1f1f1]" : "text-[#616161] hover:bg-[#f7f7f7]")}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-[#f7f7f7] text-[12px] text-[#616161]">
              <tr>
                <th className="px-4 py-2 font-medium">Order</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Total</th>
                <th className="px-4 py-2 font-medium">Payment</th>
                <th className="px-4 py-2 font-medium">Fulfillment</th>
                <th className="px-4 py-2 font-medium">AI design</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebebeb]">
              {aiOrder && session ? (
                <tr className="bg-[#fffdf5] hover:bg-[#fbf7e9]">
                  <td className="px-4 py-3 font-semibold">
                    <Link href={`/mock-shopify-admin/${orderSlug(aiOrder.name)}`} className="hover:underline">
                      {aiOrder.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#616161]">{formatDateTime(aiOrder.createdAt)}</td>
                  <td className="px-4 py-3">{session.customer?.name}</td>
                  <td className="px-4 py-3">RM{aiOrder.totalPrice}</td>
                  <td className="px-4 py-3">
                    <AdminBadge dot>Paid</AdminBadge>
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge tone="attention" dot>
                      Unfulfilled
                    </AdminBadge>
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge tone={STATUS_META[session.status].tone}>{STATUS_META[session.status].label}</AdminBadge>
                  </td>
                </tr>
              ) : null}
              {tab === "all"
                ? SAMPLE_ORDERS.map((o) => (
                    <tr key={o.name} className="text-[#616161]" title="Sample order — not part of the demo">
                      <td className="px-4 py-3 font-semibold">{o.name}</td>
                      <td className="px-4 py-3">{o.date}</td>
                      <td className="px-4 py-3">{o.customer}</td>
                      <td className="px-4 py-3">{o.total}</td>
                      <td className="px-4 py-3">
                        <AdminBadge dot>Paid</AdminBadge>
                      </td>
                      <td className="px-4 py-3">
                        <AdminBadge dot>Fulfilled</AdminBadge>
                      </td>
                      <td className="px-4 py-3">—</td>
                    </tr>
                  ))
                : null}
              {!aiOrder && (tab === "ai" || tab === "all") ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-[#616161]">
                    {session === null ? "Loading…" : (
                      <>
                        No AI Custom Design orders yet.{" "}
                        <Link href="/ai-design" className="text-[#005bd3] hover:underline">
                          Book one on the storefront
                        </Link>
                        .
                      </>
                    )}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </AdminCard>
      <p className="mt-3 text-[12px] text-[#616161]">
        AI bookings are regular Shopify orders tagged <span className="rounded bg-[#e3e3e3] px-1.5">ai-custom-design</span>, so
        staff can filter them with a saved view.
      </p>
    </div>
  );
}
