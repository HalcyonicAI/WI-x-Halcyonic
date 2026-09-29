"use client";

import { useSyncExternalStore } from "react";
import type { DemoSession } from "@/types/booking";
import type { DesignResult } from "@/types/design";
import { getServerSnapshot, getSnapshot, subscribe } from "./store";

/**
 * Read the demo session. Returns `null` during server render and hydration,
 * then the persisted session on the client.
 */
export function useDemoSession(): DemoSession | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function selectedGeneration(s: DemoSession | null): DesignResult | null {
  if (!s || s.generations.length === 0) return null;
  return s.generations.find((g) => g.id === s.selectedGenerationId) ?? s.generations[s.generations.length - 1];
}

/** True while a generation or try-on is running somewhere (ignores stale markers > 60s old). */
export function aiBusy(s: DemoSession | null): boolean {
  if (!s?.aiInFlight) return false;
  return Date.now() - new Date(s.aiInFlight.startedAt).getTime() < 60_000;
}

export function finalGeneration(s: DemoSession | null): DesignResult | null {
  if (!s) return null;
  if (s.finalDesignId) return s.generations.find((g) => g.id === s.finalDesignId) ?? null;
  return null;
}
