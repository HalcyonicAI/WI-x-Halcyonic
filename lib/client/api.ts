import type {
  ApiErrorBody,
  ApiErrorCode,
  CheckoutRequest,
  CheckoutResponse,
  DesignGenerationRequest,
  DesignGenerationResponse,
  TryOnRequest,
  TryOnResponse,
} from "@/lib/api/contracts";
import type { BookingAccess, DemoSession } from "@/types/booking";
import type { DesignRequest, DesignRequestPayload, DesignResult } from "@/types/design";

/** Browser-side client for the app's own API routes. The UI never talks to AI vendors directly. */

export type ClientErrorCode = ApiErrorCode | "NETWORK_ERROR" | "IN_PROGRESS";

export class ApiError extends Error {
  constructor(
    public code: ClientErrorCode,
    message: string,
    public status = 0,
  ) {
    super(message);
  }
}

async function post<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", "We couldn't reach our design studio. Please check your connection.");
  }
  const data = (await res.json().catch(() => null)) as (T & Partial<ApiErrorBody>) | null;
  if (!res.ok || !data) {
    const err = data?.error;
    throw new ApiError(err?.code ?? "GENERATION_FAILED", err?.message ?? "Something went wrong on our side.", res.status);
  }
  return data;
}

export const api = {
  checkout: (body: CheckoutRequest) => post<CheckoutResponse>("/api/checkout", body),
  generateDesign: (body: DesignGenerationRequest) => post<DesignGenerationResponse>("/api/ai/design", body),
  tryOn: (body: TryOnRequest) => post<TryOnResponse>("/api/ai/try-on", body),
};

export function bookingAccessOf(s: DemoSession): BookingAccess {
  return {
    bookingId: s.bookingId,
    shopifyOrderId: s.shopifyOrderId,
    paymentStatus: s.paymentStatus,
    status: s.status,
    generationLimit: s.generationLimit,
    generationsUsed: s.generationsUsed,
    tryOnLimit: s.tryOnLimit,
    tryOnsUsed: s.tryOnsUsed,
  };
}

export function toPayload(r: DesignRequest): DesignRequestPayload {
  const { referenceImages, ...rest } = r;
  return { ...rest, referenceImageCount: referenceImages.length };
}

/** The inverse of toPayload: the full request behind a concept, with its own reference images. */
export function requestFromResult(g: DesignResult): DesignRequest {
  const { referenceImageCount: _count, ...rest } = g.request;
  void _count;
  return { ...rest, referenceImages: g.referenceImages ?? [] };
}
