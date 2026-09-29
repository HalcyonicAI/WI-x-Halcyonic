import type { DetailOption } from "@/types/design";
import type { RenderParams, RenderPlacement } from "./params";
import { darken, isMetallic, lighten, luminance, mix } from "./colour";
import { seededRandom } from "@/lib/utils";

/**
 * MOCK IMAGE RENDERER — stands in for FLUX (concept) and FASHN (try-on) in v0.1.
 *
 * Draws a deterministic, editorial fashion-illustration of the specified garment on a
 * faceless atelier figure (2:3, matching Wajie's product imagery). Every visual choice is
 * driven by RenderParams so results visibly respond to the customer's form.
 *
 * Canvas: 600 × 900. Everything left-of-centre is drawn once and mirrored where symmetric.
 */

const W = 600;
const H = 900;
const MIRROR = `matrix(-1 0 0 1 ${W} 0)`;
const INK = "#2A2420";

type Pt = [number, number];
interface Curve {
  x1: number;
  x2: number;
  y: number;
  /** y of the quadratic control point (control x is the centre line). */
  c: number;
}
interface Trapezoid {
  y0: number;
  y1: number;
  half0: number;
  half1: number;
}

interface Geometry {
  under: { d: string; fill: string }[];
  body: string;
  sleeve: string;
  sleeveSheer: boolean;
  hand: Pt;
  cuff: { a: Pt; b: Pt };
  hems: Curve[];
  neckline: Pt[];
  bodice: Trapezoid;
  skirt: Trapezoid;
  waist: { y: number; half: number } | null;
  folds: string[];
  underFolds: string[];
  overlays: string;
  songket: string[];
  /** Whether the songket panel sits on an under-piece (kain/skirt) or on the main body. */
  songketLayer: "under" | "over";
  feet: boolean;
}

// ── Shared figure pieces ──────────────────────────────────────────────────────

const NECK_TO_ARMPIT_L = "M 289,168 L 241,180 C 236,196 246,213 262,222";
const ARMPIT_TO_NECK_R = "C 354,213 364,196 359,180 L 311,168 Q 300,176 289,168 Z";

const SLEEVES: Record<string, { d: string; hand: Pt; cuff: { a: Pt; b: Pt } }> = {
  straight: {
    d: "M 241,180 C 227,190 222,230 220,300 C 218,360 216,410 216,452 L 247,454 C 249,410 251,360 253,300 C 255,262 258,238 262,222 C 254,212 246,198 241,180 Z",
    hand: [232, 470],
    cuff: { a: [217, 444], b: [247, 446] },
  },
  fitted: {
    d: "M 241,180 C 229,190 225,230 223,300 C 221,360 221,410 221,452 L 245,453 C 246,410 248,360 251,300 C 254,262 257,238 262,222 C 254,212 246,198 241,180 Z",
    hand: [233, 469],
    cuff: { a: [222, 444], b: [245, 445] },
  },
  bell: {
    d: "M 241,180 C 227,190 222,230 220,300 C 216,380 207,432 199,474 Q 227,488 257,472 C 254,420 253,360 253,300 C 255,262 258,238 262,222 C 254,212 246,198 241,180 Z",
    hand: [229, 486],
    cuff: { a: [203, 464], b: [254, 463] },
  },
  bishop: {
    d: "M 241,180 C 224,194 213,250 211,320 C 209,390 213,424 222,440 L 246,440 C 257,420 258,370 255,300 C 255,262 258,238 262,222 C 254,212 246,198 241,180 Z",
    hand: [234, 472],
    cuff: { a: [223, 447], b: [245, 447] },
  },
  sheer: {
    d: "M 241,180 C 226,190 220,230 218,300 C 216,360 214,410 214,452 L 249,454 C 251,410 253,360 255,300 C 256,262 258,238 262,222 C 254,212 246,198 241,180 Z",
    hand: [232, 470],
    cuff: { a: [215, 444], b: [249, 446] },
  },
  puff: {
    d: "M 241,180 C 227,190 222,230 220,300 C 218,360 216,410 216,452 L 247,454 C 249,410 251,360 253,300 C 255,262 258,238 262,222 C 254,212 246,198 241,180 Z",
    hand: [232, 470],
    cuff: { a: [217, 444], b: [247, 446] },
  },
};

const ARM_UNDER =
  "M 244,184 C 234,200 231,240 230,300 C 229,360 227,410 227,452 L 240,452 C 241,410 243,360 245,300 C 247,262 251,238 257,222 Z";

// ── Garment geometry ──────────────────────────────────────────────────────────

