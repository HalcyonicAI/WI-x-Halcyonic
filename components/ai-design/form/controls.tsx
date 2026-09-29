"use client";

import { useId, type ReactNode } from "react";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { CheckIcon } from "@/components/ui/icons";
import type { ColourOption } from "@/lib/catalog/options";
import { cn } from "@/lib/utils";

/**
 * Form controls in the storefront's language. Every control is a native radio/checkbox
 * (keyboard + screen-reader friendly) styled like the site's WOMEN / ADAM.MEN tabs:
 * selected = solid black, unselected = white with a hairline.
 */

export function FormSection({
  id,
  number,
  title,
  hint,
  error,
  children,
  optional,
}: {
  id: string;
  number: string;
  title: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;
  return (
    <fieldset
      id={id}
      aria-describedby={describedBy}
      className="scroll-mt-40 border-t border-line py-9 first:border-t-0 first:pt-0"
    >
      <legend className="float-left w-full">
        <span className="flex items-baseline gap-3">
          <span className="text-[12px] tabular-nums text-muted">{number}</span>
          <span className="text-[14px] font-medium uppercase">{title}</span>
          {optional ? <span className="text-[11px] uppercase text-subtle">Optional</span> : null}
        </span>
      </legend>
      <div className="clear-both pt-1">
        {hint ? (
          <p id={hintId} className="text-[12px] text-muted">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="mt-2 text-[12px] text-danger">
            {error}
          </p>
        ) : null}
        <div className="mt-5">{children}</div>
      </div>
    </fieldset>
  );
}

export function Chip({
  type,
  name,
  checked,
  onChange,
  children,
  disabled,
}: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label className={cn("relative inline-flex", disabled && !checked && "opacity-40")}>
      <input
        type={type}
        name={name}
        checked={checked}
        disabled={disabled && !checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className={cn(
          "inline-flex min-h-11 cursor-pointer items-center gap-1.5 border px-5 text-[12px] uppercase transition-colors peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-black",
          checked ? "border-black bg-black text-white" : "border-line bg-white text-ink hover:border-black",
        )}
      >
        {checked && type === "checkbox" ? <CheckIcon size={12} strokeWidth={2} /> : null}
        {children}
      </span>
    </label>
  );
}

export function Tile({
  type,
  name,
  checked,
  onChange,
  title,
  description,
  image,
  imageAlt = "",
}: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description?: string;
  image?: string | null;
  imageAlt?: string;
}) {
  return (
    <label className="group relative block cursor-pointer">
      <input type={type} name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cn(
          "block h-full border transition-colors peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-black",
          checked ? "border-black" : "border-line group-hover:border-black/60",
        )}
      >
        {image !== undefined ? (
          <span className="relative block aspect-[3/4] overflow-hidden bg-studio">
            {image ? (
              <RemoteImage src={image} alt={imageAlt} className="h-full w-full scale-[1.15] object-cover object-[50%_35%]" />
            ) : (
              <span className="flex h-full items-center justify-center text-[28px] font-light text-muted" aria-hidden="true">
                +
              </span>
            )}
          </span>
        ) : null}
        <span className="block p-3">
          <span className="block text-[12px] font-medium uppercase leading-tight">{title}</span>
          {description ? <span className="mt-1 block text-[12px] leading-snug text-muted">{description}</span> : null}
        </span>
      </span>
      {checked ? (
        <span className="absolute right-2 top-2 grid size-5 place-items-center bg-black text-white" aria-hidden="true">
          <CheckIcon size={12} strokeWidth={2} />
        </span>
      ) : null}
    </label>
  );
}

export function SwatchGrid({
  name,
  label,
  colours,
  value,
  onChange,
  allowNone,
}: {
  name: string;
  /** Visible group label (e.g. "Main colour") — also the radiogroup's accessible name. */
  label: ReactNode;
  colours: ColourOption[];
  value: string | undefined;
  onChange: (id: string | undefined) => void;
  allowNone?: boolean;
}) {
  const labelId = useId();
  return (
    <div>
    <p id={labelId} className="mb-3 text-[11px] uppercase">
      {label}
    </p>
    <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6 lg:grid-cols-7">
      {allowNone ? (
        <SwatchOption name={name} label="None" checked={!value} onChange={() => onChange(undefined)}>
          <span className="relative block size-full bg-white">
            <span className="absolute left-1/2 top-1/2 h-px w-[130%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-black/40" />
          </span>
        </SwatchOption>
      ) : null}
      {colours.map((c) => (
        <SwatchOption key={c.id} name={name} label={c.name} checked={value === c.id} onChange={() => onChange(c.id)}>
          <span className="block size-full" style={{ background: c.hex }} />
        </SwatchOption>
      ))}
    </div>
    </div>
  );
}

function SwatchOption({
  name,
  label,
  checked,
  onChange,
  children,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center gap-1.5 text-center">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cn(
          "block size-11 overflow-hidden border p-[3px] transition-colors peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-black",
          checked ? "border-black" : "border-transparent hover:border-line",
        )}
      >
        <span className="block size-full border border-black/10">{children}</span>
      </span>
      <span className={cn("text-[10px] uppercase leading-tight", checked ? "text-ink" : "text-muted")}>{label}</span>
    </label>
  );
}

export function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength = 80,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="mt-4 max-w-[420px]">
      <label htmlFor={id} className="block text-[11px] uppercase text-muted">
        {label}
      </label>
      <input
        id={id}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full border border-line bg-white px-3.5 py-3 text-[16px] outline-none focus:border-black sm:text-[14px]"
      />
    </div>
  );
}
