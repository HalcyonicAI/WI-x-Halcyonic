import type { BookingAccess, Customer, MockShopifyOrder, PaymentMethod } from "@/types/booking";
import type { DesignRequestPayload, DesignResult, DesignVariant, GenerationKind, TryOnResult } from "@/types/design";

/** Request/response shapes for the app's own API routes (shared by client and server). */

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "PAYMENT_REQUIRED"
  | "PAYMENT_FAILED"
  | "GENERATION_LIMIT_REACHED"
  | "TRYON_LIMIT_REACHED"
  | "BOOKING_FINALIZED"
  | "NO_DESIGN"
  | "GENERATION_FAILED"
  | "TRYON_FAILED";

export interface ApiErrorBody {
  error: { code: ApiErrorCode; message: string };
}

// POST /api/checkout
export interface CheckoutRequest {
  orderNumber: number;
  customer: Customer;
  paymentMethod: PaymentMethod;
  simulateDecline?: boolean;
}
export interface CheckoutResponse {
  order: MockShopifyOrder;
  bookingId: string;
  generationLimit: number;
  tryOnLimit: number;
}

// POST /api/ai/design
export interface DesignGenerationRequest {
  booking: BookingAccess;
  request: DesignRequestPayload;
  kind: GenerationKind;
  /** Modifications send the edited concept's construction so unchanged parts are kept. */
  base?: DesignVariant;
  simulateFailure?: boolean;
}
export interface DesignGenerationResponse {
  result: DesignResult;
  usage: { generationsUsed: number; generationLimit: number };
}

// POST /api/ai/try-on
export interface TryOnRequest {
  booking: BookingAccess;
  design: Pick<DesignResult, "id" | "version" | "imageUrl" | "seed">;
}
export interface TryOnResponse {
  result: Omit<TryOnResult, "customerPhoto">;
  usage: { tryOnsUsed: number; tryOnLimit: number };
}
