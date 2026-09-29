import { RemoteImage } from "@/components/ui/RemoteImage";
import { ImageIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Displays a generated concept in a 2:3 studio frame (the storefront's product image ratio).
 * Swapping the mock for FLUX output requires no change here — it just renders `src`.
 */
export function DesignFrame({
  src,
  alt,
  caption,
  className,
  priority,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure className={cn("relative aspect-[2/3] w-full overflow-hidden bg-studio", className)}>
      <RemoteImage
        key={src}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className="h-full w-full animate-fade-in object-cover"
        fallback={
          <span className="flex flex-col items-center gap-2 text-[11px] uppercase text-muted">
            <ImageIcon size={22} />
            Design preview unavailable
          </span>
        }
      />
      {caption ? (
        <figcaption className="absolute bottom-0 left-0 bg-white/85 px-2.5 py-1.5 text-[10px] uppercase tracking-wide">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
