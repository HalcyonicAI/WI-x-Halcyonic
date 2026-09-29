import type { ReactNode } from "react";
import { AlertIcon, InfoIcon, LockIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** Calm inline message. Tones: info (cream), limit (panel grey), error (hairline + muted crimson icon). */
export function Notice({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: "info" | "limit" | "error" | "locked";
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const Icon = tone === "error" ? AlertIcon : tone === "locked" ? LockIcon : InfoIcon;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 p-4",
        tone === "info" && "bg-cream",
        tone === "limit" && "bg-panel",
        tone === "locked" && "bg-cream",
        tone === "error" && "border border-danger/30 bg-white",
        className,
      )}
    >
      <Icon size={18} className={cn("mt-0.5 shrink-0", tone === "error" && "text-danger")} />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium uppercase leading-snug">{title}</p>
        {children ? <div className="mt-1 text-[12px] leading-[1.6] text-muted">{children}</div> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
