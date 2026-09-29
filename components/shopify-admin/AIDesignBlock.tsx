"use client";

/* eslint-disable @next/next/no-img-element -- mock renders / local data URLs */
import { useState } from "react";
import type { DemoSession } from "@/types/booking";
import { AdminBadge, AdminButton, AdminCard } from "./ui";
import { SPEC_ROWS } from "@/components/ai-design/SpecList";
import { DETAILS, FABRICS, findColour, FITS, garmentLabel, labelFor, occasionLabel, STYLES } from "@/lib/catalog/options";
import { setStaffStatus } from "@/lib/session/actions";
import { STATUS_META } from "@/lib/session/status";
import { finalGeneration, selectedGeneration } from "@/lib/session/use-demo-session";
import { cn, formatDateTime } from "@/lib/utils";

/**
 * "Halcyonic AI Custom Design" — a preview of a Shopify Admin *order details block extension*
 * (admin.order-details.block.render). In production this block fetches the AI record from
 * the Halcyonic backend by Shopify order id and renders with Polaris components.
 */


function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  return (
    <div>
      <div className="flex justify-between text-[12px]">
        <span className="text-[#616161]">{label}</span>
        <span className="font-medium tabular-nums">
          {used} / {limit}
        </span>
      </div>
      <div className="mt-1.5 flex gap-1">
        {Array.from({ length: limit }, (_, i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < used ? "bg-[#303030]" : "bg-[#e3e3e3]")} />
        ))}
      </div>
    </div>
  );
}

