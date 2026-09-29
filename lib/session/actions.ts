import type {
  BookingEvent,
  BookingEventType,
  Customer,
  DemoSession,
  MockShopifyOrder,
} from "@/types/booking";
import type { DesignDraft, DesignRequest, DesignResult, TryOnResult } from "@/types/design";
import { createId } from "@/lib/utils";
import { isFinalized } from "@/lib/usage/quota";
import { commitOrderNumber, resetSession, updateSession } from "./store";

/**
 * Session mutations. Each one mirrors a production side-effect:
 * Shopify order webhook, Supabase writes, usage counter increments, etc.
 */

function event(type: BookingEventType, label: string): BookingEvent {
  return { id: createId("evt"), at: new Date().toISOString(), type, label };
}

export function applyPaidOrder(input: {
  order: MockShopifyOrder;
  bookingId: string;
  customer: Customer;
  generationLimit: number;
  tryOnLimit: number;
}) {
  commitOrderNumber(input.order.orderNumber);
  return updateSession((s) => ({
    ...s,
    bookingId: input.bookingId,
    shopifyOrderId: input.order.name,
    order: input.order,
    paymentStatus: "paid",
    status: "paid",
    paidAt: input.order.createdAt,
    customer: input.customer,
    generationLimit: input.generationLimit,
    tryOnLimit: input.tryOnLimit,
    lastError: null,
    demo: { ...s.demo, failNextPayment: false },
    events: [
      ...s.events,
      event("order_paid", `Order ${input.order.name} paid · RM${input.order.totalPrice}`),
      event("session_unlocked", "AI design session unlocked"),
    ],
  }));
}

export function applyPaymentFailure(message: string) {
  return updateSession((s) => ({
    ...s,
    paymentStatus: s.paymentStatus === "paid" ? "paid" : "failed",
    lastError: { state: "PAYMENT_FAILED", at: new Date().toISOString(), message },
    demo: { ...s.demo, failNextPayment: false },
    events: [...s.events, event("payment_failed", "Payment declined — no order created")],
  }));
}

export function saveDraft(draft: DesignDraft) {
  return updateSession((s) => ({ ...s, designDraft: draft }));
}

/** Autosave for modify mode, keyed by the concept being edited. */
export function saveModifyDraft(baseId: string, draft: DesignDraft) {
  return updateSession((s) => ({ ...s, modifyDraft: { baseId, draft } }));
}

export function markDesigning() {
  return updateSession((s) => (s.status === "paid" ? { ...s, status: "designing" } : s));
}

/**
 * A result only lands in the booking that requested it. If the demo was reset (or the
 * design finalized) while a request was in flight, the late result is dropped.
 */
function acceptsResultFor(s: DemoSession, bookingId: string | null): boolean {
  return Boolean(bookingId) && s.bookingId === bookingId && s.paymentStatus === "paid" && !isFinalized(s);
}

/** Marks an AI request as running so other pages/tabs don't start a second one. */
export function markAiInFlight(kind: "design" | "tryon") {
  return updateSession((s) => ({ ...s, aiInFlight: { kind, startedAt: new Date().toISOString() } }));
}

export function clearAiInFlight() {
  return updateSession((s) => (s.aiInFlight ? { ...s, aiInFlight: null } : s));
}

export function applyGeneration(input: {
  bookingId: string | null;
  result: DesignResult;
  request: DesignRequest;
  generationsUsed: number;
}) {
  return updateSession((s) => {
    if (!acceptsResultFor(s, input.bookingId)) return s;
    const generations = [...s.generations, { ...input.result, referenceImages: input.request.referenceImages }];
    // Pixels live on the concept; the last request keeps only image names to save storage.
    const requestWithoutPixels = {
      ...input.request,
      referenceImages: input.request.referenceImages.map((i) => ({ ...i, dataUrl: "" })),
    };
    return {
      ...s,
      generations,
      selectedGenerationId: input.result.id,
      // Never count less than one more than we had (guards against two tabs racing).
      generationsUsed: Math.min(s.generationLimit, Math.max(s.generationsUsed + 1, input.generationsUsed)),
      designRequest: requestWithoutPixels,
      aiInFlight: null,
      // A modification was just submitted, so its in-progress edits are done.
      modifyDraft: input.result.kind === "modification" ? null : s.modifyDraft,
      status: generations.length === 1 ? "generated" : "revision",
      lastError: null,
      demo: { ...s.demo, failNextGeneration: false },
      events: [
        ...s.events,
        event(
          "design_generated",
          `Concept ${input.result.version} generated (${
            input.result.kind === "initial" ? "initial design" : input.result.kind
          })`,
        ),
      ],
    };
  });
}

export function applyGenerationFailure(message: string) {
  return updateSession((s) => ({
    ...s,
    lastError: { state: "GENERATION_FAILED", at: new Date().toISOString(), message },
    aiInFlight: null,
    demo: { ...s.demo, failNextGeneration: false },
    events: [...s.events, event("generation_failed", "Design generation failed — no usage consumed")],
  }));
}

export function recordLimitReached(message: string) {
  return updateSession((s) => ({
    ...s,
    lastError: { state: "LIMIT_REACHED", at: new Date().toISOString(), message },
    events:
      s.lastError?.state === "LIMIT_REACHED"
        ? s.events
        : [...s.events, event("limit_reached", "Customer tried to generate after the included limit")],
  }));
}

export function selectGeneration(id: string) {
  return updateSession((s) => {
    const found = s.generations.find((g) => g.id === id);
    if (!found || s.selectedGenerationId === id) return s;
    return {
      ...s,
      selectedGenerationId: id,
      events: [...s.events, event("design_selected", `Customer selected Concept ${found.version}`)],
    };
  });
}

export function applyTryOn(input: { bookingId: string | null; result: TryOnResult; tryOnsUsed: number }) {
  return updateSession((s) => {
    if (!acceptsResultFor(s, input.bookingId)) return s;
    return {
      ...s,
      tryOn: input.result,
      aiInFlight: null,
      tryOnsUsed: Math.min(s.tryOnLimit, Math.max(s.tryOnsUsed + 1, input.tryOnsUsed)),
      lastError: null,
      events: [...s.events, event("tryon_generated", `Virtual try-on created for Concept ${input.result.designVersion}`)],
    };
  });
}

/** Submits the concept the customer confirmed (by id), falling back to the selected one. */
export function finalizeDesign(designId?: string) {
  return updateSession((s) => {
    const final =
      s.generations.find((g) => g.id === designId) ??
      s.generations.find((g) => g.id === s.selectedGenerationId) ??
      s.generations.at(-1);
    if (!final || s.paymentStatus !== "paid") return s;
    return {
      ...s,
      status: "finalized",
      selectedGenerationId: final.id,
      finalDesignId: final.id,
      finalizedAt: new Date().toISOString(),
      events: [...s.events, event("design_finalized", `Concept ${final.version} submitted to Wajie Ibrahim`)],
    };
  });
}

/** Staff-side status changes, performed from the Shopify Admin preview. */
export function setStaffStatus(status: "staff_review" | "completed") {
  return updateSession((s) => ({
    ...s,
    status,
    events: [
      ...s.events,
      status === "staff_review"
        ? event("staff_review_started", "Staff review started in Shopify Admin")
        : event("completed", "Design request marked completed"),
    ],
  }));
}

export function setDemoFlag(flag: keyof DemoSession["demo"], value: boolean) {
  return updateSession((s) => ({ ...s, demo: { ...s.demo, [flag]: value } }));
}

export { resetSession };
