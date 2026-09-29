import { cn } from "@/lib/utils";

/** Quiet usage indicator: label, "used / included", and square segments. */
export function UsageMeter({
  label,
  used,
  limit,
  className,
  compact,
}: {
  label: string;
  used: number;
  limit: number;
  className?: string;
  compact?: boolean;
}) {
  const remaining = Math.max(0, limit - used);
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div>
        <p className="text-[12px] uppercase">{label}</p>
        {!compact ? (
          <p className="text-[12px] text-muted">
            {remaining === 0 ? "All used" : `${remaining} of ${limit} remaining`}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1" aria-hidden="true">
          {Array.from({ length: limit }, (_, i) => (
            <span key={i} className={cn("size-2.5 border border-black", i < used ? "bg-black" : "bg-transparent")} />
          ))}
        </div>
        <span className="text-[12px] tabular-nums" aria-label={`${used} of ${limit} used`}>
          {used}/{limit}
        </span>
      </div>
    </div>
  );
}
