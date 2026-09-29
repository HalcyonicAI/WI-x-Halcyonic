import type { WajieGuideline } from "../types";

/**
 * ⚠️ PLACEHOLDER BRAND KNOWLEDGE — written by Halcyonic for the v0.1 mock only.
 *
 * In production this corpus is replaced by Wajie-approved material (lookbooks,
 * atelier guidelines, fabric library, past bespoke briefs) indexed by the Wajie RAG
 * pipeline. Nothing here is an official Wajie Ibrahim guideline until reviewed by
 * Wajie's team.
 */
export const WAJIE_GUIDELINES: WajieGuideline[] = [
  {
    id: "house-line",
    topic: "House silhouette",
    guidance: "Favour clean, elongated lines with modest coverage: full-length hems and long sleeves by default.",
    customerNote: "Kept a full-length hem and long sleeves for a graceful, modest line.",
    tags: { always: true },
  },
  {
    id: "kurung-structure",
    topic: "Baju Kurung construction",
    guidance: "Keep an easy bodice with side panels; modern cuts may slim the sleeve and soften the kain into an A-line.",
    customerNote: "Balanced an easy, comfortable bodice with a softly shaped kain.",
    tags: { garments: ["baju-kurung"] },
  },
  {
    id: "kebaya-structure",
    topic: "Kebaya construction",
    guidance: "Shape the kebaya through bodice and waist with a front opening fastened by kerongsang; pair with a sarong or straight kain.",
    customerNote: "Shaped through the waist with a front opening finished with kerongsang brooches.",
    tags: { garments: ["kebaya"] },
  },
  {
    id: "gown-structure",
    topic: "Gown proportions",
    guidance: "Keep necklines modest and introduce volume below the waist rather than at the bodice.",
    customerNote: "Kept the neckline modest and let the volume begin below the waist.",
    tags: { garments: ["dress-gown", "other"] },
  },
  {
    id: "jubah-structure",
    topic: "Jubah movement",
    guidance: "Let the jubah fall from the shoulder; define shape through the sleeve and embellishment rather than tight tailoring.",
    customerNote: "Let the jubah fall freely from the shoulder, with shape defined through the sleeves.",
    tags: { garments: ["jubah"] },
  },
  {
    id: "embroidery-placement",
    topic: "Embroidery placement",
    guidance: "Concentrate embroidery at cuffs, neckline and hem to frame the silhouette; avoid all-over coverage on light fabrics.",
    customerNote: "Placed embroidery to frame the silhouette rather than cover it.",
    tags: { details: ["embroidery"] },
  },
  {
    id: "beading-accent",
    topic: "Hand-beading",
    guidance: "Use hand-beading as an accent clustered at the neckline or bodice so it catches light without adding weight.",
    customerNote: (brief) =>
      `Used ${brief.details.includes("beading") ? "beading" : "sequins"} as a light-catching accent rather than all-over coverage.`,
    tags: { details: ["beading", "sequins"] },
  },
  {
    id: "lace-panels",
    topic: "Lace usage",
    guidance: "Use lace as panels or trims over a solid lining for opacity.",
    customerNote: "Set the lace over a solid lining so the piece stays opaque and modest.",
    tags: { details: ["lace"], fabrics: ["lace"] },
  },
  {
    id: "songket-statement",
    topic: "Songket",
    guidance: "Treat songket as the statement textile; pair it with a solid fabric in a complementary tone.",
    customerNote: "Paired the songket with a solid fabric so the weave remains the focal point.",
    tags: { fabrics: ["songket"] },
  },
  {
    id: "chiffon-layering",
    topic: "Chiffon",
    guidance: "Layer chiffon over a satin lining for opacity and movement.",
    customerNote: (brief) =>
      `Layered the ${brief.fabric === "organza" ? "organza" : "chiffon"} over a soft satin lining for movement and opacity.`,
    tags: { fabrics: ["chiffon", "organza"] },
  },
  {
    id: "sheen-restraint",
    topic: "Satin and silk",
    guidance: "Satin and silk carry their own sheen; keep embellishment restrained and let the fabric lead.",
    customerNote: "Kept the embellishment restrained so the fabric's natural sheen leads.",
    tags: { fabrics: ["satin", "silk"] },
  },
  {
    id: "bridal-palette",
    topic: "Bridal & engagement",
    guidance: "Bridal and engagement pieces favour ivory, champagne and blush with soft metallic accents.",
    customerNote: "Softened the palette with light-catching accents suited to a celebration.",
    tags: { occasions: ["wedding", "engagement"] },
    when: (brief) => brief.isBridal || brief.accent !== null,
  },
  {
    id: "raya-comfort",
    topic: "Raya",
    guidance: "Raya pieces welcome richer colour and must stay comfortable for long days of visiting.",
    customerNote: "Designed for comfort through a long day of Raya visits.",
    tags: { occasions: ["raya"] },
  },
  {
    id: "evening-depth",
    topic: "Evening wear",
    guidance: "Evening pieces can carry deeper tones and a little more sheen.",
    customerNote: "Added a touch of sheen suited to an evening setting.",
    tags: { occasions: ["formal", "dinner"] },
  },
  {
    id: "everyday-ease",
    topic: "Everyday wear",
    guidance: "Everyday pieces prioritise breathable fabrics, easy movement and minimal detailing.",
    customerNote: "Prioritised easy movement and breathable fabric for everyday wear.",
    tags: { occasions: ["everyday"] },
  },
  {
    id: "minimal-focus",
    topic: "Minimal designs",
    guidance: "Minimal designs rely on cut and fabric — one focal detail at most.",
    customerNote: (brief) =>
      brief.details.every((d) => d === "minimal")
        ? "Let the cut and fabric lead, with a clean finish."
        : "Let the cut and fabric lead, with a single focal detail.",
    tags: { styles: ["minimalist"], details: ["minimal"] },
  },
  {
    id: "statement-one",
    topic: "Statement designs",
    guidance: "Statement designs allow one bold element — volume, sleeve or embellishment — not all three.",
    customerNote: "Chose one bold element so the design feels confident rather than busy.",
    tags: { styles: ["statement"] },
  },
  {
    id: "pleat-placement",
    topic: "Pleats",
    guidance: "Place pleats on the kain front (ombak mayang) or as soft pleating through the skirt.",
    customerNote: "Placed soft pleats through the skirt for gentle movement.",
    tags: { details: ["pleats"] },
  },
  {
    id: "drape-movement",
    topic: "Draping",
    guidance: "Use draping across the bodice or as a shoulder panel to add movement.",
    customerNote: "Added a draped panel across the bodice for movement.",
    tags: { details: ["draping"] },
  },
  {
    id: "traditional-respect",
    topic: "Traditional pieces",
    guidance: "Respect traditional proportions; modernise through colour and finishing rather than cut.",
    customerNote: "Kept traditional proportions and refreshed the piece through colour and finishing.",
    tags: { styles: ["traditional"] },
  },
];