function bajuKurung(p: RenderParams, P: string): Geometry {
  const hw = { relaxed: 98, regular: 88, fitted: 78 }[p.fit];
  const hemY = 598;
  const sideL =
    p.fit === "fitted"
      ? `C 256,262 252,300 250,322 C 248,420 ${300 - hw + 6},520 ${300 - hw},${hemY}`
      : `C 252,300 ${300 - hw + 8},470 ${300 - hw},${hemY}`;
  const sideR =
    p.fit === "fitted"
      ? `C ${300 + hw - 6},520 352,420 350,322 C 348,300 344,262 338,222`
      : `C ${300 + hw - 8},470 348,300 338,222`;
  const body = `${NECK_TO_ARMPIT_L} ${sideL} Q 300,${hemY + 16} ${300 + hw},${hemY} ${sideR} ${ARMPIT_TO_NECK_R}`;

  const topHalf = Math.max(60, hw - 26);
  const kh = p.skirt === "a-line" ? 90 : p.skirt === "ombak" ? 80 : 70;
  const kain = `M ${300 - topHalf},560 C ${300 - topHalf - 4},650 ${300 - kh + 8},760 ${300 - kh},818 Q 300,830 ${300 + kh},818 C ${300 + kh - 8},760 ${300 + topHalf + 4},650 ${300 + topHalf},560 Z`;

  const underFolds =
    p.skirt === "ombak"
      ? [0, 1, 2, 3, 4].map((i) => `M ${316 + i * 7},604 C ${320 + i * 8},690 ${324 + i * 10},760 ${326 + i * 12},818`)
      : p.skirt === "straight"
        ? ["M 300,604 L 300,826", "M 291,606 C 290,700 288,760 287,824"]
        : ["M 276,606 C 272,690 266,760 258,818", "M 324,606 C 328,690 334,760 342,818", "M 300,606 L 300,826"];

  return {
    under: [{ d: kain, fill: "url(#shade)" }],
    body,
    ...sleeveOf(p.sleeve),
    hems: [
      { x1: 300 - hw, x2: 300 + hw, y: hemY, c: hemY + 16 },
      { x1: 300 - kh, x2: 300 + kh, y: 818, c: 830 },
    ],
    neckline: arcPoints(284, 316, 178, 196, 7),
    bodice: { y0: 206, y1: 300, half0: 36, half1: 44 },
    skirt: { y0: 630, y1: 800, half0: topHalf - 8, half1: kh - 14 },
    waist: null,
    folds: [
      `M 262,236 C 256,330 ${300 - hw + 22},480 ${300 - hw + 18},${hemY - 4}`,
      `M 338,236 C 344,330 ${300 + hw - 22},480 ${300 + hw - 18},${hemY - 4}`,
      "M 300,214 C 302,330 298,460 300,606",
    ],
    underFolds,
    overlays: kurungNeckline(p, P),
    songket: [kain],
    songketLayer: "under",
    feet: true,
  };
}

function kurungNeckline(p: RenderParams, P: string): string {
  const trim = trimColour(p, P);
  switch (p.neckline) {
    case "cekak-musang":
      return (
        `<path d="M 287,158 C 288,163 289,166 289,168 Q 300,176 311,168 C 311,166 312,163 313,158 Q 300,165 287,158 Z" fill="${darken(P, 0.1)}" stroke="${INK}" stroke-width="1.1" stroke-opacity=".75"/>` +
        line("M 300,174 L 300,244", INK, 1, 0.6) +
        [188, 207, 226].map((y) => `<circle cx="300" cy="${y}" r="2.6" fill="${trim}" stroke="${INK}" stroke-width=".6" stroke-opacity=".5"/>`).join("")
      );
    case "teluk-belanga":
      return (
        line("M 300,176 L 300,212", INK, 1, 0.6) +
        `<path d="M 290,170 Q 300,181 310,170" fill="none" stroke="${trim}" stroke-width="1.4" stroke-dasharray="2 2"/>` +
        `<circle cx="300" cy="181" r="2.8" fill="${trim}" stroke="${INK}" stroke-width=".6" stroke-opacity=".5"/>`
      );
    case "soft-v":
      return `<path d="M 290,169 L 300,200 L 310,169 Q 300,176 290,169 Z" fill="var(--skin)"/>${line("M 289,168 L 300,200 L 311,168", INK, 1.1, 0.7)}`;
    default:
      return line("M 300,176 L 300,208", INK, 1, 0.6);
  }
}

