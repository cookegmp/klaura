"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/site/Container";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

// The five-rooms doorway experience lives at the site root, so "Gallery"
// points to /. /paintings remains as the full-catalogue escape hatch and
// /gallery redirects to / for any in-flight bookmarks. "About" surfaces
// the rich practice / process content at /studio.
const links: NavLink[] = [
  { href: "/commissions", label: "Commissions" },
  { href: "/", label: "Gallery" },
  { href: "/vintage", label: "Shop" },
  { href: "/studio", label: "About" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Studio admin pages get a slim, neutral nav.
  if (pathname.startsWith("/studio-admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-ink/85 backdrop-blur-md border-b border-rule/60">
      <Container width="wide">
        <div className="flex items-center justify-between py-5 md:py-6">
          <Link
            href="/"
            className="font-display-italic text-2xl md:text-[1.6rem] tracking-tight leading-none"
            aria-label="Kelly Laura — Home"
          >
            Kelly Laura
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-baseline gap-10">
            {links.map((l) => (
              <NavItem key={l.href} link={l} pathname={pathname} />
            ))}
          </nav>

          {/* Mobile toggle — italic Cormorant lowercase, generous tap area */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden font-display-italic text-lg px-3 py-3 -mr-3 min-h-11 inline-flex items-center"
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? "close" : "menu"}
          </button>
        </div>

        {open && (
          <nav
            id="mobile-nav"
            className="md:hidden border-t border-rule/60 py-6 flex flex-col gap-3"
          >
            {links.map((l) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "font-display-italic text-3xl tracking-tight py-2 -mx-1 px-1 min-h-12 inline-flex items-center",
                    active ? "text-bone" : "text-bone-deep"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        )}
      </Container>
    </header>
  );
}

function NavItem({ link, pathname }: { link: NavLink; pathname: string }) {
  const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
  return (
    <Link
      href={link.href}
      className={cn(
        "font-display-italic text-[1.05rem] relative inline-flex items-center py-3 min-h-11",
        "transition-colors",
        active ? "text-bone" : "text-bone-deep hover:text-bone"
      )}
    >
      {link.label}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 right-0 bottom-1.5 h-px bg-bone origin-left transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0"
        )}
      />
    </Link>
  );
}
