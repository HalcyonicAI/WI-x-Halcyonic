"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { resetSession, setDemoFlag } from "@/lib/session/actions";
import { hasStorageWarning } from "@/lib/session/store";
import { STATUS_META } from "@/lib/session/status";
import { useDemoSession } from "@/lib/session/use-demo-session";
import { DEFAULT_LIMITS } from "@/lib/usage/quota";
import { cn, orderSlug } from "@/lib/utils";

/**
 * Presenter-only controls for the staff meeting: state at a glance, quick jumps,
 * failure simulations and a full reset. Hidden with NEXT_PUBLIC_DEMO_CONTROLS=off.
 * Keyboard: Shift + D toggles the panel.
 */

const JUMPS = [
  { label: "Bespoke page", href: "/" },
  { label: "AI booking", href: "/ai-design" },
  { label: "Checkout", href: "/ai-design/checkout" },
  { label: "Design form", href: "/ai-design/form" },
  { label: "Result", href: "/ai-design/result" },
  { label: "Try-on", href: "/ai-design/try-on" },
  { label: "Submitted", href: "/ai-design/complete" },
];

export function DemoControls() {
  const session = useDemoSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const pendingReset = useRef(false);

  // Reset only once we've left the gated page, so no guard reacts to the now-unpaid session.
  useEffect(() => {
    if (pendingReset.current && pathname === "/ai-design") {
      pendingReset.current = false;
      resetSession();
    }
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.shiftKey && e.key.toLowerCase() === "d") setOpen((v) => !v);
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (process.env.NEXT_PUBLIC_DEMO_CONTROLS === "off") return null;

  const adminHref = session?.shopifyOrderId ? `/mock-shopify-admin/${orderSlug(session.shopifyOrderId)}` : "/mock-shopify-admin";
  const onForm = pathname.startsWith("/ai-design/form");

  return (
    <div className={cn("fixed left-3 z-[60] print:hidden", onForm ? "bottom-[84px] lg:bottom-3" : "bottom-3")}>
      {open ? (
        <div
         
          role="dialog"
          aria-label="Demo controls"
          className="w-[300px] max-w-[calc(100vw-24px)] animate-fade-in border border-black bg-white text-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-medium uppercase">Demo controls</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close demo controls" className="grid size-8 place-items-center">
              <CloseIcon size={16} />
            </button>
          </div>

          <dl className="grid grid-cols-[92px_1fr] gap-x-3 gap-y-1.5 px-4 py-3">
            <dt className="text-muted">Order</dt>
            <dd>{session?.shopifyOrderId ?? "—"}</dd>
            <dt className="text-muted">Payment</dt>
            <dd className="uppercase">{session?.paymentStatus ?? "—"}</dd>
            <dt className="text-muted">AI status</dt>
            <dd>{session ? STATUS_META[session.status].label : "—"}</dd>
            <dt className="text-muted">Designs</dt>
            <dd>
              {session?.generationsUsed ?? 0} / {session?.generationLimit ?? DEFAULT_LIMITS.generationLimit}
            </dd>
            <dt className="text-muted">Try-on</dt>
            <dd>
              {session?.tryOnsUsed ?? 0} / {session?.tryOnLimit ?? DEFAULT_LIMITS.tryOnLimit}
            </dd>
          </dl>
          {hasStorageWarning() ? (
            <p className="mx-4 mb-2 bg-cream p-2 text-[11px]">Browser storage is full — uploaded images were not kept.</p>
          ) : null}

          <div className="space-y-2 border-t border-line px-4 py-3">
            <p className="text-[11px] uppercase text-muted">Simulate</p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-black"
                checked={session?.demo.failNextPayment ?? false}
                onChange={(e) => setDemoFlag("failNextPayment", e.target.checked)}
              />
              Next payment is declined
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-black"
                checked={session?.demo.failNextGeneration ?? false}
                onChange={(e) => setDemoFlag("failNextGeneration", e.target.checked)}
              />
              Next design generation fails
            </label>
          </div>

          <div className="border-t border-line px-4 py-3">
            <p className="text-[11px] uppercase text-muted">Jump to</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {JUMPS.map((j) => (
                <Link
                  key={j.href}
                  href={j.href}
                  onClick={() => setOpen(false)}
                  className={cn("border px-2 py-1 hover:border-black", pathname === j.href ? "border-black" : "border-line")}
                >
                  {j.label}
                </Link>
              ))}
              <Link href={adminHref} onClick={() => setOpen(false)} className="border border-black bg-black px-2 py-1 text-white">
                Shopify Admin preview
              </Link>
            </div>
          </div>

          <div className="border-t border-line px-4 py-3">
            {confirmReset ? (
              <div className="space-y-2">
                <p>Reset the demo? This clears the booking, designs and try-on on this device.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 bg-black px-3 py-2 uppercase text-white"
                    onClick={() => {
                      setConfirmReset(false);
                      setOpen(false);
                      if (pathname === "/ai-design") {
                        resetSession();
                      } else {
                        pendingReset.current = true;
                        router.replace("/ai-design");
                      }
                    }}
                  >
                    Reset demo
                  </button>
                  <button type="button" className="flex-1 border border-black px-3 py-2 uppercase" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmReset(true)} className="w-full border border-black px-3 py-2 uppercase hover:bg-black hover:text-white">
                Reset demo…
              </button>
            )}
          </div>
          <p className="border-t border-line px-4 py-2 text-[10px] uppercase text-subtle">Shift + D · presenter use only</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open demo controls"
          className="bg-black/75 px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-white hover:bg-black"
        >
          Demo
        </button>
      )}
    </div>
  );
}
