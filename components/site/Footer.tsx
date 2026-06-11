import { Container } from "@/components/site/Container";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="bg-ink border-t border-rule mt-24 md:mt-32">
      <Container className="py-14 md:py-20">
        {/* Elsewhere — email + instagram, centred */}
        <div className="text-center">
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

        {/* Legal — copyright only for now; policy pages land later */}
        <div className="mt-12 pt-6 border-t border-rule text-center">
          <p className="text-tag">
            © {new Date().getFullYear()} kelly laura · all works original
          </p>
        </div>
      </Container>
    </footer>
  );
}
