import type { DesignSpecification } from "@/types/design";
import { cn } from "@/lib/utils";

export const SPEC_ROWS: { key: keyof DesignSpecification; label: string }[] = [
  { key: "garment", label: "Garment" },
  { key: "silhouette", label: "Silhouette" },
  { key: "neckline", label: "Neckline" },
  { key: "sleeves", label: "Sleeves" },
  { key: "length", label: "Length" },
  { key: "fabric", label: "Fabric" },
  { key: "colour", label: "Colour" },
  { key: "details", label: "Details" },
  { key: "placement", label: "Placement" },
  { key: "finishing", label: "Finishing" },
  { key: "occasion", label: "Occasion" },
  { key: "style", label: "Style" },
];

/** Structured specification as a quiet two-column list (never raw JSON). */
export function SpecList({ spec, className, dense }: { spec: DesignSpecification; className?: string; dense?: boolean }) {
  return (
    <dl className={cn("divide-y divide-line", className)}>
      {SPEC_ROWS.map(({ key, label }) => (
        <div key={key} className={cn("grid grid-cols-[110px_1fr] gap-4", dense ? "py-2" : "py-3")}>
          <dt className="text-[11px] uppercase text-muted">{label}</dt>
          <dd className="text-[13px] leading-snug">{spec[key]}</dd>
        </div>
      ))}
    </dl>
  );
}

export function KeyValueList({ rows, className }: { rows: { label: string; value: React.ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-line", className)}>
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[110px_1fr] gap-4 py-3">
          <dt className="text-[11px] uppercase text-muted">{r.label}</dt>
          <dd className="text-[13px] leading-snug">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