function kebaya(p: RenderParams, P: string, A: string | null): Geometry {
  const hemY = { relaxed: 590, regular: 520, fitted: 458 }[p.fit];
  const wh = { relaxed: 62, regular: 50, fitted: 42 }[p.fit];
  const hh = { relaxed: 88, regular: 76, fitted: 66 }[p.fit];
  const dip = p.neckline === "kebaya-nyonya" ? 30 : 14;
  const sideL = `C 256,262 ${300 - wh},292 ${300 - wh},320 C ${300 - wh - 2},372 ${300 - hh + 4},${hemY - 56} ${300 - hh},${hemY}`;
  const hem = `Q ${300 - hh * 0.42},${hemY + 6} 300,${hemY + dip} Q ${300 + hh * 0.42},${hemY + 6} ${300 + hh},${hemY}`;
  const sideR = `C ${300 + hh - 4},${hemY - 56} ${300 + wh + 2},372 ${300 + wh},320 C ${300 + wh},292 344,262 338,222`;
  const body = `${NECK_TO_ARMPIT_L} ${sideL} ${hem} ${sideR} ${ARMPIT_TO_NECK_R}`;

  const mermaid = p.skirt === "mermaid";
  const sarong = mermaid
    ? "M 246,320 C 238,380 238,420 240,470 C 244,560 250,620 250,660 C 246,730 222,790 206,832 Q 300,846 394,832 C 378,790 354,730 350,660 C 350,620 356,560 360,470 C 362,420 362,380 354,320 Z"
    : "M 246,320 C 238,380 236,420 236,470 C 236,600 234,720 234,818 Q 300,828 366,818 C 366,720 364,600 364,470 C 364,420 362,380 354,320 Z";
  const sarongFill = A && !isMetallic(A) ? "url(#shadeAccent)" : "url(#shadeDeep)";

  const vY = 248;
  let overlays = `<path d="M 289,168 L 300,${vY} L 311,168 Q 300,176 289,168 Z" fill="${lighten(P, 0.28)}"/>`;
  if (p.neckline === "kebaya-collar") {
    overlays += `<path d="M 289,168 L 300,${vY} L 305,${vY - 9} L 296,166 Z" fill="${darken(P, 0.12)}"/><path d="M 311,168 L 300,${vY} L 295,${vY - 9} L 304,166 Z" fill="${darken(P, 0.12)}"/>`;
  }
  overlays += line(`M 289,168 L 300,${vY} L 311,168`, INK, 1.1, 0.7);
  overlays += line(`M 300,${vY} C 303,300 303,${hemY - 40} 300,${hemY + dip}`, INK, 1.1, 0.7);
  for (const y of [262, 296, 330]) {
    if (y > hemY - 14) continue;
    overlays += brooch(302, y, isMetallic(A) ? A! : "#C8A862");
  }

  return {
    under: [{ d: sarong, fill: sarongFill }],
    body,
    ...sleeveOf(p.sleeve),
    hems: [
      { x1: 300 - hh, x2: 300 + hh, y: hemY, c: hemY + dip },
      mermaid ? { x1: 206, x2: 394, y: 832, c: 846 } : { x1: 234, x2: 366, y: 818, c: 828 },
    ],
    neckline: [
      [291, 176],
      [293, 190],
      [295, 204],
      [297, 218],
      [299, 232],
      [309, 176],
      [307, 190],
      [305, 204],
      [303, 218],
    ],
    bodice: { y0: 214, y1: Math.min(hemY - 20, 330), half0: 34, half1: wh - 6 },
    skirt: mermaid
      ? { y0: Math.max(hemY + 30, 520), y1: 810, half0: 52, half1: 82 }
      : { y0: Math.max(hemY + 30, 520), y1: 800, half0: 56, half1: 58 },
    waist: null,
    folds: [
      `M 270,330 C 266,380 ${300 - hh + 20},${hemY - 50} ${300 - hh + 16},${hemY - 4}`,
      `M 330,330 C 334,380 ${300 + hh - 20},${hemY - 50} ${300 + hh - 16},${hemY - 4}`,
    ],
    underFolds:
      p.skirt === "sarong"
        ? [`M 332,${hemY + 12} C 322,600 306,720 292,818`, `M 322,${hemY + 30} C 314,620 300,730 288,816`]
        : mermaid
          ? ["M 276,680 C 266,740 250,790 236,830", "M 324,680 C 334,740 350,790 364,830"]
          : [`M 300,${hemY + 16} L 300,822`],
    overlays,
    songket: [sarong],
    songketLayer: "under",
    feet: true,
  };
}

function gown(p: RenderParams, P: string, A: string | null): Geometry {
  const empire = p.skirt === "empire";
  const mermaid = p.skirt === "mermaid";
  const train = p.skirt === "train";
  const waistY = empire ? 260 : 320;
  const wh = empire ? 48 : mermaid ? 36 : 39;

  const body = `${NECK_TO_ARMPIT_L} C 258,248 ${300 - wh},${waistY - 36} ${300 - wh},${waistY} L ${300 + wh},${waistY} C ${300 + wh},${waistY - 36} 342,248 338,222 ${ARMPIT_TO_NECK_R}`;

  let skirt: string;
  let hem: Curve;
  if (mermaid) {
    skirt = `M ${300 - wh},${waistY - 4} C 250,360 242,410 244,460 C 246,540 258,600 256,650 C 250,720 212,800 172,844 Q 300,862 428,844 C 388,800 350,720 344,650 C 342,600 354,540 356,460 C 358,410 350,360 ${300 + wh},${waistY - 4} Z`;
    hem = { x1: 172, x2: 428, y: 844, c: 862 };
  } else if (empire) {
    skirt = `M ${300 - wh},${waistY - 4} C ${300 - wh - 14},360 196,690 156,842 Q 300,860 444,842 C 404,690 ${300 + wh + 14},360 ${300 + wh},${waistY - 4} Z`;
    hem = { x1: 156, x2: 444, y: 842, c: 860 };
  } else {
    skirt = `M ${300 - wh},${waistY - 4} C ${300 - wh - 20},420 194,700 150,840 Q 300,860 450,840 C 406,700 ${300 + wh + 20},420 ${300 + wh},${waistY - 4} Z`;
    hem = { x1: 150, x2: 450, y: 840, c: 860 };
  }

  const under: Geometry["under"] = [];
  if (train) under.push({ d: "M 340,640 C 392,760 474,822 552,850 Q 470,874 318,862 Z", fill: "url(#shadeDeep)" });
  under.push({ d: skirt, fill: "url(#shade)" });

  let overlays = "";
  // Waist seam (+ ribbon when an accent is chosen)
  if (A) {
    overlays += `<path d="M ${300 - wh},${waistY - 5} Q 300,${waistY + 1} ${300 + wh},${waistY - 5} L ${300 + wh},${waistY + 4} Q 300,${waistY + 10} ${300 - wh},${waistY + 4} Z" fill="${A}" stroke="${INK}" stroke-width=".8" stroke-opacity=".5"/>`;
  } else {
    overlays += line(`M ${300 - wh},${waistY} Q 300,${waistY + 5} ${300 + wh},${waistY}`, INK, 1, 0.55);
  }
  if (p.neckline === "high-round") {
    overlays += `<path d="M 290,146 C 289,156 289,164 289,168 Q 300,176 311,168 C 311,164 311,156 310,146 Q 300,151 290,146 Z" fill="url(#shade)" stroke="${INK}" stroke-width="1.1" stroke-opacity=".75"/>`;
  } else if (p.neckline === "sweetheart-yoke") {
    overlays += `<path d="M 289,168 L 244,182 C 244,200 252,214 262,222 C 272,212 290,214 300,232 C 310,214 328,212 338,222 C 348,214 356,200 356,182 L 311,168 Q 300,176 289,168 Z" fill="${lighten(P, 0.5)}" fill-opacity=".8"/>`;
    overlays += `<path d="M 291,150 C 290,158 289,164 289,168 Q 300,176 311,168 C 311,164 310,158 309,150 Q 300,154 291,150 Z" fill="${lighten(P, 0.5)}" fill-opacity=".85"/>`;
    overlays += line("M 262,222 C 272,212 290,214 300,232 C 310,214 328,212 338,222", INK, 1.1, 0.7);
  } else if (p.neckline === "boat") {
    overlays += `<path d="M 270,176 Q 300,190 330,176 L 311,168 Q 300,176 289,168 Z" fill="var(--skin)"/>`;
    overlays += line("M 270,176 Q 300,190 330,176", INK, 1.1, 0.7);
  }

  const folds = mermaid
    ? ["M 270,660 C 256,730 226,800 200,846", "M 330,660 C 344,730 374,800 400,846", "M 300,660 L 300,856"]
    : [
        `M 284,${waistY + 10} C 272,500 234,700 208,848`,
        `M 316,${waistY + 10} C 328,500 366,700 392,848`,
        `M 300,${waistY + 10} C 300,520 300,700 300,858`,
        `M 272,${waistY + 30} C 250,520 200,700 172,842`,
        `M 328,${waistY + 30} C 350,520 400,700 428,842`,
      ];

  return {
    under,
    body,
    ...sleeveOf(p.sleeve),
    hems: [hem],
    neckline: arcPoints(284, 316, 178, 196, 7),
    bodice: { y0: 214, y1: waistY - 10, half0: 36, half1: wh - 4 },
    skirt: mermaid
      ? { y0: 660, y1: 830, half0: 48, half1: 112 }
      : { y0: waistY + 60, y1: 830, half0: wh + 20, half1: 130 },
    waist: { y: waistY, half: wh },
    folds: [],
    underFolds: folds,
    overlays,
    songket: [skirt],
    songketLayer: "under",
    feet: false,
  };
}

