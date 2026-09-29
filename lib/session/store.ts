import type { DemoSession } from "@/types/booking";
import { DEFAULT_LIMITS } from "@/lib/usage/quota";

/**
 * Demo persistence — a tiny external store backed by localStorage.
 *
 * MOCK ONLY. In production this state is split between Shopify (order, payment,
 * customer) and the Halcyonic backend (Supabase: design requests, generations,
 * usage counters, storage objects), keyed by the Shopify order id.
 */

const SESSION_KEY = "wi-ai-design/session@v1";
const ORDER_SEQ_KEY = "wi-ai-design/order-seq@v1";
const FIRST_ORDER_NUMBER = 1042;

type Listener = () => void;

let cache: DemoSession | undefined;
const listeners = new Set<Listener>();
let storageWarning = false;

export function createEmptySession(): DemoSession {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    bookingId: null,
    shopifyOrderId: null,
    paymentStatus: "unpaid",
    status: "unpaid",
    generationLimit: DEFAULT_LIMITS.generationLimit,
    generationsUsed: 0,
    tryOnLimit: DEFAULT_LIMITS.tryOnLimit,
    tryOnsUsed: 0,
    order: null,
    paidAt: null,
    customer: null,
    designDraft: null,
    modifyDraft: null,
    designRequest: null,
    generations: [],
    selectedGenerationId: null,
    tryOn: null,
    finalizedAt: null,
    finalDesignId: null,
    lastError: null,
    aiInFlight: null,
    events: [],
    demo: { failNextPayment: false, failNextGeneration: false },
    createdAt: now,
    updatedAt: now,
  };
}

function readFromStorage(): DemoSession {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return createEmptySession();
    const parsed = JSON.parse(raw) as DemoSession;
    if (parsed?.schemaVersion !== 1) return createEmptySession();
    // Merge onto a fresh session so newly added fields always exist.
    return { ...createEmptySession(), ...parsed, demo: { ...createEmptySession().demo, ...parsed.demo } };
  } catch {
    return createEmptySession();
  }
}

const strip = <T extends { dataUrl: string }>(img: T): T => ({ ...img, dataUrl: "" });
const stripImages = <T extends { referenceImages: { dataUrl: string }[] }>(d: T): T => ({
  ...d,
  referenceImages: d.referenceImages.map(strip),
});

/**
 * Ways to shrink the session when localStorage is full, least valuable pixels first:
 * form drafts → earlier concepts' references → everything (final concept + try-on photo last).
 */
const SHRINK_STEPS: ((s: DemoSession) => DemoSession)[] = [
  (s) => ({
    ...s,
    designDraft: s.designDraft ? stripImages(s.designDraft) : null,
    modifyDraft: s.modifyDraft ? { ...s.modifyDraft, draft: stripImages(s.modifyDraft.draft) } : null,
    designRequest: s.designRequest ? stripImages(s.designRequest) : null,
  }),
  (s) => {
    const keep = s.finalDesignId ?? s.selectedGenerationId;
    return {
      ...s,
      generations: s.generations.map((g) => (g.id !== keep && g.referenceImages ? stripImages(g as Required<typeof g>) : g)),
    };
  },
  (s) => ({
    ...s,
    generations: s.generations.map((g) => (g.referenceImages ? stripImages(g as Required<typeof g>) : g)),
    tryOn: s.tryOn ? { ...s.tryOn, customerPhoto: strip(s.tryOn.customerPhoto) } : null,
  }),
];

function writeToStorage(s: DemoSession) {
  let candidate = s;
  for (let step = 0; step <= SHRINK_STEPS.length; step++) {
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(candidate));
      storageWarning = step > 0;
      return;
    } catch {
      if (step < SHRINK_STEPS.length) candidate = SHRINK_STEPS[step](candidate);
    }
  }
  storageWarning = true;
}

function emit() {
  for (const l of listeners) l();
}

function onStorage(e: StorageEvent) {
  // Keep other tabs in sync (e.g. the Shopify Admin preview open next to the storefront).
  if (e.key === SESSION_KEY || e.key === null) {
    cache = readFromStorage();
    emit();
  }
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): DemoSession {
  if (cache === undefined) cache = readFromStorage();
  return cache;
}

/** No session exists on the server — components render a neutral state until hydrated. */
export function getServerSnapshot(): DemoSession | null {
  return null;
}

export function updateSession(mutate: (current: DemoSession) => DemoSession): DemoSession {
  const next = { ...mutate(getSnapshot()), updatedAt: new Date().toISOString() };
  cache = next;
  writeToStorage(next);
  emit();
  return next;
}

export function hasStorageWarning(): boolean {
  return storageWarning;
}

/** Next mock Shopify order number (#WI-AI-1042, 1043, …). Production: Shopify assigns this. */
export function peekNextOrderNumber(): number {
  try {
    const raw = window.localStorage.getItem(ORDER_SEQ_KEY);
    const n = raw ? Number.parseInt(raw, 10) : FIRST_ORDER_NUMBER;
    return Number.isFinite(n) && n >= FIRST_ORDER_NUMBER ? n : FIRST_ORDER_NUMBER;
  } catch {
    return FIRST_ORDER_NUMBER;
  }
}

export function commitOrderNumber(used: number) {
  try {
    window.localStorage.setItem(ORDER_SEQ_KEY, String(used + 1));
  } catch {
    /* ignore — sequence is cosmetic */
  }
}

/** Clears the booking and restarts the order sequence, so every rehearsal begins at #WI-AI-1042. */
export function resetSession(): DemoSession {
  const fresh = createEmptySession();
  cache = fresh;
  try {
    window.localStorage.removeItem(ORDER_SEQ_KEY);
  } catch {
    /* ignore */
  }
  writeToStorage(fresh);
  emit();
  return fresh;
}
