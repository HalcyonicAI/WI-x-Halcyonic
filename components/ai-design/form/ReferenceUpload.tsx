"use client";

/* eslint-disable @next/next/no-img-element -- local data URLs */
import { useId, useRef, useState } from "react";
import type { ReferenceImage } from "@/types/design";
import { CloseIcon, UploadIcon } from "@/components/ui/icons";
import { ACCEPTED_IMAGE_TYPES, fileToDownscaledDataUrl, MAX_UPLOAD_BYTES } from "@/lib/client/image";
import { createId, cn } from "@/lib/utils";

export const MAX_REFERENCE_IMAGES = 3;

/** Mock reference-image upload. Images are downscaled and kept on this device only. */
export function ReferenceUpload({
  images,
  onChange,
}: {
  images: ReferenceImage[];
  onChange: (images: ReferenceImage[]) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const remaining = MAX_REFERENCE_IMAGES - images.length;

  async function addFiles(list: FileList | File[]) {
    setMessage(null);
    const files = Array.from(list);
    const accepted = files.filter((f) => ACCEPTED_IMAGE_TYPES.includes(f.type));
    if (accepted.length < files.length) setMessage("Some files weren't JPG, PNG or WebP images, so we left them out.");
    const tooBig = accepted.filter((f) => f.size > MAX_UPLOAD_BYTES);
    if (tooBig.length) setMessage("Images need to be under 12 MB — try a smaller version.");
    const usable = accepted.filter((f) => f.size <= MAX_UPLOAD_BYTES).slice(0, remaining);
    if (accepted.length > remaining) setMessage(`You can add up to ${MAX_REFERENCE_IMAGES} reference images.`);
    if (!usable.length) return;
    setBusy(true);
    try {
      const added: ReferenceImage[] = [];
      for (const f of usable) {
        try {
          added.push({ id: createId("ref"), name: f.name, dataUrl: await fileToDownscaledDataUrl(f) });
        } catch {
          setMessage("We couldn't read one of those images. Try a JPG or PNG.");
        }
      }
      onChange([...images, ...added]);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {remaining > 0 ? (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 border px-4 py-8 text-center transition-colors focus-within:outline focus-within:outline-1 focus-within:outline-offset-2 focus-within:outline-black",
            dragging ? "border-black bg-cream" : "border-line bg-mist hover:border-black",
          )}
        >
          <UploadIcon size={22} />
          <span className="text-[12px] font-medium uppercase">{busy ? "Preparing images…" : "Upload reference images"}</span>
          <span className="text-[12px] text-muted">
            Up to {MAX_REFERENCE_IMAGES} images · JPG or PNG · drag and drop or browse
          </span>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => e.target.files && void addFiles(e.target.files)}
          />
        </label>
      ) : null}

      {images.length ? (
        <ul className="mt-4 flex flex-wrap gap-3">
          {images.map((img) => (
            <li key={img.id} className="relative">
              {img.dataUrl ? (
                <img src={img.dataUrl} alt={`Reference: ${img.name}`} className="size-24 border border-line object-cover" />
              ) : (
                <span className="grid size-24 place-items-center border border-line bg-mist p-2 text-center text-[10px] uppercase text-muted">
                  {img.name}
                </span>
              )}
              <button
                type="button"
                onClick={() => onChange(images.filter((i) => i.id !== img.id))}
                aria-label={`Remove ${img.name}`}
                className="absolute -right-3 -top-3 grid size-10 place-items-center"
              >
                <span className="grid size-7 place-items-center border border-line bg-white hover:border-black">
                  <CloseIcon size={14} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-[12px] text-muted" aria-live="polite">
        {message ?? "In this demo, images stay on your device and are not uploaded."}
      </p>
    </div>
  );
}