function jubah(p: RenderParams, P: string, A: string | null): Geometry {
  let sideL: string;
  let sideR: string;
  let hem: Curve;
  if (p.fit === "relaxed") {
    sideL = "C 250,380 214,640 184,838";
    sideR = "C 386,640 350,380 338,222";
    hem = { x1: 184, x2: 416, y: 838, c: 852 };
  } else if (p.fit === "regular") {
    sideL = "C 256,262 252,300 254,334 C 246,480 214,700 190,838";
    sideR = "C 386,700 354,480 346,334 C 348,300 344,262 338,222";
    hem = { x1: 190, x2: 410, y: 838, c: 852 };
  } else {
    sideL = "C 256,262 256,300 258,318 C 254,420 218,700 196,838";
    sideR = "C 382,700 346,420 342,318 C 344,300 344,262 338,222";
    hem = { x1: 196, x2: 404, y: 838, c: 852 };
  }
  const body = `${NECK_TO_ARMPIT_L} ${sideL} Q 300,${hem.c} ${hem.x2},${hem.y} ${sideR} ${ARMPIT_TO_NECK_R}`;
  const trim = trimColour(p, P);

  let overlays = "";
  if (p.neckline === "mandarin") {
    overlays += `<path d="M 288,158 C 288,163 289,166 289,168 Q 300,176 311,168 C 311,166 312,163 312,158 Q 300,165 288,158 Z" fill="${darken(P, 0.1)}" stroke="${INK}" stroke-width="1.1" stroke-opacity=".75"/>`;
  }
  if (p.neckline === "placket" || p.neckline === "mandarin") {
    overlays += line("M 300,176 L 300,420", INK, 0.9, 0.5);
    overlays += line("M 306,176 L 306,420", INK, 0.6, 0.25);
    for (let y = 194; y <= 400; y += 26) {
      overlays += `<circle cx="303" cy="${y}" r="2.2" fill="${trim}" stroke="${INK}" stroke-width=".5" stroke-opacity=".5"/>`;
    }
  }
  if (p.fit === "fitted") {
    const belt = A ?? darken(P, 0.2);
    overlays += `<path d="M 257,311 Q 300,318 343,311 L 343,327 Q 300,334 257,327 Z" fill="${belt}" stroke="${INK}" stroke-width=".9" stroke-opacity=".6"/>`;
    overlays += `<path d="M 294,318 L 306,318 L 309,336 L 300,344 L 291,336 Z" fill="${darken(belt, 0.08)}" stroke="${INK}" stroke-width=".7" stroke-opacity=".5"/>`;
  }

  return {
    under: [],
    body,
    ...sleeveOf(p.sleeve),
    hems: [hem],
    neckline: arcPoints(284, 316, 178, 196, 7),
    bodice: { y0: 206, y1: 300, half0: 36, half1: 44 },
    skirt: { y0: 520, y1: 810, half0: 58, half1: hem.x2 - 300 - 18 },
    waist: p.fit === "fitted" ? { y: 320, half: 42 } : null,
    folds: [
      `M 270,260 C 258,420 226,640 208,836`,
      `M 330,260 C 342,420 374,640 392,836`,
      `M 286,420 C 280,560 268,700 262,846`,
      `M 314,420 C 320,560 332,700 338,846`,
    ],
    underFolds: [],
    overlays,
    songket: [`M 250,640 L 350,640 L ${hem.x2 - 10},${hem.y} Q 300,${hem.c} ${hem.x1 + 10},${hem.y} Z`],
    songketLayer: "over",
    feet: false,
  };
}

