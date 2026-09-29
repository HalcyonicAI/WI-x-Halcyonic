import Link from "next/link";
import { WajieLogo } from "@/components/brand/WajieLogo";
import { BagIcon } from "@/components/ui/icons";

/**
 * Checkout chrome, modelled on a branded Shopify checkout: logo + bag only,
 * no storefront navigation or footer.
 */
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white text-[14px]">
      <header className="border-b border-line">
        <div className="mx-auto flex h-[84px] max-w-[1100px] items-center justify-between px-4 sm:px-6">
          <Link href="/ai-design" aria-label="Back to Wajie Ibrahim">
            <WajieLogo height={52} />
          </Link>
          <Link href="/ai-design" aria-label="Back to booking" className="grid size-11 place-items-center">
            <BagIcon size={22} />
          </Link>
        </div>
      </header>
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
