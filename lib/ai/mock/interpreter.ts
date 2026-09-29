import type {
  DesignRequestPayload,
  DesignVariant,
  DetailOption,
  Fabric,
  GarmentType,
  Occasion,
} from "@/types/design";
import { findColour, garmentLabel, labelFor, occasionLabel, PRIMARY_COLOURS, STYLES } from "@/lib/catalog/options";
import { capitalise, hashString, joinNatural, lowerFirst, pick } from "@/lib/utils";
import type { DesignConcept, DesignInterpreter, InterpretedBrief, Motif, Placement, WajieContext } from "../types";
import type { RenderGarment, RenderParams } from "../render/params";

/**
 * MOCK of GPT-6 Luna. Deterministically turns the form + free-text notes into a brief
 * and a structured specification. The real adapter will call GPT with the Wajie RAG
 * context and a JSON schema for `DesignSpecification`; the output shape stays the same.
 */

// ── Interpretation ────────────────────────────────────────────────────────────

const PLACEMENT_CUES: [RegExp, Placement][] = [
  [/\b(cuffs?|wrists?)\b/g, "cuffs"],
  [/\b(hem|hemline|hems)\b/g, "hem"],
  [/\b(neck|neckline|collar)\b/g, "neckline"],
  [/\bsleeves?\b/g, "sleeves"],
  [/\b(bodice|chest|front panel)\b/g, "bodice"],
  [/\b(skirt|kain|sarong)\b/g, "skirt"],
  [/\b(waist|belt)\b/g, "waist"],
];

