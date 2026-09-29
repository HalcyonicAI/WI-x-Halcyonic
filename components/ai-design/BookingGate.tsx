"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type { DemoSession } from "@/types/booking";
import { useDemoSession } from "@/lib/session/use-demo-session";
import { isFinalized, isPaid } from "@/lib/usage/quota";
import { LockIcon } from "@/components/ui/icons";

/**
 * Paid-access guard for every AI route.
 *
 * MOCK: reads the demo session from localStorage and redirects on the client.
 * PRODUCTION: the route (and every AI API call) verifies the Shopify order server-side —
 * `financial_status === "paid"` for this booking — before rendering or generating.
 *
 *   if (paymentStatus !== "paid") redirect("/ai-design")
 */

export type GateRule = "paid" | "has-design" | "open" | "finalized";

function redirectFor(s: DemoSession, rules: GateRule[]): string | null {
  if (rules.includes("paid") && !isPaid(s)) return "/ai-design?access=locked";
  if (rules.includes("open") && isFinalized(s)) return "/ai-design/complete";
  if (rules.includes("finalized") && !isFinalized(s)) return s.generations.length ? "/ai-design/result" : "/ai-design/form";
  if (rules.includes("has-design") && s.generations.length === 0) return "/ai-design/form";
  return null;
}

export function BookingGate({ rules, children }: { rules: GateRule[]; children: (session: DemoSession) => ReactNode }) {
  const session = useDemoSession();
  const router = useRouter();
  const target = session ? redirectFor(session, rules) : null;

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (!session) return <GateMessage text="Loading your design session" />;
  if (target) {
    return target.includes("access=locked") ? (
      <GateMessage locked text="A paid booking is required before AI design can begin" />
    ) : (
      <GateMessage text="One moment" />
    );
  }
  return <>{children(session)}</>;
}

function GateMessage({ text, locked }: { text: string; locked?: boolean }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center" role="status">
      {locked ? <LockIcon size={22} /> : <span className="h-px w-10 bg-black wi-breathe" aria-hidden="true" />}
      <p className="text-[12px] uppercase tracking-wide text-muted">{text}</p>
    </div>
  );
}
