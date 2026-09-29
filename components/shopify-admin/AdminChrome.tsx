"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shopify-Admin-like frame (top bar + navigation) with an unmissable "preview" banner. */

const NAV = [
  { label: "Home", href: null },
  { label: "Orders", href: "/mock-shopify-admin" },
  { label: "Products", href: null },
  { label: "Customers", href: null },
  { label: "Content", href: null },
  { label: "Analytics", href: null },
  { label: "Marketing", href: null },
  { label: "Discounts", href: null },
];

export function AdminChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f1f1f1] font-[system-ui,-apple-system,'Segoe_UI',Roboto,sans-serif] text-[13px] text-[#303030]">
      <div className="bg-cream px-4 py-2.5 text-[12px] text-black sm:px-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold uppercase tracking-wide">Shopify Admin integration preview</span>
            <span className="text-black/70">
              {" "}
              — a mock of Wajie&apos;s existing Shopify Admin, showing where Halcyonic AI design data would appear on an order.
              Not a separate dashboard.
            </span>
          </p>
          <Link href="/ai-design" className="shrink-0 underline underline-offset-4">
            ← Back to storefront
          </Link>
        </div>
      </div>

      <header className="flex h-14 items-center gap-4 bg-[#1a1a1a] px-3 text-white sm:px-4">
        <span className="flex items-center gap-2 text-[13px] font-semibold">
          <span className="grid size-7 place-items-center rounded-md bg-white/10 text-[11px]">S</span>
          <span className="hidden sm:inline">Shopify Admin</span>
        </span>
        <div className="mx-auto hidden h-9 w-full max-w-[520px] items-center rounded-lg bg-[#303030] px-3 text-[13px] text-white/60 md:flex">
          Search
        </div>
        <span className="ml-auto flex items-center gap-2 text-[13px]">
          <span className="grid size-7 place-items-center rounded-md bg-[#c8a862] text-[11px] font-semibold text-black">WI</span>
          <span className="hidden sm:inline">Wajie Ibrahim</span>
        </span>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px] flex-1">
        <nav aria-label="Shopify Admin" className="hidden w-[240px] shrink-0 px-3 py-4 lg:block">
          <ul className="space-y-0.5">
            {NAV.map((n) => {
              const active = n.href && pathname.startsWith(n.href);
              const cls = cn(
                "flex h-8 items-center rounded-lg px-3 text-[13px] font-medium",
                active ? "bg-white text-[#303030] shadow-[0_1px_0_rgba(0,0,0,0.05)]" : "text-[#4a4a4a]",
                !n.href && "cursor-default opacity-60",
              );
              return (
                <li key={n.label}>
                  {n.href ? (
                    <Link href={n.href} className={cls}>
                      {n.label}
                    </Link>
                  ) : (
                    <span className={cls}>{n.label}</span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-6 px-3 text-[12px] font-semibold text-[#616161]">Sales channels</p>
          <p className="flex h-8 items-center px-3 text-[13px] opacity-60">Online Store</p>
          <p className="mt-4 px-3 text-[12px] font-semibold text-[#616161]">Apps</p>
          <p className="flex h-8 items-center gap-2 px-3 text-[13px]">
            <span className="grid size-5 place-items-center rounded bg-black text-[10px] font-semibold text-white">H</span>
            Halcyonic AI Design
          </p>
        </nav>
        <main id="main" className="min-w-0 flex-1 px-3 py-5 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
