import { RemoteImage } from "@/components/ui/RemoteImage";
import { WAJIE_ASSETS } from "@/lib/brand/assets";
import { cn } from "@/lib/utils";

/**
 * Wajie Ibrahim logo. Uses the official logo from Wajie's CDN, with a typographic
 * "Wi / WAJIE | IBRAHIM" fallback of the same proportions when offline.
 */
export function WajieLogo({ className, height = 64 }: { className?: string; height?: number }) {
  const width = Math.round(height * (131 / 80));
  return (
    <span className={cn("inline-block", className)} style={{ width, height }}>
      <RemoteImage
        src={WAJIE_ASSETS.logo}
        alt="Wajie Ibrahim"
        loading="eager"
        className="h-full w-full object-contain"
        fallback={<WordmarkFallback height={height} />}
      />
    </span>
  );
}

function WordmarkFallback({ height }: { height: number }) {
  return (
    <span className="flex h-full w-full flex-col items-center justify-center bg-white text-black" aria-hidden="true">
      <span className="font-medium leading-none" style={{ fontSize: height * 0.5 }}>
        Wi
      </span>
      <span className="mt-1 whitespace-nowrap tracking-[0.25em]" style={{ fontSize: Math.max(7, height * 0.1) }}>
        WAJIE | IBRAHIM
      </span>
    </span>
  );
}
