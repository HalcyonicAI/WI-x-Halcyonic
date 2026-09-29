/**
 * Wajie Ibrahim brand assets.
 *
 * For the approval mock these point at Wajie's own public Shopify CDN so the demo
 * looks native. Every usage has a graceful fallback (typographic wordmark / neutral
 * block) so the demo still works offline.
 *
 * Before production: replace with assets supplied by Wajie (placed in /public/brand).
 */
const CDN = "https://www.wajieibrahim.com/cdn/shop/files";

export const WAJIE_ASSETS = {
  logo: `${CDN}/logo_main.png?height=160`,
  bespokeHero: `${CDN}/CCHERO3.webp?width=1800`,
  walkInBoutique: `${CDN}/1_b9007c2e-5d12-4789-9260-39be226325a9.jpg?width=900`,
  onlineMeeting: `${CDN}/2_ce09d04f-4e4e-487d-a1e6-f5832b5361d8.jpg?width=900`,
  inHouseVisit: `${CDN}/3_ce215bc3-0625-48a9-8bc4-329533198b73.jpg?width=900`,
} as const;

/** Links back to the live storefront (open in a new tab from the mock). */
export const WAJIE_LINKS = {
  home: "https://www.wajieibrahim.com/",
  shop: "https://www.wajieibrahim.com/collections",
  about: "https://www.wajieibrahim.com/pages/about-wi",
  bespoke: "https://www.wajieibrahim.com/pages/bespoke",
  bookAppointment: "https://www.wajieibrahim.com/collections/custom-couture-booking",
  walkInBoutique: "https://www.wajieibrahim.com/products/walk-in-boutique",
  onlineMeeting: "https://www.wajieibrahim.com/products/online-meeting",
  inHouseVisit: "https://www.wajieibrahim.com/products/in-house-visit",
  faq: "https://www.wajieibrahim.com/pages/faq",
  contact: "https://www.wajieibrahim.com/pages/contact",
} as const;

export const WAJIE_CONTACT_EMAIL = "CONTACT@WAJIEIBRAHIM.COM";

/** Social profiles as linked from the live footer. */
export const WAJIE_SOCIAL = {
  facebook: "https://www.facebook.com/p/Wajie-Ibrahim-100050204661990/",
  instagram: "https://www.instagram.com/wajieibrahim/",
  youtube: "https://www.youtube.com/@WAJIE.IBRAHIM",
  tiktok: "https://www.tiktok.com/@wajieibrahim",
} as const;
