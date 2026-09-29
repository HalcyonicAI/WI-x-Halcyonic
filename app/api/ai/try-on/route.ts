import type { TryOnRequest, TryOnResponse } from "@/lib/api/contracts";
import { apiError, readJson } from "@/lib/api/respond";
import { runTryOnPipeline } from "@/lib/ai/pipeline";
import { verifyBookingAccess } from "@/lib/shopify/mock-shopify";
import { checkTryOnAccess } from "@/lib/usage/quota";

/**
 * Virtual try-on (mock FASHN). Same gate as generation: paid → open → quota → generate → increment.
 * The customer photo is NOT uploaded in the mock; production uploads it to Supabase Storage
 * and passes a short-lived signed URL to FASHN.
 */
export async function POST(request: Request) {
  const body = await readJson<TryOnRequest>(request);
  const booking = verifyBookingAccess(body?.booking);
  if (!booking) return apiError("PAYMENT_REQUIRED", "A paid booking is required before a try-on can be created.");

  const design = body?.design;
  const hasDesign = Boolean(
    design && typeof design.id === "string" && typeof design.imageUrl === "string" && design.imageUrl.startsWith("/api/mock-render"),
  );

  const access = checkTryOnAccess(booking, hasDesign);
  if (!access.ok) return apiError(access.code, access.message);

  const result = await runTryOnPipeline({
    design: {
      id: design!.id,
      version: Number(design!.version) || 1,
      imageUrl: design!.imageUrl,
      seed: Number(design!.seed) || 1,
    },
  });

  const response: TryOnResponse = {
    result,
    usage: { tryOnsUsed: booking.tryOnsUsed + 1, tryOnLimit: booking.tryOnLimit },
  };
  return Response.json(response);
}
