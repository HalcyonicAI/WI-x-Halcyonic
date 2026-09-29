import type { Customer, PaymentMethod } from "@/types/booking";
import type { DesignRequestPayload, DesignVariant } from "@/types/design";
import { NECKLINE_KEYS, SKIRT_KEYS, SLEEVE_KEYS } from "@/lib/ai/render/params";
import { DETAILS, FABRICS, FITS, GARMENTS, OCCASIONS, STYLES, findColour, MAX_STYLES } from "@/lib/catalog/options";

/** Minimal runtime validation for API inputs (no schema library needed for the mock). */

const values = <T extends string>(opts: { value: T }[]) => opts.map((o) => o.value) as readonly T[];
const isOneOf = <T extends string>(v: unknown, allowed: readonly T[]): v is T =>
  typeof v === "string" && (allowed as readonly string[]).includes(v);
const text = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

export function parseDesignRequestPayload(input: unknown): DesignRequestPayload | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  if (!isOneOf(r.garmentType, values(GARMENTS))) return null;
  if (!isOneOf(r.occasion, values(OCCASIONS))) return null;
  if (typeof r.primaryColour !== "string" || !findColour(r.primaryColour)) return null;
  if (!isOneOf(r.fabric, values(FABRICS))) return null;
  if (!isOneOf(r.fit, values(FITS))) return null;
  const style = Array.isArray(r.style) ? r.style.filter((s) => isOneOf(s, values(STYLES))) : [];
  if (style.length === 0) return null;
  const details = Array.isArray(r.details) ? r.details.filter((d) => isOneOf(d, values(DETAILS))) : [];

  return {
    garmentType: r.garmentType,
    garmentOther: text(r.garmentOther, 80) || undefined,
    occasion: r.occasion,
    occasionOther: text(r.occasionOther, 80) || undefined,
    primaryColour: r.primaryColour,
    secondaryColour:
      typeof r.secondaryColour === "string" && findColour(r.secondaryColour) ? r.secondaryColour : undefined,
    style: [...new Set(style)].slice(0, MAX_STYLES),
    fabric: r.fabric,
    fit: r.fit,
    details: [...new Set(details)],
    additionalRequest: text(r.additionalRequest, 500),
    referenceImageCount: typeof r.referenceImageCount === "number" ? Math.min(Math.max(0, r.referenceImageCount), 3) : 0,
  };
}

export function parseVariant(input: unknown): DesignVariant | undefined {
  if (!input || typeof input !== "object") return undefined;
  const v = input as Record<string, unknown>;
  if (!isOneOf(v.garment, ["baju-kurung", "kebaya", "gown", "jubah"] as const)) return undefined;
  if (!isOneOf(v.fit, values(FITS))) return undefined;
  if (!isOneOf(v.neckline, NECKLINE_KEYS) || !isOneOf(v.sleeve, SLEEVE_KEYS) || !isOneOf(v.skirt, SKIRT_KEYS)) return undefined;
  const seed = Number(v.seed);
  if (!Number.isInteger(seed) || seed < 0) return undefined;
  return { garment: v.garment, fit: v.fit, neckline: v.neckline, sleeve: v.sleeve, skirt: v.skirt, seed: seed % 1_000_000 };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL.test(email.trim());
}

export function parseCustomer(input: unknown): Customer | null {
  if (!input || typeof input !== "object") return null;
  const c = input as Record<string, unknown>;
  const name = text(c.name, 80).trim();
  const email = text(c.email, 120).trim();
  if (!name || !isValidEmail(email)) return null;
  return { name, email, phone: text(c.phone, 30).trim() || undefined };
}

export function parsePaymentMethod(v: unknown): PaymentMethod | null {
  return isOneOf(v, ["fpx", "card", "ewallet"] as const) ? v : null;
}
