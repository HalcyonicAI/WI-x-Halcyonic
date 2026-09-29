"use client";

import { useEffect, useRef } from "react";
import { CheckIcon } from "@/components/ui/icons";
import { STAGE_MS } from "@/lib/client/staged";
import { cn } from "@/lib/utils";

/**
 * The "AI is working" state, expressed in the storefront's own language:
 * a studio frame where a garment outline is being sketched, and quiet uppercase stages.
 * No spinners, glows or technical jargon.
 */
export function GenerationProgress({
  title,
  subtitle,
  stages,
  current,
  meta,
}: {
  title: string;
  subtitle?: string;
  stages: readonly string[];
  /** Index of the active stage; `stages.length` means all complete. */
  current: number;
  meta?: string;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const done = current >= stages.length;

  // The button that started the run has just unmounted — keep focus in a sensible place.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section className="mx-auto grid w-full max-w-[1100px] animate-fade-in items-center gap-6 px-4 py-8 sm:px-8 md:grid-cols-[minmax(0,420px)_1fr] md:gap-16 md:py-20">
      <SketchFrame />
      <div className="order-first md:order-none">
        {meta ? <p className="text-[12px] uppercase tracking-wide text-muted">{meta}</p> : null}
        <h1 ref={headingRef} tabIndex={-1} className="wi-h-page mt-2 outline-none">
          {title}
        </h1>
        {subtitle ? <p className="mt-3 max-w-[420px] text-[12px] leading-[1.6] text-muted">{subtitle}</p> : null}
        <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {done ? "All steps complete." : `Step ${current + 1} of ${stages.length}: ${stages[current]}`}
        </p>
        <ol className="mt-6 border-t border-line md:mt-10" aria-hidden="true">
          {stages.map((label, i) => {
            const state = i < current ? "done" : i === current ? "active" : "todo";
            return (
              <li key={label} className="relative border-b border-line py-4">
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center border text-[10px] tabular-nums",
                      state === "done" && "border-black bg-black text-white",
                      state === "active" && "border-black",
                      state === "todo" && "border-line text-subtle",
                    )}
                    aria-hidden="true"
                  >
                    {state === "done" ? <CheckIcon size={12} strokeWidth={2} /> : i + 1}
                  </span>
                  <span className={cn("text-[12px] uppercase", state === "todo" ? "text-subtle" : "text-ink")}>
                    {label}
                  </span>
                </div>
                {state === "active" ? (
                  <span
                    key={`bar-${i}`}
                    className="wi-progress-line absolute bottom-[-1px] left-0 h-px w-full bg-black"
                    style={{ ["--wi-stage-ms" as string]: `${STAGE_MS}ms` }}
                    aria-hidden="true"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
        <p className="mt-6 text-[12px] text-muted">Nothing is used from your booking unless a design is created.</p>
      </div>
    </section>
  );
}

function SketchFrame() {
  return (
    <div
      className="relative aspect-[2/3] w-full max-w-[200px] justify-self-center bg-studio sm:max-w-[260px] md:max-w-[420px]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 600 900" className="absolute inset-0 h-full w-full">
        <g fill="none" stroke="#2A2420" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity=".75">
          <ellipse className="wi-draw" pathLength={1} cx="300" cy="106" rx="23" ry="30" />
          <path className="wi-draw" pathLength={1} d="M 290,134 C 291,146 290,158 289,168" />
          <path className="wi-draw" pathLength={1} d="M 310,134 C 309,146 310,158 311,168" />
          <path
            className="wi-draw"
            pathLength={1}
            d="M 289,168 L 241,180 C 236,196 246,213 262,222 C 258,248 262,290 262,320 C 244,420 196,700 152,840 Q 300,860 448,840 C 404,700 356,420 338,320 C 338,290 342,248 338,222 C 354,213 364,196 359,180 L 311,168 Q 300,176 289,168 Z"
          />
          <path
            className="wi-draw"
            pathLength={1}
            d="M 241,180 C 227,190 222,230 220,300 C 218,360 216,410 216,452 L 247,454 C 249,410 251,360 253,300 C 255,262 258,238 262,222"
          />
          <path
            className="wi-draw"
            pathLength={1}
            d="M 359,180 C 373,190 378,230 380,300 C 382,360 384,410 384,452 L 353,454 C 351,410 349,360 347,300 C 345,262 342,238 338,222"
          />
          <path className="wi-draw" pathLength={1} d="M 262,320 Q 300,326 338,320" />
          <path className="wi-draw" pathLength={1} d="M 284,332 C 272,500 234,700 208,848 M 316,332 C 328,500 366,700 392,848" />
        </g>
      </svg>
      <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-wide text-muted wi-breathe">Sketching</span>
    </div>
  );
}
