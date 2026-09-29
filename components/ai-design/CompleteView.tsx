"use client";

import Link from "next/link";
import type { DemoSession } from "@/types/booking";
import { BookingGate } from "./BookingGate";
import { DesignFrame } from "./DesignFrame";
import { SpecList } from "./SpecList";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { finalGeneration } from "@/lib/session/use-demo-session";
import { WAJIE_LINKS } from "@/lib/brand/assets";
import { formatDateTime, orderSlug } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  finalized: "Design submitted",
  staff_review: "In review with Wajie's team",
  completed: "Completed",
};

export function CompleteView() {
  return <BookingGate rules={["paid", "finalized"]}>{(session) => <Complete session={session} />}</BookingGate>;
}

function Complete({ session }: { session: DemoSession }) {
  const design = finalGeneration(session);
  if (!design) return null;

  return (
    <div className="mx-auto w-full max-w-[1100px] animate-fade-up px-4 py-12 sm:px-8 lg:py-16">
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center border border-black">
          <CheckIcon size={22} strokeWidth={1.8} />
        </span>
        <p className="mt-5 text-[12px] uppercase tracking-wide text-muted">{STATUS_LABEL[session.status] ?? "Design submitted"}</p>
        <h1 className="wi-h-page mx-auto mt-3 max-w-[900px]">Your design has been submitted to Wajie Ibrahim.</h1>
        <p className="mx-auto mt-4 max-w-[520px] text-[12px] leading-[1.6] text-muted">
          Wajie&apos;s team can now review your design request. We&apos;ll be in touch to discuss your piece.
        </p>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-[minmax(0,380px)_1fr] md:gap-14">
        <DesignFrame src={design.imageUrl} alt={design.title} caption={`Final design · Concept ${design.version}`} priority />
        <div>
          <p className="text-[12px] uppercase text-muted">Final design</p>
          <p className="mt-1 text-[22px] font-bold uppercase leading-tight">{design.title}</p>
          <dl className="mt-6 divide-y divide-line border-y border-line text-[12px] uppercase">
            {[
              ["Booking", session.shopifyOrderId],
              ["Status", STATUS_LABEL[session.status] ?? "Design submitted"],
              ["Submitted", formatDateTime(session.finalizedAt)],
              ["Concept", `${design.version} of ${session.generations.length} created`],
              ["Try-on", session.tryOn ? "Completed" : "Not used"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-3">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <p className="text-[14px] font-medium uppercase">What happens next</p>
            <ol className="mt-4 space-y-4">
              {[
                ["Review", "Our atelier team reviews your design and specification."],
                ["Consultation", "We contact you to discuss details, measurements and a quotation."],
                ["Creation", "Once you're happy, your piece is made by the Wajie Ibrahim atelier."],
              ].map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[28px_1fr] gap-3">
                  <span className="text-[12px] tabular-nums text-muted">0{i + 1}</span>
                  <span>
                    <span className="block text-[12px] font-medium uppercase">{t}</span>
                    <span className="block text-[12px] text-muted">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <ButtonLink href="/" className="sm:min-w-[220px]">
              Continue shopping
            </ButtonLink>
            <ButtonLink href={WAJIE_LINKS.contact} external variant="outline" className="sm:min-w-[220px]">
              Contact our team
            </ButtonLink>
          </div>

          <div className="mt-8">
            <Accordion title="Design specification">
              <SpecList spec={design.specification} dense />
            </Accordion>
          </div>
        </div>
      </div>

      {/* Presenter link for the staff meeting (not part of the production customer page). */}
      <aside className="mt-16 flex flex-col gap-2 border-t border-line pt-5 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Demo: see how this submission reaches Wajie&apos;s team inside the Shopify order.</p>
        <Link
          href={`/mock-shopify-admin/${orderSlug(session.shopifyOrderId ?? "")}`}
          className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap uppercase text-ink underline underline-offset-4"
        >
          Shopify Admin preview <ArrowRightIcon size={14} />
        </Link>
      </aside>
    </div>
  );
}
