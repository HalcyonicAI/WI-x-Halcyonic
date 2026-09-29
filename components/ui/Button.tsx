import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Buttons follow the live storefront: square corners, uppercase 12px label,
 * solid black primary ("PRE-ORDER HERE", "VIEW ALL") and a cream secondary
 * ("SCHEDULE YOUR TIME" on booking product pages). "outline" is the quiet third level,
 * modelled on the site's white tabs with an #E6E6E6 hairline (no hover inversion).
 */

export type ButtonVariant = "primary" | "secondary" | "outline" | "text";

const base =
  "inline-flex items-center justify-center gap-2 select-none whitespace-nowrap uppercase text-[12px] leading-none tracking-[0.02em] transition-colors duration-200 ease-[var(--ease-wi)] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed aria-disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary:
    "min-h-12 px-8 bg-black text-white hover:bg-[#2b2b2b] disabled:bg-[#e4e4e4] disabled:text-[#8a8a8a] aria-disabled:bg-[#e4e4e4] aria-disabled:text-[#8a8a8a]",
  secondary:
    "min-h-12 px-8 bg-cream text-black hover:bg-[#f3eadf] disabled:bg-[#f4f4f4] disabled:text-[#9a9a9a] aria-disabled:bg-[#f4f4f4] aria-disabled:text-[#9a9a9a]",
  outline:
    "min-h-12 px-6 border border-[#e6e6e6] bg-white text-black hover:border-black disabled:text-[#9a9a9a] disabled:hover:border-[#e6e6e6] aria-disabled:text-[#9a9a9a] aria-disabled:hover:border-[#e6e6e6]",
  text: "min-h-10 px-0 text-black underline underline-offset-4 decoration-1 hover:decoration-2 disabled:text-[#9a9a9a]",
};

interface CommonProps {
  variant?: ButtonVariant;
  full?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  full,
  loading,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: CommonProps & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], full && "w-full", className)}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      <span>{children}</span>
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  full,
  icon,
  className,
  children,
  href,
  external,
  ...rest
}: CommonProps & { href: string; external?: boolean } & Omit<ComponentProps<"a">, "href" | "children">) {
  const cls = cn(base, variants[variant], full && "w-full", className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls} {...rest}>
        {icon}
        <span>{children}</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {icon}
      <span>{children}</span>
    </Link>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-3.5 animate-spin rounded-full border border-current border-r-transparent", className)}
    />
  );
}
