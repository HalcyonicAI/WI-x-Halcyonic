import type { BookingAccess } from "@/types/booking";

/**
 * Price and usage limits of the AI design booking (context.md §10).
 * Commercial values may change after Wajie staff feedback — change them here only;
 * all customer-facing copy derives from these constants.
 */
export const BOOKING_PRICE_MYR = 5;
/** "RM5" for buttons and short copy; formatMYR(BOOKING_PRICE_MYR) gives "RM5.00" for prices. */
export const BOOKING_PRICE_SHORT = `RM${BOOKING_PRICE_MYR}`;
export const DEFAULT_LIMITS = {
  /** 1 initial generation + up to 2 modifications/regenerations. */
  generationLimit: 3,
  tryOnLimit: 1,
} as const;

export type AccessDeniedCode =
  | "PAYMENT_REQUIRED"
  | "GENERATION_LIMIT_REACHED"
  | "TRYON_LIMIT_REACHED"
  | "BOOKING_FINALIZED"
  | "NO_DESIGN";

export type AccessCheck = { ok: true } | { ok: false; code: AccessDeniedCode; message: string };

const FINAL_STATUSES = new Set(["finalized", "staff_review", "completed"]);

export function isPaid(b: Pick<BookingAccess, "paymentStatus">): boolean {
  return b.paymentStatus === "paid";
}

export function isFinalized(b: Pick<BookingAccess, "status">): boolean {
  return FINAL_STATUSES.has(b.status);
}

export function remainingGenerations(b: Pick<BookingAccess, "generationLimit" | "generationsUsed">): number {
  return Math.max(0, b.generationLimit - b.generationsUsed);
}

export function remainingTryOns(b: Pick<BookingAccess, "tryOnLimit" | "tryOnsUsed">): number {
  return Math.max(0, b.tryOnLimit - b.tryOnsUsed);
}

/**
 * Every generation request must pass, in order:
 *   payment confirmed? → booking still open? → generation quota remaining?
 * Used by the UI (to disable actions) AND by the API route (to enforce).
 */
export function checkGenerationAccess(b: BookingAccess): AccessCheck {
  if (!isPaid(b)) {
    return { ok: false, code: "PAYMENT_REQUIRED", message: "A paid booking is required before a design can be generated." };
  }
  if (isFinalized(b)) {
    return { ok: false, code: "BOOKING_FINALIZED", message: "This design has already been submitted to Wajie Ibrahim." };
  }
  if (remainingGenerations(b) <= 0) {
    return {
      ok: false,
      code: "GENERATION_LIMIT_REACHED",
      message: "You've used the design generations included with this booking.",
    };
  }
  return { ok: true };
}

export function checkTryOnAccess(b: BookingAccess, hasDesign: boolean): AccessCheck {
  if (!isPaid(b)) {
    return { ok: false, code: "PAYMENT_REQUIRED", message: "A paid booking is required before a try-on can be created." };
  }
  if (isFinalized(b)) {
    return { ok: false, code: "BOOKING_FINALIZED", message: "This design has already been submitted to Wajie Ibrahim." };
  }
  if (!hasDesign) {
    return { ok: false, code: "NO_DESIGN", message: "Create a design before trying it on." };
  }
  if (remainingTryOns(b) <= 0) {
    return { ok: false, code: "TRYON_LIMIT_REACHED", message: "You've used the virtual try-on included with this booking." };
  }
  return { ok: true };
}
