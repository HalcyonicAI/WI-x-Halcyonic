import type { DetailOption, Fabric, Fit } from "@/types/design";

/**
 * Parameters for the mock concept renderer. They are encoded into the image URL
 * (`/api/mock-render?...`) so a generated "image" is just a URL — exactly like the
 * URL a real FLUX / FASHN call would return.
 */

export type RenderGarment = "baju-kurung" | "kebaya" | "gown" | "jubah";
export type RenderPlacement = "neckline" | "cuffs" | "hem" | "bodice" | "sleeves" | "skirt" | "waist";
export type RenderMode = "concept" | "tryon";
export type RenderMotif = "floral" | "geometric" | "tonal";

/** Every construction variant the renderer can draw (anything else falls back to the default). */
export const NECKLINE_KEYS = [
  "round",
  "cekak-musang",
  "teluk-belanga",
  "soft-v",
  "kebaya-v",
  "kebaya-nyonya",
  "kebaya-collar",
  "high-round",
  "sweetheart-yoke",
  "boat",
  "placket",
  "mandarin",
] as const;
export const SLEEVE_KEYS = ["straight", "fitted", "bell", "bishop", "sheer", "puff"] as const;
export const SKIRT_KEYS = ["a-line", "ombak", "straight", "sarong", "mermaid", "train", "empire"] as const;

export interface RenderParams {
  garment: RenderGarment;
  primary: string; // hex without '#'
  accent: string | null; // hex without '#'
  fabric: Fabric;
  fit: Fit;
  details: DetailOption[];
  /** Union of all embellishment placements (used when no per-detail placement is given). */
  placements: RenderPlacement[];
  /** Where each embellishment goes, so e.g. beading at the neckline doesn't also appear at the hem. */
  detailPlacements?: Partial<Record<DetailOption, RenderPlacement[]>>;
  motif: RenderMotif;
  neckline: string;
  sleeve: string;
  skirt: string;
  mode: RenderMode;
  seed: number;
}

const GARMENTS: RenderGarment[] = ["baju-kurung", "kebaya", "gown", "jubah"];
const FABRICS: Fabric[] = ["chiffon", "satin", "silk", "lace", "songket", "organza", "no-preference"];
const FITS: Fit[] = ["relaxed", "regular", "fitted"];
const DETAILS: DetailOption[] = ["embroidery", "beading", "lace", "sequins", "pleats", "draping", "minimal"];
const PLACEMENTS: RenderPlacement[] = ["neckline", "cuffs", "hem", "bodice", "sleeves", "skirt", "waist"];

const HEX = /^[0-9a-fA-F]{6}$/;

export const MOCK_RENDER_PATH = "/api/mock-render";
/** Bump when the renderer's drawing changes so cached images refresh. */
export const RENDER_VERSION = "4";

export function encodeRenderParams(p: RenderParams): string {
  const q = new URLSearchParams();
  q.set("g", p.garment);
  q.set("p", p.primary);
  if (p.accent) q.set("a", p.accent);
  q.set("f", p.fabric);
  q.set("fit", p.fit);
  if (p.details.length) q.set("d", p.details.join(","));
  if (p.placements.length) q.set("pl", p.placements.join(","));
  const dp = Object.entries(p.detailPlacements ?? {})
    .filter(([, pls]) => pls && pls.length)
    .map(([d, pls]) => [d, ...(pls ?? [])].join("."))
    .join("~");
  if (dp) q.set("dp", dp);
  q.set("mo", p.motif);
  q.set("n", p.neckline);
  q.set("sl", p.sleeve);
  q.set("sk", p.skirt);
  q.set("m", p.mode);
  q.set("s", String(p.seed));
  q.set("v", RENDER_VERSION);
  return q.toString();
}

export function renderUrl(p: RenderParams): string {
  return `${MOCK_RENDER_PATH}?${encodeRenderParams(p)}`;
}

/** Recovers render params from a mock image URL (e.g. to render the try-on of that concept). */
export function renderParamsFromUrl(url: string): RenderParams {
  return decodeRenderParams(new URL(url, "http://mock.local").searchParams);
}

/** Parses untrusted query params into safe render params (every field is whitelisted). */
export function decodeRenderParams(q: URLSearchParams): RenderParams {
  const oneOf = <T extends string>(v: string | null | undefined, allowed: readonly T[], fallback: T): T =>
    v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
  const listOf = <T extends string>(v: string | null | undefined, allowed: readonly T[], sep = ","): T[] =>
    [...new Set((v ?? "").split(sep))].filter((x): x is T => (allowed as readonly string[]).includes(x)).slice(0, 8);
  const hex = (v: string | null) => (v && HEX.test(v) ? v.toUpperCase() : null);
  const seed = Number.parseInt(q.get("s") ?? "1", 10);

  const detailPlacements: Partial<Record<DetailOption, RenderPlacement[]>> = {};
  for (const group of (q.get("dp") ?? "").split("~").slice(0, 8)) {
    const [d, ...pls] = group.split(".");
    if (!(DETAILS as string[]).includes(d)) continue;
    detailPlacements[d as DetailOption] = listOf(pls.join("."), PLACEMENTS, ".");
  }

  return {
    garment: oneOf(q.get("g"), GARMENTS, "baju-kurung"),
    primary: hex(q.get("p")) ?? "C9BBA3",
    accent: hex(q.get("a")),
    fabric: oneOf(q.get("f"), FABRICS, "no-preference"),
    fit: oneOf(q.get("fit"), FITS, "regular"),
    details: listOf(q.get("d"), DETAILS),
    placements: listOf(q.get("pl"), PLACEMENTS),
    detailPlacements,
    motif: oneOf(q.get("mo"), ["floral", "geometric", "tonal"] as const, "floral"),
    neckline: oneOf(q.get("n"), NECKLINE_KEYS, "round"),
    sleeve: oneOf(q.get("sl"), SLEEVE_KEYS, "straight"),
    skirt: oneOf(q.get("sk"), SKIRT_KEYS, "a-line"),
    mode: oneOf(q.get("m"), ["concept", "tryon"] as const, "concept"),
    seed: Number.isFinite(seed) ? Math.abs(seed) % 1_000_000 : 1,
  };
}
