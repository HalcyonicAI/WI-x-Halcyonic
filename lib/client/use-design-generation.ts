"use client";

import { useCallback, useRef, useState } from "react";
import type { DesignRequest, DesignVariant, GenerationKind } from "@/types/design";
import { applyGeneration, applyGenerationFailure, clearAiInFlight, markAiInFlight, recordLimitReached } from "@/lib/session/actions";
import { aiBusy } from "@/lib/session/use-demo-session";
import { getSnapshot } from "@/lib/session/store";
import { checkGenerationAccess } from "@/lib/usage/quota";
import { api, ApiError, bookingAccessOf, toPayload, type ClientErrorCode } from "./api";
import { DESIGN_STAGES, runWithStages } from "./staged";

export type GenerationState =
  | { phase: "idle" }
  | { phase: "running"; stage: number; kind: GenerationKind }
  /** Result committed to the session; the page decides what to show next. */
  | { phase: "done" }
  | { phase: "error"; code: ClientErrorCode; message: string };

/**
 * Runs one design generation end-to-end:
 *   client pre-check (paid? open? quota?) → API (re-checks server-side) → commit usage + result.
 * Usage is only consumed when a design is actually returned.
 */
export function useDesignGeneration() {
  const [state, setState] = useState<GenerationState>({ phase: "idle" });
  const inFlight = useRef(false);

  const generate = useCallback(async (request: DesignRequest, kind: GenerationKind, base?: DesignVariant): Promise<boolean> => {
    if (inFlight.current) return false;
    const session = getSnapshot();
    if (aiBusy(session)) {
      setState({ phase: "error", code: "IN_PROGRESS", message: "Your previous design is still being created." });
      return false;
    }
    const access = checkGenerationAccess(session);
    if (!access.ok) {
      if (access.code === "GENERATION_LIMIT_REACHED") recordLimitReached(access.message);
      setState({ phase: "error", code: access.code, message: access.message });
      return false;
    }

    inFlight.current = true;
    markAiInFlight("design");
    setState({ phase: "running", stage: 0, kind });
    try {
      const res = await runWithStages(
        () =>
          api.generateDesign({
            booking: bookingAccessOf(session),
            request: toPayload(request),
            kind,
            base,
            simulateFailure: session.demo.failNextGeneration,
          }),
        DESIGN_STAGES.length,
        (stage) => setState({ phase: "running", stage, kind }),
      );
      applyGeneration({ bookingId: session.bookingId, result: res.result, request, generationsUsed: res.usage.generationsUsed });
      setState({ phase: "done" });
      return true;
    } catch (err) {
      const e = err instanceof ApiError ? err : new ApiError("GENERATION_FAILED", "Something went wrong on our side.");
      if (e.code === "GENERATION_FAILED" || e.code === "NETWORK_ERROR") applyGenerationFailure(e.message);
      if (e.code === "GENERATION_LIMIT_REACHED") recordLimitReached(e.message);
      setState({ phase: "error", code: e.code, message: e.message });
      return false;
    } finally {
      inFlight.current = false;
      clearAiInFlight();
    }
  }, []);

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  return { state, generate, reset };
}
