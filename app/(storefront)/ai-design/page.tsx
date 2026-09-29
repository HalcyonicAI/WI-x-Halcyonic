import type { Metadata } from "next";
import { Suspense } from "react";
import { Accordion } from "@/components/ui/Accordion";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { BookingCTA, BookingPanel, LockedNotice } from "@/components/ai-design/BookingPanel";
import { SAMPLE_CONCEPTS } from "@/lib/ai/samples";
import { WAJIE_LINKS } from "@/lib/brand/assets";
import { BOOKING_PRICE_MYR, BOOKING_PRICE_SHORT, DEFAULT_LIMITS } from "@/lib/usage/quota";
import { formatMYR } from "@/lib/utils";

export const metadata: Metadata = { title: "AI Custom Design" };

const INCLUDED = [
  {
    label: `${DEFAULT_LIMITS.generationLimit} design generations`,
    text: `Your first design, plus ${DEFAULT_LIMITS.generationLimit - 1} refinements or new variations.`,
  },
  { label: `${DEFAULT_LIMITS.tryOnLimit} virtual try-on`, text: "Preview your chosen design on your own photo." },
  { label: "Submitted to our atelier", text: "Your final design is sent to Wajie's team for review." },
];

const STEPS = [
  { n: "01", title: "Book", text: `Reserve your AI design session for ${BOOKING_PRICE_SHORT} through our secure checkout.` },
  { n: "02", title: "Describe", text: "Choose the garment, occasion, colours, fabric and the details you love." },
  { n: "03", title: "Refine", text: "Review your design, adjust it or explore a new variation, then try it on." },
  { n: "04", title: "Submit", text: "Send your final design to our atelier team, who will follow up with you." },
];

/** Booking entry, built as a storefront product page (mirrors /products/online-meeting). */
export default function AIDesignEntryPage() {
  return (
    <>
      <Suspense fallback={null}>
        <LockedNotice />
      </Suspense>
      <section className="grid border-t border-black lg:grid-cols-2">
        {/* Gallery */}
        <div className="bg-white">
          <div className="no-scrollbar flex snap-x snap-mandatory gap-1 overflow-x-auto lg:grid lg:grid-cols-2 lg:overflow-visible">
            {SAMPLE_CONCEPTS.map((s, i) => (
              <figure key={s.title} className="relative w-[82%] shrink-0 snap-start sm:w-[48%] lg:w-auto">
                <RemoteImage
                  src={s.image}
                  alt={`Sample AI design concept: ${s.title}`}
                  loading={i < 2 ? "eager" : "lazy"}
                  className="aspect-[2/3] w-full object-cover"
                />
                <figcaption className="absolute bottom-2.5 left-3 bg-white/85 px-2 py-1 text-[10px] uppercase tracking-wide">
                  Sample concept
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Product information */}
        <div className="bg-panel">
          <div className="px-5 py-10 sm:px-12 lg:sticky lg:top-[101px] lg:px-14 lg:py-[50px] xl:px-20">
            <div className="max-w-[460px]">
              <p className="text-[12px] uppercase text-muted">Bespoke · New</p>
              <h1 className="wi-h-product mt-2">AI Custom Design</h1>
              <p className="mt-5 text-[12px]">BOOKING FEE :</p>
              <p className="mt-3 text-[14px] font-light uppercase tracking-[0.03em]">{formatMYR(BOOKING_PRICE_MYR)}</p>

              <p className="mt-6 text-[12px] leading-[1.6]">
                Design a piece that is entirely yours. Tell us about the occasion, colours, fabric and details you have in
                mind, and receive a Wajie Ibrahim design concept to refine, try on and submit to our atelier team.
              </p>

              <div className="my-7 border-t border-line" />

              <ul className="space-y-4">
                {INCLUDED.map((item) => (
                  <li key={item.label} className="grid grid-cols-[14px_1fr] gap-3">
                    <span className="mt-[5px] size-2 bg-black" aria-hidden="true" />
                    <span>
                      <span className="block text-[12px] font-medium uppercase">{item.label}</span>
                      <span className="block text-[12px] text-muted">{item.text}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <BookingPanel />
              </div>

              <p className="mt-6 text-[12px]">
                Prefer to meet our team?{" "}
                <a href={WAJIE_LINKS.bookAppointment} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  Book a bespoke appointment
                </a>
              </p>

              <div className="mt-8">
                <Accordion title="Description">
                  <p>
                    AI Custom Design is Wajie Ibrahim&apos;s guided design service. Your answers are interpreted by our AI
                    design studio using Wajie&apos;s design direction, and turned into a design concept with a full
                    specification — silhouette, fabric, colour and finishing.
                  </p>
                  <p className="mt-3">
                    You can refine your design, explore a new variation and see it on your own photo before submitting it to
                    our atelier team.
                  </p>
                </Accordion>
                <Accordion title="What's included">
                  <ul className="list-disc space-y-1 pl-4">
                    <li>
                      {DEFAULT_LIMITS.generationLimit} design generations — 1 initial design and up to{" "}
                      {DEFAULT_LIMITS.generationLimit - 1} modifications or regenerations
                    </li>
                    <li>{DEFAULT_LIMITS.tryOnLimit} virtual try-on using your own photo</li>
                    <li>Your final design and specification, linked to your booking order</li>
                    <li>Review of your submitted design by Wajie&apos;s team</li>
                  </ul>
                </Accordion>
                <Accordion title="How it works">
                  <ol className="list-decimal space-y-1 pl-4">
                    {STEPS.map((s) => (
                      <li key={s.n}>
                        <span className="font-medium">{s.title}.</span> {s.text}
                      </li>
                    ))}
                  </ol>
                </Accordion>
                <Accordion title="Good to know">
                  <ul className="list-disc space-y-1 pl-4">
                    <li>AI designs are concepts to guide your bespoke consultation.</li>
                    <li>Final garments, measurements and pricing are confirmed by Wajie&apos;s atelier team.</li>
                    <li>The booking fee covers your AI design session only.</li>
                    <li>Photos you upload are used only to create your design and try-on preview.</li>
                  </ul>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pt-20 sm:px-8">
        <h2 className="wi-h-section text-center">How it works</h2>
        <ol className="mx-auto mt-10 grid max-w-[1400px] gap-px bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="bg-white p-6 sm:p-8">
              <p className="text-[12px] text-muted">{s.n}</p>
              <p className="mt-6 text-[14px] font-medium uppercase">{s.title}</p>
              <p className="mt-2 text-[12px] leading-[1.6] text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex justify-center">
          <BookingCTA />
        </div>
      </section>
    </>
  );
}
