"use client";

import { useCallback, useRef, useState } from "react";
import type { DesignResult, TryOnResult } from "@/types/design";
import { applyTryOn, clearAiInFlight, markAiInFlight } from "@/lib/session/actions";
import { aiBusy } from "@/lib/session/use-demo-session";
import { getSnapshot } from "@/lib/session/store";
import { checkTryOnAccess } from "@/lib/usage/quota";
import { api, ApiError, bookingAccessOf, type ClientErrorCode } from "./api";
import { runWithStages, TRYON_STAGES } from "./staged";

export type TryOnState =
  | { phase: "idle" }
  | { phase: "running"; stage: number }
  | { phase: "done" }
  | { phase: "error"; code: ClientErrorCode; message: string };

/** Virtual try-on: paid? open? try-on quota? → API → commit usage + result. */
export function useTryOn() {
  const [state, setState] = useState<TryOnState>({ phase: "idle" });
  const inFlight = useRef(false);

  const run = useCallback(async (design: DesignResult, photo: TryOnResult["customerPhoto"]): Promise<boolean> => {
    if (inFlight.current) return false;
    const session = getSnapshot();
    if (aiBusy(session)) {
      setState({ phase: "error", code: "IN_PROGRESS", message: "Your previous request is still running." });
      return false;
    }
    const access = checkTryOnAccess(session, true);
    if (!access.ok) {
      setState({ phase: "error", code: access.code, message: access.message });
      return false;
    }
    inFlight.current = true;
    markAiInFlight("tryon");
    setState({ phase: "running", stage: 0 });
    try {
      const res = await runWithStages(
        () =>
          api.tryOn({
            booking: bookingAccessOf(session),
            design: { id: design.id, version: design.version, imageUrl: design.imageUrl, seed: design.seed },
          }),
        TRYON_STAGES.length,
        (stage) => setState({ phase: "running", stage }),
      );
      applyTryOn({ bookingId: session.bookingId, result: { ...res.result, customerPhoto: photo }, tryOnsUsed: res.usage.tryOnsUsed });
      setState({ phase: "done" });
      return true;
    } catch (err) {
      const e = err instanceof ApiError ? err : new ApiError("TRYON_FAILED", "Something went wrong on our side.");
      setState({ phase: "error", code: e.code, message: e.message });
      return false;
    } finally {
      inFlight.current = false;
      clearAiInFlight();
    }
  }, []);

  const reset = useCallback(() => setState({ phase: "idle" }), []);
  return { state, run, reset };
}