function sleeveOf(kind: string) {
  // Own-property check: never resolve keys like "constructor" from Object.prototype.
  const s = Object.hasOwn(SLEEVES, kind) ? SLEEVES[kind] : SLEEVES.straight;
  return { sleeve: s.d, sleeveSheer: kind === "sheer", hand: s.hand, cuff: s.cuff };
}

// ── Primitive helpers ─────────────────────────────────────────────────────────

function line(d: string, stroke: string, width: number, opacity: number): string {
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function arcPoints(x1: number, x2: number, y: number, yMid: number, n: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = x1 + (x2 - x1) * t;
    const dy = (yMid - y) * (1 - (2 * t - 1) ** 2);
    pts.push([x, y + dy]);
  }
  return pts;
}

function curvePoints(c: Curve, spacing: number, inset = 10): Pt[] {
  const pts: Pt[] = [];
  const n = Math.max(2, Math.round((c.x2 - c.x1 - inset * 2) / spacing));
  for (let i = 0; i <= n; i++) {
    const t = 0.03 + (0.94 * i) / n;
    const x = (1 - t) ** 2 * c.x1 + 2 * (1 - t) * t * 300 + t * t * c.x2;
    const y = (1 - t) ** 2 * c.y + 2 * (1 - t) * t * c.c + t * t * c.y;
    pts.push([x, y]);
  }
  return pts;
}

function scatter(area: Trapezoid, count: number, rand: () => number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const ty = rand();
    const y = area.y0 + (area.y1 - area.y0) * ty;
    const half = area.half0 + (area.half1 - area.half0) * ty;
    const x = 300 + (rand() * 2 - 1) * half;
    pts.push([x, y]);
  }
  return pts;
}

function flower(x: number, y: number, s: number, petal: string, centre: string): string {
  let out = `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})">`;
  for (let k = 0; k < 5; k++) {
    out += `<ellipse cx="0" cy="-3.3" rx="2.1" ry="3.2" fill="${petal}" transform="rotate(${k * 72})"/>`;
  }
  out += `<circle r="1.35" fill="${centre}"/></g>`;
  return out;
}

function leafPair(x: number, y: number, s: number, fill: string): string {
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})"><ellipse cx="-3.4" cy="0" rx="3.3" ry="1.4" fill="${fill}" transform="rotate(-28)"/><ellipse cx="3.4" cy="0" rx="3.3" ry="1.4" fill="${fill}" transform="rotate(28)"/></g>`;
}

function diamond(x: number, y: number, s: number, fill: string): string {
  return `<path d="M ${x},${y - 4 * s} L ${x + 3.2 * s},${y} L ${x},${y + 4 * s} L ${x - 3.2 * s},${y} Z" fill="${fill}"/><circle cx="${x}" cy="${y}" r="${0.9 * s}" fill="#FFFFFF" fill-opacity=".55"/>`;
}

function motif(kind: RenderParams["motif"], x: number, y: number, s: number, colour: string, centre: string, i: number) {
  if (kind === "geometric") return diamond(x, y, s, colour);
  if (i % 3 === 1) return leafPair(x, y, s * 0.9, colour);
  return flower(x, y, s, colour, centre);
}

function pearl(x: number, y: number, r = 1.7): string {
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#FAF6EC" stroke="#8E8474" stroke-width=".35"/><circle cx="${(x - r * 0.35).toFixed(1)}" cy="${(y - r * 0.35).toFixed(1)}" r="${(r * 0.35).toFixed(2)}" fill="#FFFFFF"/>`;
}

function sequin(x: number, y: number, fill: string, o: number): string {
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.9" fill="${fill}" fill-opacity="${o.toFixed(2)}"/><circle cx="${(x - 0.6).toFixed(1)}" cy="${(y - 0.6).toFixed(1)}" r=".6" fill="#FFFFFF" fill-opacity=".9"/>`;
}

function brooch(x: number, y: number, gold: string): string {
  return `<g><circle cx="${x}" cy="${y}" r="5.4" fill="${gold}" stroke="${darken(gold, 0.35)}" stroke-width=".8"/><circle cx="${x}" cy="${y}" r="2.3" fill="${lighten(gold, 0.45)}"/>${[0, 90, 180, 270]
    .map((a) => {
      const rx = x + Math.cos((a * Math.PI) / 180) * 4;
      const ry = y + Math.sin((a * Math.PI) / 180) * 4;
      return `<circle cx="${rx.toFixed(1)}" cy="${ry.toFixed(1)}" r=".8" fill="#FFFFFF" fill-opacity=".8"/>`;
    })
    .join("")}</g>`;
}

function scallops(c: Curve, fill: string, stroke: string): string {
  const pts = curvePoints(c, 9, 2);
  let out = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 + 6;
    out += `<path d="M ${x1.toFixed(1)},${y1.toFixed(1)} Q ${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width=".6"/>`;
    out += `<circle cx="${mx.toFixed(1)}" cy="${(my - 3.2).toFixed(1)}" r=".9" fill="${stroke}" fill-opacity=".6"/>`;
  }
  return out;
}

function trimColour(p: RenderParams, P: string): string {
  if (p.accent) return `#${p.accent}`;
  return luminance(P) > 0.45 ? darken(P, 0.34) : lighten(P, 0.5);
}

// ── Details ───────────────────────────────────────────────────────────────────

