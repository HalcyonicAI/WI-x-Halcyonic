import Link from "next/link";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { cn } from "@/lib/utils";

/** Product card matching the storefront grid: 3:4 image, uppercase 12px title, price beneath. */
export function ProductCard({
  href,
  external,
  image,
  title,
  price,
  badge,
  imageClassName,
  priority,
}: {
  href: string;
  external?: boolean;
  image: string;
  title: string;
  price: string;
  badge?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  const inner = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden bg-studio">
        <RemoteImage
          src={image}
          alt={title}
          loading={priority ? "eager" : "lazy"}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-wi)] group-hover:scale-[1.03]",
            imageClassName,
          )}
        />
        {badge ? (
          <span className="absolute left-2 top-2 bg-black px-2 py-1 text-[10px] uppercase leading-none tracking-wide text-white">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-2.5 text-[13px] font-normal uppercase leading-snug tracking-[0.03em]">{title}</p>
      <p className="mt-0.5 text-[12px] font-bold">{price}</p>
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className="group block">
      {inner}
    </a>
  ) : (
    <Link href={href} className="group block">
      {inner}
    </Link>
  );
}
