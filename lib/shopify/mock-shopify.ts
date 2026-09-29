import "server-only";
import type { BookingAccess, Customer, MockShopifyOrder, PaymentMethod } from "@/types/booking";
import { createId, sleep } from "@/lib/utils";
import { BOOKING_PRICE_MYR, DEFAULT_LIMITS } from "@/lib/usage/quota";

/**
 * MOCK Shopify adapter.
 *
 * Production replacement:
 *  - Checkout: the storefront adds the "AI Custom Design Booking" product (RM5) to the
 *    cart and sends the customer to real Shopify checkout. No payment code lives here.
 *  - Order creation: Shopify fires `orders/paid` → Halcyonic webhook creates the AI
 *    booking row in Supabase with the default usage limits.
 *  - Verification: every AI request looks the booking up server-side by order id and
 *    checks `financial_status === "paid"` via the Shopify Admin API / our DB.
 */

export const AI_BOOKING_PRODUCT = {
  title: "AI Custom Design Booking",
  sku: "WI-AI-DESIGN-BOOKING",
  price: BOOKING_PRICE_MYR.toFixed(2),
} as const;

export class PaymentDeclinedError extends Error {
  code = "PAYMENT_FAILED" as const;
}

export async function createMockShopifyOrder(input: {
  orderNumber: number;
  customer: Customer;
  paymentMethod: PaymentMethod;
  simulateDecline?: boolean;
}): Promise<{ order: MockShopifyOrder; bookingId: string; generationLimit: number; tryOnLimit: number }> {
  await sleep(700);
  if (input.simulateDecline) {
    throw new PaymentDeclinedError("The bank didn't approve this payment, and no charge was made.");
  }

  const order: MockShopifyOrder = {
    id: `gid://shopify/Order/mock-${input.orderNumber}`,
    name: `#WI-AI-${input.orderNumber}`,
    orderNumber: input.orderNumber,
    financialStatus: "paid",
    fulfillmentStatus: "unfulfilled",
    currency: "MYR",
    totalPrice: AI_BOOKING_PRODUCT.price,
    createdAt: new Date().toISOString(),
    paymentMethod: input.paymentMethod,
    lineItems: [
      { title: AI_BOOKING_PRODUCT.title, sku: AI_BOOKING_PRODUCT.sku, quantity: 1, price: AI_BOOKING_PRODUCT.price },
    ],
    tags: ["ai-custom-design", "halcyonic-ai"],
  };

  return {
    order,
    bookingId: createId("bk"),
    generationLimit: DEFAULT_LIMITS.generationLimit,
    tryOnLimit: DEFAULT_LIMITS.tryOnLimit,
  };
}

/**
 * Verifies the booking behind an AI request.
 *
 * MOCK: trusts the booking snapshot sent by the browser (the demo keeps state in
 * localStorage). PRODUCTION: ignore client-sent status entirely — load the booking by
 * `bookingId`/`shopifyOrderId` from Supabase, confirm the Shopify order is paid, and read
 * usage counters from the database before and after generating.
 */
export function verifyBookingAccess(snapshot: unknown): BookingAccess | null {
  if (!snapshot || typeof snapshot !== "object") return null;
  const b = snapshot as Partial<BookingAccess>;
  const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
  if (typeof b.shopifyOrderId !== "string" || typeof b.bookingId !== "string") return null;
  return {
    bookingId: b.bookingId,
    shopifyOrderId: b.shopifyOrderId,
    paymentStatus: b.paymentStatus === "paid" ? "paid" : "unpaid",
    status: typeof b.status === "string" ? b.status : "unpaid",
    // Limits are never taken from the client in production; the mock clamps them to defaults.
    generationLimit: Math.min(num(b.generationLimit, DEFAULT_LIMITS.generationLimit), DEFAULT_LIMITS.generationLimit),
    generationsUsed: num(b.generationsUsed, 0),
    tryOnLimit: Math.min(num(b.tryOnLimit, DEFAULT_LIMITS.tryOnLimit), DEFAULT_LIMITS.tryOnLimit),
    tryOnsUsed: num(b.tryOnsUsed, 0),
  };
}
