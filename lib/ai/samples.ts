import { renderUrl, type RenderParams } from "./render/params";

/** Sample concepts used for marketing imagery on the storefront pages (not customer results). */

const base: Omit<RenderParams, "garment" | "primary" | "accent"> = {
  fabric: "chiffon",
  fit: "relaxed",
  details: ["embroidery"],
  placements: ["cuffs", "hem"],
  motif: "floral",
  neckline: "round",
  sleeve: "straight",
  skirt: "a-line",
  mode: "concept",
  seed: 7,
};

export const SAMPLE_CONCEPTS = [
  {
    title: "Modern Sage Green Baju Kurung",
    caption: "Chiffon · floral embroidery at cuffs and hem",
    image: renderUrl({ ...base, garment: "baju-kurung", primary: "9DAE8C", accent: "EEE7D8" }),
  },
  {
    title: "Elegant Ivory Kebaya",
    caption: "Lace · pearl beading and kerongsang",
    image: renderUrl({
      ...base,
      garment: "kebaya",
      primary: "F2ECE0",
      accent: "C8A862",
      fabric: "lace",
      fit: "fitted",
      details: ["beading", "embroidery"],
      placements: ["neckline", "hem"],
      neckline: "kebaya-v",
      sleeve: "fitted",
      skirt: "sarong",
      seed: 11,
    }),
  },
  {
    title: "Romantic Pink Blush Gown",
    caption: "Satin · sheer yoke with scattered sequins",
    image: renderUrl({
      ...base,
      garment: "gown",
      primary: "E8C3BE",
      accent: "C8A862",
      fabric: "satin",
      fit: "regular",
      details: ["sequins", "beading"],
      placements: ["bodice", "skirt"],
      neckline: "sweetheart-yoke",
      sleeve: "sheer",
      skirt: "train",
      seed: 19,
    }),
  },
  {
    title: "Contemporary Mocha Mousse Jubah",
    caption: "Chiffon · embroidered placket and cuffs",
    image: renderUrl({
      ...base,
      garment: "jubah",
      primary: "977261",
      accent: "EEE7D8",
      neckline: "placket",
      sleeve: "bell",
      placements: ["cuffs", "neckline"],
      seed: 23,
    }),
  },
] as const;

/** Neutral silhouettes for the garment picker. */
export const GARMENT_THUMBS: Record<"baju-kurung" | "kebaya" | "dress-gown" | "jubah", string> = {
  "baju-kurung": renderUrl({ ...base, garment: "baju-kurung", primary: "D6C3A6", accent: null, details: ["minimal"], placements: [] }),
  kebaya: renderUrl({
    ...base,
    garment: "kebaya",
    primary: "D6C3A6",
    accent: null,
    fit: "fitted",
    details: ["minimal"],
    placements: [],
    neckline: "kebaya-v",
    sleeve: "fitted",
    skirt: "sarong",
  }),
  "dress-gown": renderUrl({
    ...base,
    garment: "gown",
    primary: "D6C3A6",
    accent: null,
    fit: "regular",
    details: ["minimal"],
    placements: [],
    neckline: "high-round",
    sleeve: "bell",
    skirt: "a-line",
  }),
  jubah: renderUrl({
    ...base,
    garment: "jubah",
    primary: "D6C3A6",
    accent: null,
    details: ["minimal"],
    placements: [],
    neckline: "placket",
    sleeve: "bell",
  }),
};

/** A neutral studio "customer photo" so presenters can demo try-on without a real photo. */
export const SAMPLE_CUSTOMER_PHOTO = renderUrl({
  garment: "jubah",
  primary: "4A4745",
  accent: null,
  fabric: "no-preference",
  fit: "regular",
  details: ["minimal"],
  placements: [],
  motif: "floral",
  neckline: "round",
  sleeve: "straight",
  skirt: "a-line",
  mode: "tryon",
  seed: 3,
});
