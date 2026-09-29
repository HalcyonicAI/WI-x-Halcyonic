import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { ProductCard } from "@/components/storefront/ProductCard";
import { WAJIE_ASSETS, WAJIE_LINKS } from "@/lib/brand/assets";
import { SAMPLE_CONCEPTS } from "@/lib/ai/samples";
import { BOOKING_PRICE_MYR, DEFAULT_LIMITS } from "@/lib/usage/quota";
import { formatMYR } from "@/lib/utils";

export const metadata: Metadata = { title: "Bespoke" };

/**
 * Mock of the live /pages/bespoke page, showing where the new AI Custom Design
 * booking sits: alongside the existing RM100 bespoke booking products.
 */
export default function BespokePage() {
  return (
    <>
      <section aria-label="Bespoke" className="relative">
        <RemoteImage
          src={WAJIE_ASSETS.bespokeHero}
          alt="Hand-beading a bespoke Wajie Ibrahim piece"
          loading="eager"
          fetchPriority="high"
          className="aspect-[16/9] max-h-[78vh] w-full object-cover sm:aspect-[16/7]"
          fallback={<span className="text-[12px] uppercase tracking-wide text-muted">Bespoke</span>}
        />
      </section>

      <section className="px-0 pt-12 sm:pt-16">
        <h1 className="wi-h-page px-4 text-center">Bespoke Tailoring Booking</h1>
        <div className="mt-8 grid grid-cols-2 gap-1 sm:mt-10 lg:grid-cols-4">
          <ProductCard
            href="/ai-design"
            image={SAMPLE_CONCEPTS[0].image}
            title="AI Custom Design"
            price={formatMYR(BOOKING_PRICE_MYR)}
            badge="New"
            priority
          />
          <ProductCard href={WAJIE_LINKS.walkInBoutique} external image={WAJIE_ASSETS.walkInBoutique} title="Walk In Boutique" price="RM100.00" />
          <ProductCard href={WAJIE_LINKS.onlineMeeting} external image={WAJIE_ASSETS.onlineMeeting} title="Online Meeting" price="RM100.00" />
          <ProductCard href={WAJIE_LINKS.inHouseVisit} external image={WAJIE_ASSETS.inHouseVisit} title="In House Visit" price="RM100.00" />
        </div>
      </section>

      <section className="mt-20 border-y border-black bg-panel px-6 py-14 sm:px-14 lg:py-20">
        <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[1fr_minmax(0,420px)] lg:items-center lg:gap-20">
          <div>
            <p className="text-[12px] uppercase tracking-wide text-muted">New at Wajie Ibrahim</p>
            <h2 className="wi-h-section mt-3">AI Custom Design</h2>
            <p className="mt-5 max-w-[480px] text-[12px] leading-[1.6]">
              Imagine your piece before you meet our atelier. Choose the garment, occasion, colours, fabric and details, and
              receive a Wajie Ibrahim design concept to refine, try on and submit to our team.
            </p>
          </div>
          <div>
            <ul className="divide-y divide-black/15 border-y border-black/15 text-[12px] uppercase">
              <li className="flex justify-between py-3">
                <span>Booking fee</span>
                <span>{formatMYR(BOOKING_PRICE_MYR)}</span>
              </li>
              <li className="flex justify-between py-3">
                <span>Design generations</span>
                <span>{DEFAULT_LIMITS.generationLimit} included</span>
              </li>
              <li className="flex justify-between py-3">
                <span>Virtual try-on</span>
                <span>{DEFAULT_LIMITS.tryOnLimit} included</span>
              </li>
            </ul>
            <div className="mt-8">
              <ButtonLink href="/ai-design">Discover AI Custom Design</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