function renderDetails(p: RenderParams, g: Geometry, P: string): { front: string; cuffs: string; clipped: string } {
  const rand = seededRandom(p.seed);
  const trim = trimColour(p, P);
  const centre = p.accent && isMetallic(`#${p.accent}`) ? lighten(trim, 0.4) : "#C8A862";
  const has = (d: DetailOption) => p.details.includes(d);
  // Each embellishment is drawn only where it was specified for (falls back to the shared list).
  const placesFor = (d: DetailOption): RenderPlacement[] => p.detailPlacements?.[d] ?? p.placements;
  const atFor = (d: DetailOption) => (pl: RenderPlacement) => placesFor(d).includes(pl);
  const tonal = p.motif === "tonal" ? (luminance(P) > 0.45 ? darken(P, 0.2) : lighten(P, 0.3)) : trim;
  const embroideryColour = p.motif === "tonal" ? tonal : trim;

  let front = "";
  let cuffs = "";
  let clipped = "";

  // Draping sits under other embellishment.
  if (has("draping")) {
    const drape = lighten(P, 0.1);
    front += `<path d="M 252,196 C 290,230 320,280 352,330 L 364,352 C 372,420 370,470 360,520 L 344,516 C 352,470 352,420 344,368 C 312,322 282,272 244,214 Z" fill="${drape}" stroke="${INK}" stroke-width="1" stroke-opacity=".6"/>`;
    front += line("M 256,210 C 292,246 322,296 350,346", darken(P, 0.22), 1, 0.45);
    front += line("M 350,380 C 356,430 356,470 350,510", darken(P, 0.22), 1, 0.45);
  }

  if (has("pleats")) {
    const area = g.skirt;
    for (let i = -5; i <= 5; i++) {
      const x0 = 300 + (i / 5) * area.half0;
      const x1 = 300 + (i / 5) * area.half1;
      clipped += line(`M ${x0.toFixed(1)},${area.y0 - 10} L ${x1.toFixed(1)},${area.y1 + 30}`, darken(P, 0.22), 1, 0.4);
    }
  }

  if (has("lace")) {
    const at = atFor("lace");
    const none = placesFor("lace").length === 0;
    const laceFill = mix(lighten(P, 0.55), "#FFFFFF", 0.3);
    const laceStroke = darken(P, 0.25);
    if (at("hem") || none) for (const c of g.hems) front += scallops(c, laceFill, laceStroke);
    if (at("cuffs") || none) {
      const c = g.cuff;
      cuffs += scallops({ x1: c.a[0], x2: c.b[0], y: (c.a[1] + c.b[1]) / 2 + 4, c: (c.a[1] + c.b[1]) / 2 + 6 }, laceFill, laceStroke);
    }
    if (at("bodice")) clipped += `<rect x="250" y="${g.bodice.y0}" width="100" height="${g.bodice.y1 - g.bodice.y0}" fill="url(#lacePattern)"/>`;
  }

  if (has("embroidery")) {
    const at = atFor("embroidery");
    const s = p.seed % 2 === 0 ? 1 : 0.9;
    if (at("hem")) {
      for (const c of g.hems) {
        curvePoints(c, 17).forEach(([x, y], i) => (front += motif(p.motif, x, y - 11, s, embroideryColour, centre, i)));
      }
    }
    if (at("cuffs")) {
      const { a, b } = g.cuff;
      for (let i = 0; i < 3; i++) {
        const t = (i + 0.5) / 3;
        cuffs += motif(p.motif, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - 5, 0.8, embroideryColour, centre, i);
      }
    }
    if (at("neckline")) {
      g.neckline.forEach(([x, y], i) => (front += motif(p.motif, x, y + 4, 0.75, embroideryColour, centre, i + 1)));
    }
    if (at("sleeves")) {
      for (let y = 214; y <= 420; y += 34) {
        const x = 236 - (y - 214) * 0.02;
        cuffs += motif(p.motif, x, y, 0.75, embroideryColour, centre, y);
      }
    }
    if (at("bodice")) {
      scatter(g.bodice, 9, rand).forEach(([x, y], i) => (clipped += motif(p.motif, x, y, 0.85, embroideryColour, centre, i)));
    }
    if (at("skirt")) {
      scatter(g.skirt, 14, rand).forEach(([x, y], i) => (clipped += motif(p.motif, x, y, 0.95, embroideryColour, centre, i)));
    }
    if (at("waist") && g.waist) {
      const w = g.waist;
      for (let x = 300 - w.half + 6; x <= 300 + w.half - 6; x += 12) front += motif(p.motif, x, w.y + 1, 0.7, embroideryColour, centre, 0);
    }
  }

  if (has("beading")) {
    const at = atFor("beading");
    if (at("neckline") || placesFor("beading").length === 0) {
      g.neckline.forEach(([x, y]) => (front += pearl(x, y + 2)));
      arcPoints(286, 314, 186, 206, 9).forEach(([x, y]) => (front += pearl(x, y, 1.4)));
    }
    if (at("bodice")) scatter(g.bodice, 26, rand).forEach(([x, y]) => (clipped += pearl(x, y, 1.4)));
    if (at("cuffs")) {
      const { a, b } = g.cuff;
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        cuffs += pearl(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - 2, 1.4);
      }
    }
    if (at("hem")) for (const c of g.hems) curvePoints(c, 8).forEach(([x, y]) => (front += pearl(x, y - 5, 1.4)));
  }

  if (has("sequins")) {
    const at = atFor("sequins");
    const fill = p.accent ? `#${p.accent}` : lighten(P, 0.45);
    const areas = [
      ...(at("bodice") || placesFor("sequins").length === 0 ? [g.bodice] : []),
      ...(at("skirt") ? [g.skirt] : []),
    ];
    for (const area of areas) {
      scatter(area, area === g.skirt ? 70 : 40, rand).forEach(([x, y]) => (clipped += sequin(x, y, fill, 0.55 + rand() * 0.4)));
    }
    if (at("hem")) for (const c of g.hems) curvePoints(c, 6).forEach(([x, y]) => (front += sequin(x, y - 6 - rand() * 8, fill, 0.8)));
    if (at("cuffs")) {
      const { a, b } = g.cuff;
      for (let i = 0; i < 8; i++) cuffs += sequin(a[0] + (b[0] - a[0]) * rand(), a[1] - 4 - rand() * 10, fill, 0.8);
    }
  }

  return { front, cuffs, clipped };
}

