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
    <header className="sticky top-0 z-40 bg-bone/85 backdrop-blur-md border-b border-rule/60">
      <Container width="wide">
        <div className="flex items-center justify-between py-5 md:py-6">
          <Link
            href="/"
            className="font-display text-2xl md:text-[1.6rem] tracking-tight leading-none"
            aria-label="Kelly Laura — Home"
          >
            Kelly <span className="font-display-italic">Laura</span>
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-10">
            {links.map((l) => (
              <NavItem key={l.href} link={l} pathname={pathname} />
            ))}
          </nav>

          {/* Mobile toggle — generous tap area, pulled back into nav padding */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden text-ui px-3 py-3 -mr-3 min-h-11 inline-flex items-center"
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        {open && (
          <nav
            id="mobile-nav"
            className="md:hidden border-t border-rule/60 py-6 flex flex-col gap-5"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "font-display text-3xl tracking-tight py-2 -mx-1 px-1 min-h-12 inline-flex items-center",
                  (l.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(l.href)) && "text-ochre-deep"
                )}
              >
                {l.label}
              </Link>
            ))}
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
      // py-3 gives the link a ~44px touch target without disturbing the
      // visual position of the underline (which is keyed to text bottom via
      // bottom-3 below).
      className={cn(
        "text-ui relative inline-flex items-center py-3 min-h-11",
        "transition-colors hover:text-ochre-deep",
        active ? "text-ink" : "text-ink-soft"
      )}
    >
      {link.label}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 right-0 bottom-2 h-px bg-ochre-deep origin-left transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0"
        )}
      />
    </Link>
  );
}