export function AIDesignBlock({ session }: { session: DemoSession }) {
  const [showTech, setShowTech] = useState(false);
  const final = finalGeneration(session);
  const shown = final ?? selectedGeneration(session);
  const status = STATUS_META[session.status];
  const req = shown?.request;
  const primary = findColour(req?.primaryColour);
  const accent = findColour(req?.secondaryColour);
  // The images belong to the concept shown (final, else selected) — not to whatever was submitted last.
  const refImages = shown?.referenceImages ?? [];
  const lastError =
    session.lastError && !final
      ? {
          GENERATION_FAILED: "Last generation attempt failed — no usage consumed",
          LIMIT_REACHED: "Customer reached the included generation limit",
          PAYMENT_FAILED: "A payment attempt was declined before this order",
          SESSION_EXPIRED: "Design session expired",
        }[session.lastError.state]
      : null;

  return (
    <AdminCard
      title={
        <span className="flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded bg-black text-[10px] font-semibold text-white">H</span>
          Halcyonic AI Custom Design
        </span>
      }
      action={<AdminBadge tone={status.tone}>{status.label}</AdminBadge>}
      className="ring-2 ring-[#c8a862]/60"
    >
      <p className="-mt-1 mb-4 text-[12px] text-[#616161]">
        App block · Admin extension preview · linked by order {session.shopifyOrderId}
      </p>
      {lastError ? (
        <p className="mb-4 rounded-lg bg-[#fff1e3] px-3 py-2 text-[12px] text-[#5e4200]">{lastError}</p>
      ) : null}

      {!shown || !req ? (
        <div className="rounded-lg border border-dashed border-[#d4d4d4] p-6 text-center">
          <p className="font-medium">No design yet</p>
          <p className="mt-1 text-[#616161]">
            The customer&apos;s AI design session was unlocked {formatDateTime(session.paidAt)}. Designs appear here as soon as they
            are generated.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <div>
              <img src={shown.imageUrl} alt={shown.title} className="aspect-[2/3] w-full rounded-lg border border-[#e3e3e3] bg-[#eeece8] object-cover" />
              <p className="mt-1.5 text-center text-[11px] text-[#616161]">
                {final ? "Final design" : "Latest selected concept"} · Concept {shown.version}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold">{shown.title}</p>
              <p className="mt-0.5 text-[12px] text-[#616161]">
                {final ? `Submitted ${formatDateTime(session.finalizedAt)}` : "Customer has not submitted yet"} ·{" "}
                {session.generations.length} concept{session.generations.length === 1 ? "" : "s"} created
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
                {[
                  ["Garment", garmentLabel(req.garmentType, req.garmentOther)],
                  ["Occasion", occasionLabel(req.occasion, req.occasionOther)],
                  [
                    "Colour",
                    <span key="c" className="inline-flex flex-wrap items-center gap-1">
                      {primary ? <span className="size-3 rounded-sm border border-black/10" style={{ background: primary.hex }} /> : null}
                      {primary?.name}
                      {accent ? (
                        <>
                          {" + "}
                          <span className="size-3 rounded-sm border border-black/10" style={{ background: accent.hex }} />
                          {accent.name}
                        </>
                      ) : null}
                    </span>,
                  ],
                  ["Fabric", labelFor(FABRICS, req.fabric)],
                  ["Fit", labelFor(FITS, req.fit)],
                  ["Style", req.style.map((s) => labelFor(STYLES, s)).join(", ")],
                  ["Details", req.details.length ? req.details.map((d) => labelFor(DETAILS, d)).join(", ") : "Minimal"],
                ].map(([k, v]) => (
                  <div key={String(k)}>
                    <dt className="text-[12px] text-[#616161]">{k}</dt>
                    <dd className="text-[13px] font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 rounded-lg bg-[#f7f7f7] p-3">
                <p className="text-[12px] text-[#616161]">Customer notes</p>
                <p className="mt-0.5">{req.additionalRequest ? `“${req.additionalRequest}”` : "No additional request."}</p>
              </div>
              <div className="mt-3">
                <p className="text-[12px] text-[#616161]">Reference images</p>
                {refImages.some((i) => i.dataUrl) ? (
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {refImages.map((i) =>
                      i.dataUrl ? <img key={i.id} src={i.dataUrl} alt={i.name} className="size-14 rounded-md border border-[#e3e3e3] object-cover" /> : null,
                    )}
                  </div>
                ) : (
                  <p className="mt-0.5">
                    {req.referenceImageCount ? `${req.referenceImageCount} image(s) — not kept in this demo` : "None provided"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 border-t border-[#ebebeb] pt-4 sm:grid-cols-2">
            <Meter label="AI generations used" used={session.generationsUsed} limit={session.generationLimit} />
            <Meter label="Virtual try-ons used" used={session.tryOnsUsed} limit={session.tryOnLimit} />
          </div>

          <div className="mt-5 border-t border-[#ebebeb] pt-4">
            <p className="text-[12px] text-[#616161]">Concept history</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {session.generations.map((g) => (
                <figure key={g.id} className="w-[72px]">
                  <img
                    src={g.imageUrl}
                    alt={`Concept ${g.version}`}
                    className={cn(
                      "aspect-[2/3] w-full rounded-md border object-cover",
                      g.id === final?.id ? "border-[#303030] ring-1 ring-[#303030]" : "border-[#e3e3e3]",
                    )}
                  />
                  <figcaption className="mt-1 text-center text-[11px] text-[#616161]">
                    {g.id === final?.id ? "Final" : `Concept ${g.version}`}
                  </figcaption>
                </figure>
              ))}
              {session.tryOn ? (
                <figure className="w-[72px]">
                  <img src={session.tryOn.imageUrl} alt="Try-on preview" className="aspect-[2/3] w-full rounded-md border border-[#e3e3e3] object-cover" />
                  <figcaption className="mt-1 text-center text-[11px] text-[#616161]">Try-on</figcaption>
                </figure>
              ) : null}
            </div>
          </div>

          <details className="group mt-5 border-t border-[#ebebeb] pt-4" open>
            <summary className="flex cursor-pointer items-center justify-between text-[13px] font-semibold">
              Design specification
              <span className="text-[#616161] group-open:rotate-180">▾</span>
            </summary>
            <dl className="mt-3 divide-y divide-[#ebebeb] rounded-lg border border-[#ebebeb]">
              {SPEC_ROWS.map(({ key, label }) => (
                <div key={key} className="grid grid-cols-[120px_1fr] gap-3 px-3 py-2">
                  <dt className="text-[12px] text-[#616161]">{label}</dt>
                  <dd>{shown.specification[key]}</dd>
                </div>
              ))}
            </dl>
          </details>
        </>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#ebebeb] pt-4">
        {session.status === "finalized" ? (
          <AdminButton primary onClick={() => setStaffStatus("staff_review")}>
            Start staff review
          </AdminButton>
        ) : null}
        {session.status === "staff_review" ? (
          <AdminButton primary onClick={() => setStaffStatus("completed")}>
            Mark as completed
          </AdminButton>
        ) : null}
        <AdminButton onClick={() => setShowTech((v) => !v)}>{showTech ? "Hide full AI record" : "View full AI record"}</AdminButton>
        {shown ? (
          <a
            href={shown.imageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-8 items-center rounded-lg px-3 text-[13px] font-medium text-[#005bd3] hover:underline"
          >
            Open design image
          </a>
        ) : null}
      </div>

      {showTech ? (
        <div className="mt-4 space-y-2 rounded-lg bg-[#f7f7f7] p-3 text-[12px]">
          <p className="font-semibold">Technical record (Halcyonic backend)</p>
          <p>
            <span className="text-[#616161]">Booking ID:</span> {session.bookingId}
          </p>
          <p>
            <span className="text-[#616161]">Shopify order:</span> {session.order?.id}
          </p>
          <p>
            <span className="text-[#616161]">AI mode:</span> Mock adapters (v0.1) — GPT-6 Luna, Wajie RAG, FLUX, FASHN replaced by fixtures
          </p>
          {shown ? (
            <>
              <p>
                <span className="text-[#616161]">Generation:</span> {shown.id} · {shown.model} · seed {shown.seed}
              </p>
              <p className="break-words">
                <span className="text-[#616161]">Image prompt:</span> {shown.prompt}
              </p>
            </>
          ) : null}
        </div>
      ) : null}
    </AdminCard>
  );
}