// ── Fabric treatments ─────────────────────────────────────────────────────────

function fabricOverlay(p: RenderParams): string {
  switch (p.fabric) {
    case "satin":
    case "silk":
      return `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#sheen)"/>`;
    case "chiffon":
      return [0, 1, 2, 3, 4, 5, 6, 7]
        .map((i) => line(`M ${190 + i * 30},200 C ${196 + i * 30},420 ${170 + i * 36},640 ${150 + i * 42},860`, "#FFFFFF", 1.4, 0.12))
        .join("");
    case "organza":
      return (
        `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#sheen)" opacity=".7"/>` +
        [0, 1, 2, 3, 4].map((i) => line(`M ${200 + i * 50},230 C ${204 + i * 50},460 ${180 + i * 58},660 ${160 + i * 70},860`, "#FFFFFF", 2, 0.1)).join("")
      );
    case "lace":
      return `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#lacePattern)"/>`;
    default:
      return "";
  }
}

function songketOverlay(g: Geometry): string {
  return g.songket
    .map(
      (d, i) =>
        `<clipPath id="sgk${i}"><path d="${d}"/></clipPath><rect x="0" y="0" width="${W}" height="${H}" fill="url(#songketPattern)" clip-path="url(#sgk${i})"/>`,
    )
    .join("");
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function renderGarmentSVG(p: RenderParams): string {
  const P = `#${p.primary}`;
  const A = p.accent ? `#${p.accent}` : null;
  const tryon = p.mode === "tryon";
  const skin = tryon ? "#D9CABC" : "#EDE6DE";
  const outline = tryon ? darken(P, 0.3) : INK;
  const outlineOpacity = tryon ? 0.35 : 0.78;

  const g =
    p.garment === "kebaya" ? kebaya(p, P, A) : p.garment === "gown" ? gown(p, P, A) : p.garment === "jubah" ? jubah(p, P, A) : bajuKurung(p, P);

  const details = p.details.includes("minimal") && p.details.length === 1 ? { front: "", cuffs: "", clipped: "" } : renderDetails(p, g, P);
  const gold = A && isMetallic(A) ? A : "#C8A862";
  const laceInk = luminance(P) > 0.5 ? darken(P, 0.3) : lighten(P, 0.55);
  const sarongBase = A && !isMetallic(A) ? A : A ? mix(P, A, 0.3) : darken(P, 0.1);
  const songket = p.fabric === "songket" ? songketOverlay(g) : "";
  const hasSheen = p.fabric === "satin" || p.fabric === "silk" || p.fabric === "organza";
  // Dark cloth shows sheen far more strongly — scale it down so black stays black.
  const sheenK = luminance(P) < 0.03 ? 0.35 : luminance(P) < 0.12 ? 0.6 : 1;

  const garmentPaths = [...g.under.map((u) => u.d), g.body];
  const clipId = "garmentClip";

  const stroke = `stroke="${outline}" stroke-width="1.3" stroke-opacity="${outlineOpacity}" stroke-linejoin="round"`;

  const background = tryon
    ? `<rect width="${W}" height="${H}" fill="url(#studio)"/><rect y="760" width="${W}" height="140" fill="url(#floor)"/><rect width="${W}" height="${H}" fill="url(#vignette)"/>`
    : `<rect width="${W}" height="${H}" fill="#EEECE8"/><rect width="${W}" height="${H}" fill="url(#paperGlow)"/><rect width="${W}" height="${H}" filter="url(#grain)" opacity=".05"/>`;

  const sleeveFill = g.sleeveSheer ? lighten(P, 0.25) : "url(#shade)";
  const sleeveOpacity = g.sleeveSheer ? 0.62 : 1;

  const leftSide = (inner: string) => `${inner}<g transform="${MIRROR}">${inner}</g>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <linearGradient id="shade" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="${darken(P, 0.17)}"/><stop offset=".24" stop-color="${P}"/><stop offset=".5" stop-color="${lighten(P, 0.08)}"/><stop offset=".76" stop-color="${P}"/><stop offset="1" stop-color="${darken(P, 0.2)}"/>
  </linearGradient>
  <linearGradient id="shadeDeep" x1="0" x2="1">
    <stop offset="0" stop-color="${darken(sarongBase, 0.2)}"/><stop offset=".5" stop-color="${sarongBase}"/><stop offset="1" stop-color="${darken(sarongBase, 0.22)}"/>
  </linearGradient>
  <linearGradient id="shadeAccent" x1="0" x2="1">
    <stop offset="0" stop-color="${darken(sarongBase, 0.18)}"/><stop offset=".5" stop-color="${lighten(sarongBase, 0.05)}"/><stop offset="1" stop-color="${darken(sarongBase, 0.2)}"/>
  </linearGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
    <stop offset=".25" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".45" stop-color="#FFFFFF" stop-opacity="${(0.3 * sheenK).toFixed(2)}"/><stop offset=".52" stop-color="#FFFFFF" stop-opacity="${(0.08 * sheenK).toFixed(2)}"/><stop offset=".62" stop-color="#FFFFFF" stop-opacity="${(0.22 * sheenK).toFixed(2)}"/><stop offset=".8" stop-color="#FFFFFF" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="skinShade" x1="0" x2="1"><stop offset="0" stop-color="${darken(skin, 0.1)}"/><stop offset=".5" stop-color="${skin}"/><stop offset="1" stop-color="${darken(skin, 0.12)}"/></linearGradient>
  <radialGradient id="paperGlow" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#FAF9F7"/><stop offset="1" stop-color="#E7E4DF"/></radialGradient>
  <linearGradient id="studio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6DFD6"/><stop offset=".84" stop-color="#D8CFC4"/></linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFC5B8"/><stop offset="1" stop-color="#C3B8AA"/></linearGradient>
  <radialGradient id="vignette" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></radialGradient>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="armShadow" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation="3"/></filter>
  <pattern id="lacePattern" width="14" height="14" patternUnits="userSpaceOnUse">
    <circle cx="7" cy="7" r="3.2" fill="none" stroke="${laceInk}" stroke-width=".6" stroke-opacity=".55"/><circle cx="7" cy="7" r="1" fill="${laceInk}" fill-opacity=".45"/><circle cx="0" cy="0" r="1.6" fill="none" stroke="${laceInk}" stroke-width=".5" stroke-opacity=".4"/><circle cx="14" cy="14" r="1.6" fill="none" stroke="${laceInk}" stroke-width=".5" stroke-opacity=".4"/>
  </pattern>
  <pattern id="songketPattern" width="20" height="20" patternUnits="userSpaceOnUse">
    <path d="M 10,2 L 17,10 L 10,18 L 3,10 Z" fill="none" stroke="${gold}" stroke-width="1.1" stroke-opacity=".85"/><path d="M 10,7 L 13,10 L 10,13 L 7,10 Z" fill="${gold}" fill-opacity=".8"/><circle cx="0" cy="0" r="1.2" fill="${gold}"/><circle cx="20" cy="20" r="1.2" fill="${gold}"/><circle cx="20" cy="0" r="1.2" fill="${gold}"/><circle cx="0" cy="20" r="1.2" fill="${gold}"/>
  </pattern>
  <clipPath id="${clipId}">${garmentPaths.map((d) => `<path d="${d}"/>`).join("")}</clipPath>
</defs>
${background}
<ellipse cx="300" cy="${g.feet ? 842 : 858}" rx="${tryon ? 170 : 150}" ry="16" fill="#000" opacity="${tryon ? 0.16 : 0.08}" filter="url(#soft)"/>
<g>
  <!-- figure: feet, neck, head -->
  <ellipse cx="287" cy="834" rx="10" ry="5" fill="#C9B29E"/><ellipse cx="313" cy="834" rx="10" ry="5" fill="#C9B29E"/>
  <path d="M 290,128 C 291,144 290,158 288,172 L 312,172 C 310,158 309,144 310,128 Z" fill="url(#skinShade)" ${tryon ? "" : `stroke="${INK}" stroke-width="1" stroke-opacity=".55"`}/>
  <ellipse cx="300" cy="106" rx="23" ry="30" fill="url(#skinShade)" ${tryon ? "" : `stroke="${INK}" stroke-width="1.1" stroke-opacity=".7"`}/>
  <ellipse cx="294" cy="96" rx="7" ry="11" fill="#FFFFFF" opacity=".22"/>
  <!-- under-garment (kain / skirt / train) -->
  ${g.under.map((u) => `<path d="${u.d}" fill="${u.fill}" ${stroke}/>`).join("")}
  ${g.songketLayer === "under" ? songket : ""}
  ${g.underFolds.map((d) => line(d, darken(P, 0.3), 1.1, 0.32)).join("")}
  <!-- body -->
  <path d="${g.body}" fill="url(#shade)" ${stroke}/>
  ${g.folds.map((d) => line(d, darken(P, 0.3), 1.1, 0.3)).join("")}
  <!-- fabric + clipped embellishment -->
  <g clip-path="url(#${clipId})">${g.songketLayer === "over" ? songket : ""}${fabricOverlay(p)}${details.clipped}</g>
  ${g.overlays}
  ${details.front}
  <!-- hands, then sleeves (mirrored) -->
  ${leftSide(`<ellipse cx="${g.hand[0]}" cy="${g.hand[1]}" rx="8.5" ry="15" fill="url(#skinShade)" ${tryon ? "" : `stroke="${INK}" stroke-width="1" stroke-opacity=".55"`}/>`)}
  ${leftSide(
    `${g.sleeveSheer ? `<path d="${ARM_UNDER}" fill="url(#skinShade)"/>` : ""}<path d="${g.sleeve}" fill="#000" opacity="${g.sleeveSheer ? 0 : 0.16}" transform="translate(3 2)" filter="url(#armShadow)"/><path d="${g.sleeve}" fill="${sleeveFill}" fill-opacity="${sleeveOpacity}" ${stroke}/>${hasSheen ? `<path d="${g.sleeve}" fill="url(#sheen)"/>` : ""}${
      p.sleeve === "bishop" ? `<path d="M 222,438 L 246,438 L 245,456 L 223,456 Z" fill="${darken(P, 0.08)}" ${stroke}/>` : ""
    }${p.sleeve === "puff" ? `<path d="M 241,176 C 221,176 212,200 217,228 C 226,238 247,236 259,224 C 257,204 252,186 241,176 Z" fill="url(#shade)" ${stroke}/>` : ""}${line(
      "M 236,206 C 233,280 232,360 231,430",
      darken(P, 0.3),
      1,
      0.25,
    )}${details.cuffs}`,
  )}
</g>
</svg>`;

  // Presentation attributes can't read CSS variables inside an <img>, so inline the skin tone.
  return svg.replaceAll("var(--skin)", skin).replace(/\n\s*/g, "\n");
}
