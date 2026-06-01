import Link from "next/link";
import { Container } from "@/components/site/Container";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="bg-ink-soft text-bone border-t border-rule mt-32">
      <Container width="wide" className="py-20">
        <div className="grid gap-12 md:grid-cols-3 md:gap-16">
          <div className="md:col-span-1">
            <p className="font-display text-4xl md:text-5xl leading-[1] tracking-tight">
              Painted slowly.
              <br />
              <span className="font-display-italic">Worn long after.</span>
            </p>
          </div>

          <div>
            <h3 className="text-meta mb-5">Explore</h3>
            <ul className="space-y-3 text-[length:var(--text-body-lg)]">
              <li>
                <Link href="/paintings" className="">
                  Full catalogue
                </Link>
              </li>
              <li>
                <Link href="/vintage" className="">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/commissions" className="">
                  Commissions
                </Link>
              </li>
              <li>
                <Link href="/studio" className="">
                  Studio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-meta mb-5">Elsewhere</h3>
            <ul className="space-y-3 text-[length:var(--text-body-lg)]">
              <li>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className=""
                >
                  {siteConfig.contactEmail}
                </a>
              </li>
              <li>
                <a
                  href={`https://instagram.com/${siteConfig.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=""
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-rule flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-caption text-bone-deep">
            © {new Date().getFullYear()} Kelly Laura. All works original.
          </p>
          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-meta">
            <li>
              <Link href="/legal/shipping" className="">
                Shipping
              </Link>
            </li>
            <li>
              <Link href="/legal/returns" className="">
                Returns
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
