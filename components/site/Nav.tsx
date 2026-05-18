"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/site/Container";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

const links: NavLink[] = [
  { href: "/paintings", label: "Paintings" },
  { href: "/vintage", label: "Vintage" },
  { href: "/commissions", label: "Commissions" },
  { href: "/studio", label: "Studio" },
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
            aria-label="Kelly Laaura — Home"
          >
            Kelly <span className="font-display-italic">Laaura</span>
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-10">
            {links.map((l) => (
              <NavItem key={l.href} link={l} pathname={pathname} />
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden text-ui"
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
                  "font-display text-3xl tracking-tight",
                  pathname.startsWith(l.href) && "text-ochre"
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
      className={cn(
        "text-ui relative pb-1",
        "transition-colors hover:text-ochre",
        active ? "text-ink" : "text-ink-soft"
      )}
    >
      {link.label}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 right-0 bottom-0 h-px bg-ochre origin-left transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0"
        )}
      />
    </Link>
  );
}
