"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "./icons";

/**
 * Confirmation dialog built on the native <dialog> element (focus trap, Esc to close,
 * focus restore handled by the browser). Square, white, hairline — storefront style.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  actions,
  labelledBy = "dialog-title",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children?: ReactNode;
  actions: ReactNode;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[calc(100%-32px)] max-w-[480px] bg-white p-0 text-ink backdrop:bg-black/40 open:animate-fade-up"
    >
      <div className="relative p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid size-10 place-items-center text-ink/70 hover:text-ink"
        >
          <CloseIcon size={18} />
        </button>
        <h2 id={labelledBy} className="pr-8 text-[18px] font-medium uppercase leading-snug">
          {title}
        </h2>
        {children ? <div className="mt-3 text-[12px] leading-[1.6] text-muted">{children}</div> : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{actions}</div>
      </div>
    </dialog>
  );
}