/** "no …", "not …", "without …" within a few words before a placement word negates it. */
const NEGATION = /\b(no|not|without|avoid|except|plain|don'?t|nothing)\b(\s+\S+){0,4}\s*$/;

function detectPlacements(notes: string): { wanted: Placement[]; avoid: Placement[] } {
  const wanted = new Set<Placement>();
  const avoid = new Set<Placement>();
  for (const [re, placement] of PLACEMENT_CUES) {
    for (const m of notes.matchAll(re)) {
      const before = notes.slice(Math.max(0, (m.index ?? 0) - 40), m.index);
      (NEGATION.test(before) ? avoid : wanted).add(placement);
    }
  }
  for (const a of avoid) wanted.delete(a);
  return { wanted: [...wanted], avoid: [...avoid] };
}

function detectMotif(notes: string): Motif {
  if (/\b(floral|flowers?|bunga|roses?|petals?|blossoms?|botanical)\b/.test(notes)) return "floral";
  if (/\b(geometric|pucuk rebung|diamonds?|lines|songket motif|pattern)\b/.test(notes)) return "geometric";
  if (/\b(tonal|tone[- ]on[- ]tone|same colou?r)\b/.test(notes)) return "tonal";
  return "floral";
}

function detectIntensity(notes: string, styles: string[]): InterpretedBrief["intensity"] {
  if (/\b(subtle|soft|delicate|simple|understated|light|minimal|clean)\b/.test(notes)) return "subtle";
  if (/\b(bold|grand|dramatic|heavy|luxurious|glamorous|full)\b/.test(notes)) return "bold";
  if (styles.includes("statement")) return "bold";
  if (styles.includes("minimalist")) return "subtle";
  return "balanced";
}

function detectBridal(notes: string, occasion: Occasion): boolean {
  if (occasion !== "wedding" && occasion !== "engagement") return false;
  if (/\b(sister|brother|friend|cousin|guest|family)('?s)?\b/.test(notes)) return false;
  return /\b(my (own )?(wedding|nikah|akad|reception|engagement|tunang)|bride|bridal|nikah|akad nikah)\b/.test(notes);
}

/** A clean noun for generated copy: "Gown", not "Dress / Gown"; a short name for "Other". */
function garmentNoun(g: GarmentType, other?: string): string {
  if (g === "dress-gown") return "Gown";
  if (g !== "other") return garmentLabel(g);
  const words = (other ?? "")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .trim()
    .replace(/^(a|an|the|my|one)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length || words.length > 3) return "Custom Piece";
  return words.map((w) => capitalise(w.toLowerCase())).join(" ");
}

async function interpretDesignRequest(request: DesignRequestPayload): Promise<InterpretedBrief> {
  const notes = request.additionalRequest.toLowerCase();
  const primary = findColour(request.primaryColour) ?? PRIMARY_COLOURS[3];
  const accent = findColour(request.secondaryColour) ?? null;
  const details: DetailOption[] = request.details.length ? request.details : ["minimal"];
  const placements = detectPlacements(notes);

  return {
    request,
    garment: request.garmentType,
    garmentName: garmentLabel(request.garmentType, request.garmentOther),
    garmentNoun: garmentNoun(request.garmentType, request.garmentOther),
    occasionName: occasionLabel(request.occasion, request.occasionOther),
    primary,
    accent: accent && accent.id !== primary.id ? accent : null,
    styles: request.style,
    fabric: request.fabric,
    fit: request.fit,
    details,
    requestedPlacements: placements.wanted,
    avoidPlacements: placements.avoid,
    motif: detectMotif(notes),
    intensity: detectIntensity(notes, request.style),
    isBridal: detectBridal(notes, request.occasion),
    notes: request.additionalRequest.trim(),
  };
}

// ── Construction catalogue ────────────────────────────────────────────────────

type Choice = { key: string; label: string; short: string };

const NECKLINES: Record<RenderGarment, Choice[]> = {
  "baju-kurung": [
    { key: "round", label: "Round neckline with a short front slit", short: "Round neckline" },
    { key: "cekak-musang", label: "Cekak musang collar with a buttoned placket", short: "Cekak musang collar" },
    { key: "teluk-belanga", label: "Teluk belanga neckline with a fine stitched edge", short: "Teluk belanga neckline" },
    { key: "soft-v", label: "Soft V-neckline", short: "Soft V-neckline" },
  ],
  kebaya: [
    { key: "kebaya-v", label: "Front opening with a V-neckline, fastened with three kerongsang", short: "Kerongsang front" },
    { key: "kebaya-nyonya", label: "Nyonya-inspired front with a softly curved, pointed hem", short: "Nyonya front" },
    { key: "kebaya-collar", label: "Front opening with a narrow shawl collar", short: "Shawl collar" },
  ],
  gown: [
    { key: "high-round", label: "High round neckline", short: "High neckline" },
    { key: "sweetheart-yoke", label: "Modest sweetheart neckline beneath a sheer yoke", short: "Sheer-yoke sweetheart" },
    { key: "boat", label: "Wide boat neckline", short: "Boat neckline" },
  ],
  jubah: [
    { key: "placket", label: "Round neckline with a front placket", short: "Placket neckline" },
    { key: "mandarin", label: "Mandarin collar with a concealed placket", short: "Mandarin collar" },
    { key: "round", label: "Clean round neckline", short: "Round neckline" },
  ],
};

const SLEEVES: Record<RenderGarment, Choice[]> = {
  "baju-kurung": [
    { key: "straight", label: "Long straight sleeves", short: "Straight sleeves" },
    { key: "bell", label: "Long sleeves with a gently flared cuff", short: "Flared cuffs" },
    { key: "bishop", label: "Long bishop sleeves gathered into a slim cuff", short: "Bishop sleeves" },
  ],
  kebaya: [
    { key: "fitted", label: "Long fitted sleeves", short: "Fitted sleeves" },
    { key: "bell", label: "Long sleeves with a softly flared cuff", short: "Flared cuffs" },
    { key: "straight", label: "Long straight sleeves", short: "Straight sleeves" },
  ],
  gown: [
    { key: "sheer", label: "Long sheer sleeves", short: "Sheer sleeves" },
    { key: "bell", label: "Long bell sleeves", short: "Bell sleeves" },
    { key: "puff", label: "Long sleeves with a softly puffed shoulder", short: "Puffed shoulder" },
  ],
  jubah: [
    { key: "bell", label: "Long bell sleeves", short: "Bell sleeves" },
    { key: "straight", label: "Long straight sleeves", short: "Straight sleeves" },
    { key: "bishop", label: "Long bishop sleeves with a slim cuff", short: "Bishop sleeves" },
  ],
};

/** Skirts chosen by variation; gowns also have fit-driven skirts (empire / mermaid). */
const SKIRTS: Record<RenderGarment, Choice[]> = {
  "baju-kurung": [
    { key: "a-line", label: "A-line kain", short: "A-line kain" },
    { key: "ombak", label: "Kain with ombak mayang side pleats", short: "Ombak mayang kain" },
    { key: "straight", label: "Straight kain with a front pleat", short: "Straight kain" },
  ],
  kebaya: [
    { key: "sarong", label: "Wrap sarong with a front fold", short: "Wrap sarong" },
    { key: "straight", label: "Straight kain", short: "Straight kain" },
    { key: "mermaid", label: "Kain with a gently flared mermaid hem", short: "Mermaid kain" },
  ],
  gown: [
    { key: "a-line", label: "Floor-length A-line skirt", short: "A-line skirt" },
    { key: "train", label: "A-line skirt with a short sweep train", short: "Sweep train" },
  ],
  jubah: [{ key: "a-line", label: "Flowing A-line fall", short: "A-line fall" }],
};
const GOWN_MERMAID: Choice = { key: "mermaid", label: "Fitted through the hip, flaring into a mermaid hem", short: "Mermaid skirt" };
const GOWN_EMPIRE: Choice = { key: "empire", label: "Flowing skirt from an empire waist", short: "Empire skirt" };

const SILHOUETTES: Record<RenderGarment, Record<"relaxed" | "regular" | "fitted", string>> = {
  "baju-kurung": {
    relaxed: "Relaxed contemporary Baju Kurung with an easy, straight-cut top",
    regular: "Classic Baju Kurung with a softly tailored top",
    fitted: "Modern fitted Baju Kurung with a gently shaped waist",
  },
  kebaya: {
    relaxed: "Kebaya labuh with a longer, relaxed line",
    regular: "Kebaya panjang with a gently shaped waist",
    fitted: "Fitted kebaya sculpted through the waist",
  },
  gown: {
    relaxed: "Flowing gown with an empire waist",
    regular: "Floor-length gown with a defined waist",
    fitted: "Fitted bodice with a softly flared mermaid skirt",
  },
  jubah: {
    relaxed: "Flowing A-line jubah that falls from the shoulder",
    regular: "Classic jubah with a softly defined waist",
    fitted: "Tailored jubah with a belted waist",
  },
};

const LENGTHS: Record<RenderGarment, Record<"relaxed" | "regular" | "fitted", string>> = {
  "baju-kurung": {
    relaxed: "Knee-length baju over a full-length kain",
    regular: "Knee-length baju over a full-length kain",
    fitted: "Knee-length baju over a full-length kain",
  },
  kebaya: {
    relaxed: "Knee-length kebaya over a full-length kain",
    regular: "Thigh-length kebaya over a full-length kain",
    fitted: "Hip-length kebaya over a full-length kain",
  },
  gown: { relaxed: "Floor-length", regular: "Floor-length", fitted: "Floor-length" },
  jubah: { relaxed: "Full-length", regular: "Full-length", fitted: "Full-length" },
};

// ── Fabric ────────────────────────────────────────────────────────────────────

const FABRIC_SPEC: Record<Exclude<Fabric, "no-preference">, string> = {
  chiffon: "Chiffon layered over a satin lining",
  satin: "Satin with a soft sheen, fully lined",
  silk: "Silk with a silk-blend lining",
  lace: "Lace over a matching satin lining",
  songket: "Songket paired with a solid satin base",
  organza: "Organza overlay on a satin base",
};

const FINISHING: Record<Fabric, string> = {
  chiffon: "Fully lined, with a concealed zip and hand-finished rolled hems",
  satin: "Fully lined, with a concealed zip and clean-finished seams",
  silk: "Fully lined, with French seams and hand-finished hems",
  lace: "Lined throughout, with lace edges finished by hand",
  songket: "Songket edges bound in satin; lined throughout",
  organza: "Organza overlay with hand-rolled edges; lined throughout",
  "no-preference": "Fully lined, with a concealed zip and hand-finished hems",
};

/** When the customer has no fabric preference, recommend one for the occasion. */
function fabricFor(brief: InterpretedBrief): { render: Fabric; name: string; spec: string } {
  if (brief.fabric !== "no-preference") {
    return { render: brief.fabric, name: brief.fabric, spec: FABRIC_SPEC[brief.fabric] };
  }
  const o = brief.request.occasion;
  if (o === "everyday") return { render: "no-preference", name: "crepe", spec: "Recommended: soft, breathable crepe" };
  if (o === "formal" || o === "dinner") return { render: "satin", name: "satin", spec: "Recommended: satin with a soft sheen" };
  return { render: "chiffon", name: "chiffon", spec: "Recommended: chiffon layered over a satin lining" };
}

// ── Embellishment & placement ─────────────────────────────────────────────────

const PLACEMENT_PHRASE: Record<Placement, string> = {
  cuffs: "around the cuffs",
  hem: "along the hem",
  neckline: "at the neckline",
  bodice: "across the bodice",
  sleeves: "down the sleeves",
  skirt: "through the skirt",
  waist: "at the waist",
};

type Decorative = "embroidery" | "beading" | "lace" | "sequins";
const DECORATIVE: Decorative[] = ["embroidery", "beading", "lace", "sequins"];

/** Where each embellishment can be placed (matches what the concept renderer draws). */
function supported(d: Decorative, garment: RenderGarment): Placement[] {
  switch (d) {
    case "embroidery":
      return ["cuffs", "hem", "neckline", "sleeves", "bodice", "skirt", ...(garment === "gown" ? (["waist"] as Placement[]) : [])];
    case "beading":
      return ["neckline", "bodice", "cuffs", "hem"];
    case "lace":
      return ["hem", "cuffs", "bodice"];
    case "sequins":
      return ["bodice", "skirt", "hem", "cuffs"];
  }
}

function defaults(d: Decorative, garment: RenderGarment, intensity: InterpretedBrief["intensity"]): Placement[] {
  switch (d) {
    case "embroidery":
      return garment === "kebaya" || intensity === "bold" ? ["cuffs", "hem", "neckline"] : ["cuffs", "hem"];
    case "beading":
      return intensity === "bold" ? ["neckline", "bodice"] : ["neckline"];
    case "lace":
      return ["hem", "cuffs"];
    case "sequins":
      return ["bodice"];
  }
}

/** Requested placements the detail supports, minus anything ruled out — else sensible defaults. */
function placementsFor(d: Decorative, brief: InterpretedBrief, garment: RenderGarment): Placement[] {
  const allowed = supported(d, garment);
  const notAvoided = (p: Placement) => !brief.avoidPlacements.includes(p);
  const requested = brief.requestedPlacements.filter((p) => allowed.includes(p) && notAvoided(p));
  if (requested.length) return requested;
  const fallback = defaults(d, garment, brief.intensity).filter(notAvoided);
  return fallback.length ? fallback : allowed.filter(notAvoided).slice(0, 1);
}

function decorativePhrase(d: Decorative, brief: InterpretedBrief): string {
  if (d === "embroidery") {
    const intensity = brief.intensity === "subtle" ? "subtle " : brief.intensity === "bold" ? "rich " : "";
    const thread = brief.accent && /gold|silver/i.test(brief.accent.name) ? ` in ${brief.accent.name.toLowerCase()} thread` : "";
    return `${intensity}${brief.motif} embroidery${thread}`;
  }
  if (d === "beading") return "hand-placed pearl beading";
  if (d === "lace") return "scalloped lace trims";
  return "scattered sequin accents";
}

// ── Copy helpers ──────────────────────────────────────────────────────────────

const STYLE_TITLE: Record<string, string> = {
  modern: "Modern",
  traditional: "Classic",
  minimalist: "Minimal",
  elegant: "Elegant",
  romantic: "Romantic",
  statement: "Statement",
  contemporary: "Contemporary",
};

const FIT_WORD = { relaxed: "relaxed", regular: "softly tailored", fitted: "fitted" } as const;

/** Traditional garment names stay capitalised mid-sentence; generic nouns don't. */
const PROPER_GARMENTS = new Set(["Baju Kurung", "Kebaya", "Jubah"]);

function occasionPhrase(brief: InterpretedBrief): string {
  const o = brief.request.occasion;
  if (o === "wedding") return brief.isBridal ? "your wedding day" : "a wedding";
  if (o === "engagement") return brief.isBridal ? "your engagement" : "an engagement";
  if (o === "raya") return "Hari Raya";
  if (o === "formal") return "a formal event";
  if (o === "dinner") return "an evening dinner";
  if (o === "everyday") return "everyday wear";
  return brief.request.occasionOther?.trim() ? lowerFirst(brief.request.occasionOther.trim()) : "your occasion";
}

export function toRenderGarment(g: GarmentType): RenderGarment {
  if (g === "dress-gown" || g === "other") return "gown";
  return g;
}

function byKey(list: Choice[], key: string | undefined): Choice | undefined {
  return key ? list.find((c) => c.key === key) : undefined;
}

// ── Specification ─────────────────────────────────────────────────────────────

async function buildDesignSpecification(
  brief: InterpretedBrief,
  context: WajieContext,
  { variantIndex, base }: { variantIndex: number; base?: DesignVariant },
): Promise<DesignConcept> {
  const garment = toRenderGarment(brief.garment);
  // The construction is seeded by garment + fit only, so changing colour or fabric never
  // reshuffles the neckline or sleeves; regenerations advance `variantIndex`.
  const hashSeed = hashString([brief.garment, brief.fit, brief.styles.join()].join("|"));
  // A modification keeps the edited concept's construction when garment and fit are unchanged.
  const keep = base && base.garment === garment ? base : undefined;

  const neckline = byKey(NECKLINES[garment], keep?.neckline) ?? pick(NECKLINES[garment], (hashSeed % 7) + variantIndex);
  const sleeve = byKey(SLEEVES[garment], keep?.sleeve) ?? pick(SLEEVES[garment], ((hashSeed >> 3) % 5) + variantIndex * 2);

  let skirt: Choice;
  if (garment === "gown" && brief.fit === "fitted") skirt = GOWN_MERMAID;
  else if (garment === "gown" && brief.fit === "relaxed") skirt = GOWN_EMPIRE;
  else if (garment === "baju-kurung" && brief.details.includes("pleats")) skirt = SKIRTS[garment][1];
  else if (keep && keep.fit === brief.fit && byKey(SKIRTS[garment], keep.skirt)) skirt = byKey(SKIRTS[garment], keep.skirt)!;
  else if (garment === "gown") {
    const bridalTrain = brief.isBridal || brief.request.occasion === "wedding";
    skirt = bridalTrain && variantIndex % 2 === 1 ? SKIRTS.gown[1] : SKIRTS.gown[0];
  } else skirt = pick(SKIRTS[garment], ((hashSeed >> 5) % 3) + variantIndex);

  const fabric = fabricFor(brief);

  // One clause per embellishment, each with its own placements.
  const decorative = DECORATIVE.filter((d) => brief.details.includes(d));
  const detailPlacements = Object.fromEntries(decorative.map((d) => [d, placementsFor(d, brief, garment)])) as Record<
    Decorative,
    Placement[]
  >;
  const clauses = decorative.map(
    (d) => `${decorativePhrase(d, brief)} ${joinNatural(detailPlacements[d].map((p) => PLACEMENT_PHRASE[p]))}`,
  );
  if (brief.details.includes("pleats")) clauses.push("soft pleating through the skirt");
  if (brief.details.includes("draping")) clauses.push("a draped bodice panel");
  const isMinimal = clauses.length === 0;

  const detailNames = [
    ...decorative.map((d) => decorativePhrase(d, brief)),
    ...(brief.details.includes("pleats") ? ["soft pleating"] : []),
    ...(brief.details.includes("draping") ? ["a draped bodice panel"] : []),
  ];
  const placementText = isMinimal
    ? "Clean finish throughout — no surface embellishment"
    : decorative.length === 1 && clauses.length === 1
      ? capitalise(joinNatural(detailPlacements[decorative[0]].map((p) => PLACEMENT_PHRASE[p])))
      : clauses.map((c) => capitalise(c)).join(" · ");

  const colourText = brief.accent
    ? `${brief.primary.name} with ${brief.accent.name.toLowerCase()} accents`
    : `Tonal ${brief.primary.name.toLowerCase()}`;

  const noun = brief.garmentNoun;
  const nounInSentence = PROPER_GARMENTS.has(noun) ? noun : noun.toLowerCase();
  const adjective = brief.isBridal && garment === "gown" ? "Bridal" : STYLE_TITLE[brief.styles[0]] ?? "Signature";
  const title = `${adjective} ${brief.primary.name} ${noun}`;

  const styleWords = brief.styles.slice(0, 2).map((s) => s.toLowerCase());
  const lead = [FIT_WORD[brief.fit], ...styleWords].filter((w, i, arr) => arr.indexOf(w) === i);
  const leadText = lead.length > 1 ? `${lead[0]}, ${lead.slice(1).join(" and ")}` : lead[0];
  const article = /^[aeiou]/i.test(leadText) ? "An" : "A";
  // Clauses already contain "and" lists, so join them with ", plus" to keep the sentence readable.
  const clauseText = clauses.length > 1 ? `${clauses.slice(0, -1).join(", ")}, plus ${clauses[clauses.length - 1]}` : clauses[0];
  const finishText = isMinimal ? "kept clean and minimal so the cut and fabric lead" : `finished with ${clauseText}`;
  const accentText = brief.accent
    ? `, with ${brief.accent.name.toLowerCase()} accents that ${brief.intensity === "bold" ? "add richness" : "keep the look soft and refined"}`
    : "";
  const refText = brief.request.referenceImageCount > 0 ? " Inspired by the reference images you shared." : "";

  const summary =
    `${article} ${leadText} ${nounInSentence} in ${brief.primary.name.toLowerCase()} ${fabric.name}, ${finishText}. ` +
    `Designed for ${occasionPhrase(brief)}${accentText}. ` +
    `This concept features a ${lowerFirst(neckline.label)} and ${lowerFirst(sleeve.label)}.${refText}`;

  const specification = {
    garment: brief.garmentName,
    silhouette: SILHOUETTES[garment][brief.fit],
    neckline: neckline.label,
    sleeves: sleeve.label,
    length: skirt.key === "train" ? "Floor-length with a short sweep train" : `${LENGTHS[garment][brief.fit]} · ${skirt.label}`,
    fabric: fabric.spec,
    colour: colourText,
    details: isMinimal ? "Minimal detailing with a clean finish" : capitalise(joinNatural(detailNames)),
    placement: placementText,
    finishing: FINISHING[brief.fabric],
    occasion: `${brief.occasionName}${brief.isBridal ? " — bridal" : ""}`,
    style: brief.styles.map((s) => labelFor(STYLES, s)).join(" · "),
  };

  const seed = keep ? keep.seed : (hashSeed + variantIndex * 7919) % 1_000_000;
  const render: RenderParams = {
    garment,
    primary: brief.primary.hex.replace("#", ""),
    accent: brief.accent ? brief.accent.hex.replace("#", "") : null,
    fabric: fabric.render,
    fit: brief.fit,
    details: brief.details,
    placements: [...new Set(decorative.flatMap((d) => detailPlacements[d]))],
    detailPlacements,
    motif: brief.motif,
    neckline: neckline.key,
    sleeve: sleeve.key,
    skirt: skirt.key,
    mode: "concept",
    seed,
  };

  return {
    title,
    variationLabel: `${neckline.short} · ${sleeve.short} · ${skirt.short}`,
    summary,
    specification,
    designNotes: context.guidelines
      .slice(0, 3)
      .map((g) => (typeof g.customerNote === "function" ? g.customerNote(brief) : g.customerNote)),
    variant: { garment, fit: brief.fit, neckline: neckline.key, sleeve: sleeve.key, skirt: skirt.key, seed },
    render,
  };
}

export const mockInterpreter: DesignInterpreter = {
  interpretDesignRequest,
  buildDesignSpecification,
};
