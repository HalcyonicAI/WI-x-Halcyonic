/** Small, dependency-free helpers shared across client and server. */

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function createId(prefix: string): string {
  const raw =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(16).slice(2) + Date.now().toString(16);
  return `${prefix}_${raw.slice(0, 12)}`;
}

/** FNV-1a 32-bit hash — deterministic seeds for mock generation. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic PRNG (mulberry32). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(items: readonly T[], index: number): T {
  return items[((index % items.length) + items.length) % items.length];
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MY_TZ = "Asia/Kuala_Lumpur";

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-MY", {
    timeZone: MY_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatMYR(amount: number): string {
  return `RM${amount.toFixed(2)}`;
}

/** Common Malay name prefixes that belong with the following word ("Nur Aisyah", "Siti Hajar"). */
const NAME_PREFIXES = new Set([
  "nur", "nurul", "noor", "nor", "siti", "muhammad", "muhamad", "mohamad", "mohammad", "mohd", "muhd", "ahmad",
  "wan", "nik", "tengku", "tunku", "raja", "syed", "sharifah", "puteri", "megat", "abdul", "abd",
]);

export function firstName(fullName: string | undefined | null): string {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length > 2 && NAME_PREFIXES.has(parts[0].toLowerCase())) return `${parts[0]} ${parts[1]}`;
  return parts[0] ?? "";
}

/** "#WI-AI-1042" → "WI-AI-1042" (URL-safe order reference). */
export function orderSlug(orderName: string): string {
  return orderName.replace(/^#/, "");
}

export function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function joinNatural(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
