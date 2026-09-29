"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useDemoSession } from "@/lib/session/use-demo-session";
import { isFinalized, isPaid } from "@/lib/usage/quota";
import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Slim cream bar that keeps the paid Shopify booking visible throughout the AI flow,
 * reinforcing that the design session belongs to order #WI-AI-XXXX.
 */

const STEPS = [
  { key: "book", label: "Booking", href: "/ai-design" },
  { key: "form", label: "Design brief", href: "/ai-design/form" },
  { key: "result", label: "Your design", href: "/ai-design/result" },
  { key: "try-on", label: "Try-on", href: "/ai-design/try-on" },
  { key: "complete", label: "Submitted", href: "/ai-design/complete" },
] as const;

function stepIndex(pathname: string): number {
  if (pathname.startsWith("/ai-design/complete")) return 4;
  if (pathname.startsWith("/ai-design/try-on")) return 3;
  if (pathname.startsWith("/ai-design/result")) return 2;
  if (pathname.startsWith("/ai-design/form")) return 1;
  return 0;
}

export function SessionBar() {
  const pathname = usePathname();
  const session = useDemoSession();
  const currentRef = useRef<HTMLLIElement>(null);

  // On narrow screens the step list scrolls sideways — keep the current step in view.
  useEffect(() => {
    const el = currentRef.current;
    const scroller = el?.closest("nav");
    if (el && scroller) scroller.scrollLeft = el.offsetLeft - scroller.clientWidth / 2 + el.clientWidth / 2;
  }, [pathname, session?.status]);

  if (!session || !isPaid(session) || pathname === "/ai-design") return null;

  const current = stepIndex(pathname);
  const finalized = isFinalized(session);
  const reachable = (i: number) => {
    if (finalized) return i === 4;
    if (i === 0 || i === 1) return true;
    if (i === 2 || i === 3) return session.generations.length > 0;
    return false;
  };

  return (
    <div className="border-b border-line bg-cream">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-2.5 sm:px-8 md:flex-row md:items-center md:justify-between">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase sm:text-[12px]">
          <span className="font-medium">AI Custom Design</span>
          <span className="text-muted" aria-hidden="true">
            ·
          </span>
          <span>Order {session.shopifyOrderId}</span>
          <span className="inline-flex items-center gap-1 border border-black px-1.5 py-0.5 text-[10px] leading-none">
            <CheckIcon size={10} strokeWidth={2} /> Paid
          </span>
          <span className="text-muted" aria-hidden="true">
            ·
          </span>
          <span className="text-muted">
            Designs {session.generationsUsed}/{session.generationLimit} · Try-on {session.tryOnsUsed}/{session.tryOnLimit}
          </span>
        </p>
        <nav aria-label="Design steps" className="no-scrollbar relative -mx-1 overflow-x-auto">
          <ol className="flex items-center gap-1 whitespace-nowrap px-1 text-[11px] uppercase">
            {STEPS.map((s, i) => {
              const state = i < current ? "done" : i === current ? "current" : "todo";
              const label = (
                <span
                  className={cn(
                    state === "current" && "font-medium text-ink underline underline-offset-4",
                    state === "done" && "text-ink",
                    state === "todo" && "text-subtle",
                  )}
                >
                  {String(i + 1).padStart(2, "0")} {s.label}
                </span>
              );
              return (
                <li
                  key={s.key}
                  ref={state === "current" ? currentRef : undefined}
                  className="flex items-center gap-1"
                  aria-current={state === "current" ? "step" : undefined}
                >
                  {i > 0 ? (
                    <span className="mx-1 h-px w-3 bg-black/30" aria-hidden="true" />
                  ) : null}
                  {state !== "current" && reachable(i) && i !== 0 ? (
                    <Link href={s.href} className="inline-flex min-h-8 items-center hover:underline">
                      {label}
                    </Link>
                  ) : (
                    label
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
