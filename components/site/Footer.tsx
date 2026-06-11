import Link from "next/link";
import { Container } from "@/components/site/Container";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="bg-ink border-t border-rule mt-24 md:mt-32">
      <Container className="py-14 md:py-20">
        {/* Voice line — centered italic, archival */}
        <div className="text-center">
          <p className="font-display-italic text-bone text-2xl md:text-3xl leading-snug">
            Painted slowly.
            <br />
            Worn long after.
          </p>
        </div>

        {/* Two columns of tiny links, centred under the voice */}
        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 text-center md:flex md:justify-center md:gap-x-12">
          <div>
            <p className="text-tag mb-3">explore</p>
            <ul className="space-y-1.5 font-display-italic text-bone">
              <li><Link href="/gallery">gallery</Link></li>
              <li><Link href="/vintage">shop</Link></li>
              <li><Link href="/commissions">commissions</Link></li>
              <li><Link href="/studio">studio</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-tag mb-3">elsewhere</p>
            <ul className="space-y-1.5 font-display-italic text-bone">
              <li>
                <a href={`mailto:${siteConfig.contactEmail}`}>email</a>
              </li>
              <li>
                <a
                  href={`https://instagram.com/${siteConfig.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal — tiny tag row, centred */}
        <div className="mt-12 pt-6 border-t border-rule text-center">
          <p className="text-tag mb-3">
            © {new Date().getFullYear()} kelly laura · all works original
          </p>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-tag">
            <li><Link href="/legal/shipping">shipping</Link></li>
            <li><Link href="/legal/returns">returns</Link></li>
            <li><Link href="/legal/privacy">privacy</Link></li>
            <li><Link href="/legal/terms">terms</Link></li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
