"use client";

/* eslint-disable @next/next/no-img-element -- remote Shopify CDN / mock-render SVGs; next/image adds nothing here. */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * <img> with a graceful fallback (offline demo, blocked CDN, missing asset).
 * The fallback keeps the same box so layouts never jump.
 */
export function RemoteImage({
  src,
  alt,
  className,
  fallback,
  loading = "lazy",
  fetchPriority,
}: {
  src: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const ref = useRef<HTMLImageElement>(null);

  // A server-rendered <img> can fail (e.g. CDN blocked) before React attaches onError.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailedSrc(src);
  }, [src]);
  if (failedSrc === src) {
    return (
      <div role="img" aria-label={alt} className={cn("flex items-center justify-center bg-studio", className)}>
        {fallback}
      </div>
    );
  }
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      onError={() => setFailedSrc(src)}
      className={className}
    />
  );
}
