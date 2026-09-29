"use client";

import { useState } from "react";
import { ArrowRightIcon, FacebookIcon, InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/ui/icons";
import { WAJIE_CONTACT_EMAIL, WAJIE_LINKS, WAJIE_SOCIAL } from "@/lib/brand/assets";

const SOCIAL = [
  { label: "Facebook", href: WAJIE_SOCIAL.facebook, Icon: FacebookIcon },
  { label: "Instagram", href: WAJIE_SOCIAL.instagram, Icon: InstagramIcon },
  { label: "Youtube", href: WAJIE_SOCIAL.youtube, Icon: YoutubeIcon },
  { label: "Tiktok", href: WAJIE_SOCIAL.tiktok, Icon: TiktokIcon },
];

/**
 * Replica of the live storefront footer (black divider, newsletter, three link columns,
 * © line). Links open the live site in a new tab; the newsletter form is demo-only.
 * The only addition is the discreet "AI experience powered by Halcyonic AI" credit.
 */

const COLUMNS: { title: string[]; links: { label: string; href: string }[] }[] = [
  {
    title: ["Do you need", "our assistance?"],
    links: [
      { label: "Write us on WhatsApp", href: WAJIE_LINKS.contact },
      { label: "Contacts", href: WAJIE_LINKS.contact },
      { label: "FAQ", href: WAJIE_LINKS.faq },
      { label: "Sitemap", href: WAJIE_LINKS.home },
    ],
  },
  {
    title: ["Exclusive", "service"],
    links: [
      { label: "Custom Couture", href: WAJIE_LINKS.bespoke },
      { label: "WiGather Program", href: WAJIE_LINKS.home },
      { label: "Track your order", href: WAJIE_LINKS.home },
      { label: "Returns", href: WAJIE_LINKS.home },
    ],
  },
  {
    title: ["Legal terms", "and conditions"],
    links: [
      { label: "Legal notice", href: WAJIE_LINKS.home },
      { label: "Privacy policy", href: WAJIE_LINKS.home },
      { label: "Cookie policy", href: WAJIE_LINKS.home },
      { label: "Terms of sales", href: WAJIE_LINKS.home },
    ],
  },
];

export function SiteFooter() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="mt-auto px-4 pb-8 pt-16 sm:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="border-t border-black" />
        <div className="grid gap-10 pt-14 md:grid-cols-[1.2fr_1fr] lg:grid-cols-[1.35fr_0.9fr_0.7fr_0.8fr]">
          <div className="max-w-[380px]">
            <p className="text-[14px] font-light uppercase leading-[1.1] tracking-[0.03em]">
              Subscribe to our newsletter
              <br />
              and get promotion updates.
            </p>
            <form
              className="mt-5"
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
              }}
            >
              <label htmlFor="footer-email" className="sr-only">
                Email
              </label>
              <div className="flex items-center rounded-[10px] border-4 border-black/[0.13] bg-white">
                <input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="Email address"
                  className="min-w-0 flex-1 bg-transparent px-6 py-3.5 text-[16px] outline-none placeholder:text-ink/70"
                />
                <button type="submit" aria-label="Subscribe" className="grid size-12 place-items-center">
                  <ArrowRightIcon size={20} />
                </button>
              </div>
            </form>
            <p className="mt-4 text-[12px] leading-[1.6]" aria-live="polite">
              {subscribed
                ? "Thank you. (Demo only — no email was stored or sent.)"
                : 'By clicking on "Subscribe", you confirm that you have read and understood our Privacy Policy and that you want to receive the newsletter and other marketing communication as set out therein.'}
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title[0]}>
              <p className="text-[14px] font-light uppercase leading-[1.1] tracking-[0.03em]">
                {col.title[0]}
                <br />
                {col.title[1]}
              </p>
              <ul className="mt-5 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noreferrer" className="text-[12px] uppercase hover:underline">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 text-[12px]">
          <a href={`mailto:${WAJIE_CONTACT_EMAIL.toLowerCase()}`} className="hover:underline">
            {WAJIE_CONTACT_EMAIL}
          </a>
        </p>
        <div className="mt-3 border-t border-black" />
        <div className="flex items-center justify-between gap-4 pt-5 text-[12px]">
          <div>
            <p>© 2026 Wajie Ibrahim</p>
            <p className="mt-0.5 text-[11px] text-subtle">AI experience powered by Halcyonic AI</p>
          </div>
          <ul className="flex items-center">
            {SOCIAL.map(({ label, href, Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid size-10 place-items-center text-black/60 hover:text-black">
                  <Icon size={20} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
