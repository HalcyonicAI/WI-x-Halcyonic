import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal Polaris-like primitives for the Shopify Admin *preview* only.
 * Intentionally different from the storefront styling: this imitates the admin
 * Wajie's staff already use, to show where the AI data would live.
 */

export function AdminCard({
  title,
  action,
  children,
  className,
  flush,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl bg-white shadow-[0_1px_0_0_rgba(26,26,26,0.07),0_0_0_1px_rgba(26,26,26,0.07)]",
        className,
      )}
    >
      {title ? (
        <header className="flex items-center justify-between gap-3 px-4 pt-4">
          <h2 className="text-[13px] font-semibold text-[#303030]">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className={cn(!flush && "p-4")}>{children}</div>
    </section>
  );
}

type Tone = "neutral" | "success" | "attention" | "info" | "warning";

const TONES: Record<Tone, string> = {
  neutral: "bg-[#e3e3e3] text-[#303030]",
  success: "bg-[#cdfee1] text-[#0c5132]",
  attention: "bg-[#ffeb78] text-[#4f4700]",
  info: "bg-[#e0f0ff] text-[#00527c]",
  warning: "bg-[#ffd6a4] text-[#5e4200]",
};

export function AdminBadge({ tone = "neutral", children, dot }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[12px] font-medium leading-5", TONES[tone])}>
      {dot ? <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function AdminButton({
  children,
  primary,
  onClick,
  disabled,
  title,
}: {
  children: ReactNode;
  primary?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex min-h-8 items-center justify-center rounded-lg px-3 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        primary
          ? "bg-[#303030] text-white shadow-[inset_0_-1px_0_rgba(255,255,255,0.2)] hover:bg-[#1a1a1a]"
          : "bg-white text-[#303030] shadow-[0_0_0_1px_rgba(0,0,0,0.12),0_1px_0_rgba(0,0,0,0.08)] hover:bg-[#f7f7f7]",
      )}
    >
      {children}
    </button>
  );
}
