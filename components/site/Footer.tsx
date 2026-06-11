import { Container } from "@/components/site/Container";
import { siteConfig } from "@/lib/site-config";

/**
 * Minimal footer — just the two contact links, centred, as elegant
 * line-icon buttons. Everything else (voice line, nav columns, legal row)
 * has been retired.
 */
export function Footer() {
  return (
    <footer className="bg-ink border-t border-rule mt-24 md:mt-32">
      <Container className="py-14 md:py-20">
        <div className="flex items-center justify-center gap-10">
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            aria-label="Email Kelly Laura"
            className="text-bone-deep transition-colors hover:text-bone focus:outline-none focus-visible:text-bone"
          >
            <MailIcon />
          </a>
          <a
            href={`https://instagram.com/${siteConfig.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kelly Laura on Instagram"
            className="text-bone-deep transition-colors hover:text-bone focus:outline-none focus-visible:text-bone"
          >
            <InstagramIcon />
          </a>
        </div>
      </Container>
    </footer>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-6 w-6"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-6 w-6"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
