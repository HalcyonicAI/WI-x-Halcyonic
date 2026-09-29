import type { ReactNode } from "react";
import { ChevronDownIcon } from "./icons";
import { cn } from "@/lib/utils";

/**
 * Product-page accordion, mirroring the storefront's "DESCRIPTION" row:
 * #DEDEDE hairlines, bold 12px uppercase summary, chevron on the right.
 */
export function Accordion({
  title,
  children,
  defaultOpen,
  className,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details open={defaultOpen} className={cn("group border-b border-line first:border-t", className)}>
      <summary className="flex cursor-pointer items-center justify-between gap-4 py-3.5 text-[12px] font-bold uppercase leading-tight">
        <span>{title}</span>
        <ChevronDownIcon size={16} className="shrink-0 transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="pb-5 text-[12px] leading-[1.6] text-ink">{children}</div>
    </details>
  );
}
