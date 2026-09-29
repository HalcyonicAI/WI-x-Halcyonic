import type { PaymentMethod } from "@/types/booking";
import type {
  DetailOption,
  Fabric,
  Fit,
  GarmentType,
  Occasion,
  StyleDirection,
} from "@/types/design";

/**
 * Form option catalog. Labels follow the Wajie storefront's plain, uppercase-friendly
 * naming. Colour names reuse the vocabulary of Wajie's current colourways
 * (e.g. "Mocha Mousse", "Tea Rose", "Powder Blue") so concepts feel on-brand.
 */

export interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export const GARMENTS: Option<GarmentType>[] = [
  { value: "baju-kurung", label: "Baju Kurung", description: "Classic two-piece with a long top and kain" },
  { value: "kebaya", label: "Kebaya", description: "Fitted top with a front opening, worn with a kain" },
  { value: "dress-gown", label: "Dress / Gown", description: "Full-length dress with a defined silhouette" },
  { value: "jubah", label: "Jubah", description: "Flowing one-piece from shoulder to hem" },
  { value: "other", label: "Other", description: "Describe the piece you have in mind" },
];

export const OCCASIONS: Option<Occasion>[] = [
  { value: "wedding", label: "Wedding" },
  { value: "engagement", label: "Engagement" },
  { value: "raya", label: "Eid / Raya" },
  { value: "formal", label: "Formal Event" },
  { value: "dinner", label: "Dinner" },
  { value: "everyday", label: "Everyday / Casual" },
  { value: "other", label: "Other" },
];

export const STYLES: Option<StyleDirection>[] = [
  { value: "modern", label: "Modern" },
  { value: "traditional", label: "Traditional" },
  { value: "minimalist", label: "Minimalist" },
  { value: "elegant", label: "Elegant" },
  { value: "romantic", label: "Romantic" },
  { value: "statement", label: "Statement" },
  { value: "contemporary", label: "Contemporary" },
];

export const MAX_STYLES = 3;

export const FABRICS: Option<Fabric>[] = [
  { value: "chiffon", label: "Chiffon", description: "Light, airy and flowing" },
  { value: "satin", label: "Satin", description: "Smooth with a soft sheen" },
  { value: "silk", label: "Silk", description: "Fluid, luxurious drape" },
  { value: "lace", label: "Lace", description: "Delicate, textured overlay" },
  { value: "songket", label: "Songket", description: "Woven with metallic motifs" },
  { value: "organza", label: "Organza", description: "Crisp, sheer structure" },
  { value: "no-preference", label: "No Preference", description: "Let our design team suggest" },
];

export const FITS: Option<Fit>[] = [
  { value: "relaxed", label: "Relaxed", description: "Loose and easy through the body" },
  { value: "regular", label: "Regular", description: "Softly shaped, comfortable" },
  { value: "fitted", label: "Fitted", description: "Tailored close to the body" },
];

export const DETAILS: Option<DetailOption>[] = [
  { value: "embroidery", label: "Embroidery" },
  { value: "beading", label: "Beading" },
  { value: "lace", label: "Lace" },
  { value: "sequins", label: "Sequins" },
  { value: "pleats", label: "Pleats" },
  { value: "draping", label: "Draping" },
  { value: "minimal", label: "Minimal Detailing" },
];

export interface ColourOption {
  id: string;
  name: string;
  hex: string;
}

export const PRIMARY_COLOURS: ColourOption[] = [
  { id: "ivory", name: "Ivory", hex: "#F2ECE0" },
  { id: "champagne", name: "Champagne", hex: "#E4D0AE" },
  { id: "classic-beige", name: "Classic Beige", hex: "#D6C3A6" },
  { id: "oatmeal", name: "Oatmeal", hex: "#C9BBA3" },
  { id: "pink-blush", name: "Pink Blush", hex: "#E8C3BE" },
  { id: "tea-rose", name: "Tea Rose", hex: "#D4A29B" },
  { id: "mauve-pink", name: "Mauve Pink", hex: "#B5879A" },
  { id: "dusty-lilac", name: "Dusty Lilac", hex: "#AFA0C3" },
  { id: "powder-blue", name: "Powder Blue", hex: "#B3C6D8" },
  { id: "sage-green", name: "Sage Green", hex: "#9DAE8C" },
  { id: "emerald", name: "Emerald", hex: "#2F6A54" },
  { id: "butter-yellow", name: "Butter Yellow", hex: "#ECD993" },
  { id: "peach-coral", name: "Peach Coral", hex: "#E3A189" },
  { id: "mocha-mousse", name: "Mocha Mousse", hex: "#977261" },
  { id: "cocoa", name: "Cocoa", hex: "#684A3D" },
  { id: "crimson-red", name: "Crimson Red", hex: "#962A35" },
  { id: "navy-blue", name: "Navy Blue", hex: "#27324A" },
  { id: "black", name: "Black", hex: "#1A1A1A" },
];

export const ACCENT_COLOURS: ColourOption[] = [
  { id: "soft-gold", name: "Soft Gold", hex: "#C8A862" },
  { id: "silver", name: "Silver", hex: "#C4C4C6" },
  { id: "muted-ivory", name: "Muted Ivory", hex: "#EEE7D8" },
  ...PRIMARY_COLOURS.filter((c) => c.id !== "ivory"),
];

const ALL_COLOURS = [...ACCENT_COLOURS, PRIMARY_COLOURS[0]];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  fpx: "FPX Online Banking",
  card: "Credit / Debit Card",
  ewallet: "Touch 'n Go eWallet",
};

export function findColour(id: string | undefined | null): ColourOption | undefined {
  if (!id) return undefined;
  return ALL_COLOURS.find((c) => c.id === id);
}

export function labelFor<T extends string>(options: Option<T>[], value: T | undefined | null): string {
  if (!value) return "";
  return options.find((o) => o.value === value)?.label ?? value;
}

export function garmentLabel(garment: GarmentType, other?: string): string {
  if (garment === "other") return other?.trim() || "Custom Piece";
  return labelFor(GARMENTS, garment);
}

export function occasionLabel(occasion: Occasion, other?: string): string {
  if (occasion === "other") return other?.trim() || "Special Occasion";
  return labelFor(OCCASIONS, occasion);
}
