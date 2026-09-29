import Link from "next/link";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { SiteHeader } from "@/components/storefront/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="text-[12px] uppercase text-muted">404</p>
        <h1 className="mt-2 text-[28px] font-medium uppercase sm:text-[36px]">Page not found</h1>
        <p className="mt-3 text-[14px] text-ink/70">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Link
          href="/ai-design"
          className="mt-8 inline-flex min-h-12 items-center bg-black px-8 text-[12px] uppercase text-white hover:bg-[#2b2b2b]"
        >
          Go to AI Custom Design
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
