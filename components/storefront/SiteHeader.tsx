"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { WajieLogo } from "@/components/brand/WajieLogo";
import { AccountIcon, BagIcon, CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";
import { WAJIE_LINKS } from "@/lib/brand/assets";
import { cn } from "@/lib/utils";

/**
 * Replica of the live storefront header (no bottom rule — dividers belong to page sections):
 *  ≥ 990px — BESPOKE / SHOP / ABOUT Wi on the left, centred logo, search/account/bag right.
 *            BESPOKE is a link; its submenu opens on hover or keyboard focus, as on the live site.
 *  < 990px — menu + search left, logo centre, account + bag right, nav row beneath.
 * The new "AI Custom Design" entry lives under BESPOKE, next to the existing booking links.
 */

const BESPOKE_LINKS = [
  { label: "What is Custom Couture", href: "/", external: false },
  { label: "Book an Appointment", href: WAJIE_LINKS.bookAppointment, external: true },
  { label: "AI Custom Design", href: "/ai-design", external: false, isNew: true },
];

export function SiteHeader() {
  const pathname = usePathname();
  const inBespoke = pathname === "/" || pathname.startsWith("/ai-design");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const [menuOpen, setMenuOpen] = useState(false);
  const bespokeRef = useRef<HTMLAnchorElement>(null);
  const suppressFocusOpen = useRef(false);

  // Close menus on navigation (adjusting state while rendering, keyed on the pathname).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setDrawerOpen(false);
    setMenuOpen(false);
  }

  // "ABOUT Wi" keeps its mixed case on the live site, so casing is applied per item.
  const navItem = (active: boolean, upper = true) =>
    cn(
      "text-[12px] font-medium transition-colors hover:text-ink",
      upper && "uppercase",
      active ? "text-ink" : inBespoke ? "text-muted" : "text-ink",
    );

  return (
    <header className="sticky top-0 z-40 bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:text-[12px] focus:uppercase"
      >
        Skip to content
      </a>

      {/* Desktop */}
      <div className="mx-auto hidden h-[100px] max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-8 min-[990px]:grid">
        <nav aria-label="Main" className="flex items-center gap-4">
          {/* Submenu opens on hover or keyboard focus; closes on leave, blur, Escape, click and navigation. */}
          <div
            className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
            onFocus={(e) => {
              if (suppressFocusOpen.current) {
                suppressFocusOpen.current = false;
                return;
              }
              if ((e.target as HTMLElement).matches(":focus-visible")) setMenuOpen(true);
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setMenuOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape" && menuOpen) {
                setMenuOpen(false);
                suppressFocusOpen.current = true;
                bespokeRef.current?.focus();
              }
            }}
          >
            <Link
              ref={bespokeRef}
              href="/"
              aria-expanded={menuOpen}
              aria-controls="bespoke-submenu"
              onClick={() => setMenuOpen(false)}
              className={cn(navItem(inBespoke), "inline-block py-4")}
            >
              Bespoke
            </Link>
            <div
              id="bespoke-submenu"
              className={cn(
                "absolute -left-8 top-full z-50 transition-opacity duration-200",
                menuOpen ? "visible opacity-100" : "invisible opacity-0",
              )}
            >
              <ul className="w-[360px] space-y-3 border-b border-line bg-white px-8 pb-7 pt-5">
                {BESPOKE_LINKS.map((l) => (
                  <li key={l.label}>
                    <NavLink
                      {...l}
                      onClick={() => setMenuOpen(false)}
                      className="inline-flex items-baseline gap-2 text-[16px] font-medium uppercase hover:underline"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <a href={WAJIE_LINKS.shop} target="_blank" rel="noreferrer" className={navItem(false)}>
            Shop
          </a>
          <a href={WAJIE_LINKS.about} target="_blank" rel="noreferrer" className={navItem(false, false)}>
            ABOUT Wi
          </a>
        </nav>

        <Link href="/" aria-label="Wajie Ibrahim — home" className="justify-self-center">
          <WajieLogo height={76} />
        </Link>

        <HeaderIcons className="justify-self-end" />
      </div>

      {/* Tablet / mobile */}
      <div className="min-[990px]:hidden">
        <div className="grid h-[78px] grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-6">
          <div className="flex items-center">
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="grid size-11 place-items-center"
            >
              <MenuIcon size={22} />
            </button>
            <a href={WAJIE_LINKS.home} target="_blank" rel="noreferrer" aria-label="Search" className="grid size-11 place-items-center">
              <SearchIcon size={21} />
            </a>
          </div>
          <Link href="/" aria-label="Wajie Ibrahim — home">
            <WajieLogo height={56} />
          </Link>
          <HeaderIcons className="justify-self-end" compact />
        </div>
        <nav aria-label="Main" className="flex items-center justify-center gap-3 pb-1">
          <Link href="/" className={cn(navItem(inBespoke), "px-1.5 py-2.5")}>
            Bespoke
          </Link>
          <a href={WAJIE_LINKS.shop} target="_blank" rel="noreferrer" className={cn(navItem(false), "px-1.5 py-2.5")}>
            Shop
          </a>
          <a href={WAJIE_LINKS.about} target="_blank" rel="noreferrer" className={cn(navItem(false, false), "px-1.5 py-2.5")}>
            ABOUT Wi
          </a>
        </nav>
      </div>

      {drawerOpen ? <MobileDrawer onClose={closeDrawer} returnFocusTo={menuButtonRef} /> : null}
    </header>
  );
}

function NavLink({
  label,
  href,
  external,
  isNew,
  className,
  onClick,
}: {
  label: string;
  href: string;
  external: boolean;
  isNew?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      {label}
      {isNew ? <span className="text-[11px] font-normal uppercase tracking-wide text-muted">New</span> : null}
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={className} onClick={onClick}>
      {content}
    </a>
  ) : (
    <Link href={href} className={className} onClick={onClick}>
      {content}
    </Link>
  );
}

function HeaderIcons({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center", compact ? "gap-0" : "gap-4", className)}>
      {!compact ? (
        <a href={WAJIE_LINKS.home} target="_blank" rel="noreferrer" aria-label="Search" className="grid size-10 place-items-center">
          <SearchIcon />
        </a>
      ) : null}
      <a href={WAJIE_LINKS.home} target="_blank" rel="noreferrer" aria-label="Account" className="grid size-11 place-items-center">
        <AccountIcon size={compact ? 22 : 20} />
      </a>
      <a href={WAJIE_LINKS.home} target="_blank" rel="noreferrer" aria-label="Cart" className="grid size-11 place-items-center">
        <BagIcon size={compact ? 22 : 20} />
      </a>
    </div>
  );
}

/** Slide-in menu: focus moves in, Tab is trapped, Escape closes, focus returns to the menu button. */
function MobileDrawer({ onClose, returnFocusTo }: { onClose: () => void; returnFocusTo: RefObject<HTMLButtonElement | null> }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const returnTarget = returnFocusTo.current;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      returnTarget?.focus();
    };
  }, [onClose, returnFocusTo]);

  return (
    <div className="fixed inset-0 z-50 min-[990px]:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button type="button" tabIndex={-1} aria-hidden="true" className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div ref={panelRef} className="absolute inset-y-0 left-0 flex w-[88%] max-w-[420px] animate-fade-in flex-col bg-white px-6 py-5">
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close menu" className="grid size-11 place-items-center self-start">
          <CloseIcon size={22} />
        </button>
        {/* Any link closes the drawer — including links to the page you're already on. */}
        <nav
          aria-label="Menu"
          className="mt-6 space-y-6"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) onClose();
          }}
        >
          <div>
            <Link href="/" className="block text-[28px] font-medium uppercase leading-tight">
              Bespoke
            </Link>
            <ul className="mt-3 space-y-1">
              {BESPOKE_LINKS.map((l) => (
                <li key={l.label}>
                  <NavLink {...l} className="flex min-h-10 items-center gap-2 text-[16px] font-medium uppercase" />
                </li>
              ))}
            </ul>
          </div>
          <a href={WAJIE_LINKS.shop} target="_blank" rel="noreferrer" className="block text-[28px] font-medium uppercase leading-tight">
            Shop
          </a>
          <a href={WAJIE_LINKS.about} target="_blank" rel="noreferrer" className="block text-[28px] font-medium leading-tight">
            ABOUT Wi
          </a>
        </nav>
      </div>
    </div>
  );
}
