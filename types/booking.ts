import type { DesignDraft, DesignRequest, DesignResult, TryOnResult } from "./design";

export type PaymentStatus = "unpaid" | "paid" | "failed";

/**
 * Booking lifecycle (see context.md §14).
 * PAID → DESIGNING → DESIGN GENERATED → CUSTOMER REVISION → FINALIZED → STAFF REVIEW → COMPLETED
 */
export type BookingStatus =
  | "unpaid"
  | "paid"
  | "designing"
  | "generated"
  | "revision"
  | "finalized"
  | "staff_review"
  | "completed";

export type ErrorState = "PAYMENT_FAILED" | "GENERATION_FAILED" | "SESSION_EXPIRED" | "LIMIT_REACHED";

export type PaymentMethod = "fpx" | "card" | "ewallet";

export interface Customer {
  name: string;
  email: string;
  phone?: string;
}

export type BookingEventType =
  | "payment_failed"
  | "generation_failed"
  | "limit_reached"
  | "order_paid"
  | "session_unlocked"
  | "design_generated"
  | "design_selected"
  | "tryon_generated"
  | "design_finalized"
  | "staff_review_started"
  | "completed";

export interface BookingEvent {
  id: string;
  at: string;
  type: BookingEventType;
  label: string;
}

/** Mock of the Shopify order created by the RM5 booking checkout. */
export interface MockShopifyOrder {
  /** Shopify GID-style id (mock). */
  id: string;
  /** Display name, e.g. "#WI-AI-1042". */
  name: string;
  orderNumber: number;
  financialStatus: "paid";
  fulfillmentStatus: "unfulfilled";
  currency: "MYR";
  totalPrice: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
  lineItems: { title: string; sku: string; quantity: number; price: string }[];
  tags: string[];
}

/** Minimal booking fields needed to authorise an AI request. */
export interface BookingAccess {
  bookingId: string | null;
  shopifyOrderId: string | null;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  generationLimit: number;
  generationsUsed: number;
  tryOnLimit: number;
  tryOnsUsed: number;
}

/**
 * The single, centralised demo session (persisted to localStorage).
 * Production: split between Shopify (order/payment/customer) and the
 * Halcyonic backend (Supabase) keyed by Shopify order id.
 */
export interface DemoSession extends BookingAccess {
  schemaVersion: 1;
  order: MockShopifyOrder | null;
  paidAt: string | null;
  customer: Customer | null;
  designDraft: DesignDraft | null;
  /** In-progress edits while modifying a specific concept (kept apart from the new-design draft). */
  modifyDraft: { baseId: string; draft: DesignDraft } | null;
  /** Last submitted design request. */
  designRequest: DesignRequest | null;
  generations: DesignResult[];
  selectedGenerationId: string | null;
  tryOn: TryOnResult | null;
  finalizedAt: string | null;
  finalDesignId: string | null;
  lastError: { state: ErrorState; at: string; message: string } | null;
  /** Set while a generation / try-on request is running (shared across pages and tabs). */
  aiInFlight: { kind: "design" | "tryon"; startedAt: string } | null;
  events: BookingEvent[];
  demo: {
    failNextPayment: boolean;
    failNextGeneration: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
