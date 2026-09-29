import type { DesignGenerationRequest, DesignGenerationResponse } from "@/lib/api/contracts";
import { apiError, readJson } from "@/lib/api/respond";
import { parseDesignRequestPayload, parseVariant } from "@/lib/api/validate";
import { runDesignPipeline } from "@/lib/ai/pipeline";
import { verifyBookingAccess } from "@/lib/shopify/mock-shopify";
import { checkGenerationAccess } from "@/lib/usage/quota";

/**
 * Generate (or regenerate / modify) a design concept.
 *
 * Order of checks — identical in production:
 *   1. Is payment confirmed?          → 402 PAYMENT_REQUIRED
 *   2. Is the booking still open?     → 409 BOOKING_FINALIZED
 *   3. Is generation quota remaining? → 429 GENERATION_LIMIT_REACHED
 *   4. Generate → 5. Increment usage (returned to the client; production writes it to the DB)
 */
export async function POST(request: Request) {
  const body = await readJson<DesignGenerationRequest>(request);
  const booking = verifyBookingAccess(body?.booking);
  if (!booking) return apiError("PAYMENT_REQUIRED", "A paid booking is required before a design can be generated.");

  const access = checkGenerationAccess(booking);
  if (!access.ok) return apiError(access.code, access.message);

  const payload = parseDesignRequestPayload(body?.request);
  if (!payload) return apiError("BAD_REQUEST", "Some design details are missing. Please review the form.");

  const kind = body?.kind === "regeneration" || body?.kind === "modification" ? body.kind : "initial";

  if (body?.simulateFailure) {
    // Demo-only switch to show the GENERATION FAILED state. Usage is NOT consumed.
    await new Promise((r) => setTimeout(r, 900));
    return apiError("GENERATION_FAILED", "We couldn't create your design this time.");
  }

  const version = booking.generationsUsed + 1;
  const result = await runDesignPipeline({ request: payload, kind, version, base: parseVariant(body?.base) });

  const response: DesignGenerationResponse = {
    result,
    usage: { generationsUsed: booking.generationsUsed + 1, generationLimit: booking.generationLimit },
  };
  return Response.json(response);
}
