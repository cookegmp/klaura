import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { CommissionForm } from "@/components/site/CommissionForm";
import { ProductImage } from "@/components/site/ProductImage";
import { getCommissionExamples } from "@/lib/sanity/read";

export const metadata: Metadata = {
  title: "Commissions",
  description: "Commission a painting from Kelly Laaura.",
};

const PROCESS = [
  {
    n: "01",
    title: "We talk",
    body: "A short conversation about the place or subject, the room it will live in, the feeling you want it to hold.",
  },
  {
    n: "02",
    title: "Reference & sketch",
    body: "You share photos. I work up two or three small studies. We choose a direction together.",
  },
  {
    n: "03",
    title: "Painting",
    body: "Most commissions take four to ten weeks. Progress photos at the halfway and three-quarters marks.",
  },
  {
    n: "04",
    title: "Final approval",
    body: "Last reveal, then a brief revision window if needed. Final invoice on approval.",
  },
  {
    n: "05",
    title: "Shipping",
    body: "Insured, crated for larger works, with a hand-written care card.",
  },
] as const;

export default async function CommissionsPage() {
  const examples = await getCommissionExamples();

  return (
    <>
      <section className="py-20 md:py-32">
        <Container>
          <header className="mb-16 max-w-3xl">
            <p className="text-ui text-ink-soft mb-6">Commissions</p>
            <h1 className="font-display font-light text-[length:var(--text-display-lg)] leading-[1.02] tracking-[-0.02em]">
              A painting <span className="font-display-italic text-ochre-deep">for your place</span>.
            </h1>
            <p className="mt-8 text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
              Landscapes of a place you love, painted from your photos or a visit. I take a
              limited number of commissions each season.
            </p>
          </header>

          <ol className="mt-20 grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {PROCESS.map((step) => (
              <li key={step.n}>
                <p className="text-ui text-ochre mb-3">{step.n}</p>
                <h3 className="font-display text-2xl leading-tight font-light mb-3">
                  {step.title}
                </h3>
                <p className="text-ink-soft leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-24 max-w-2xl">
            <p className="text-ui text-ink-soft mb-4">A note on pricing</p>
            <p className="text-[length:var(--text-body-lg)] text-ink-soft leading-relaxed">
              Commissions are quoted individually based on size, medium, and reference work
              required. Small soft-pastel commissions typically begin around{" "}
              <span className="font-display-italic text-ink">$800</span>, with oil
              commissions in the <span className="font-display-italic text-ink">$2,400&ndash;$8,000</span>{" "}
              range. We&apos;ll discuss specifics before any commitment.
            </p>
          </div>
        </Container>
      </section>

      {examples.length > 0 && (
        <section className="py-24 md:py-32 bg-bone-deep">
          <Container width="wide">
            <h2 className="font-display text-[length:var(--text-display-md)] font-light tracking-[-0.02em] mb-12">
              Past <span className="font-display-italic">commissions</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {examples.map((ex, i) => (
                <li
                  key={ex._id}
                  style={{ transform: i % 2 === 1 ? "translateY(2.5rem)" : undefined }}
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <ProductImage
                      image={ex.image}
                      alt={ex.title}
                      seed={ex._id}
                      width={800}
                      height={1000}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  <p className="mt-5 font-display text-xl">{ex.title}</p>
                  {ex.story && (
                    <p className="mt-2 text-sm text-ink-soft leading-relaxed">{ex.story}</p>
                  )}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <section className="py-24 md:py-32">
        <Container width="narrow">
          <h2 className="font-display text-[length:var(--text-display-md)] font-light tracking-[-0.02em] mb-3">
            Begin an <span className="font-display-italic text-ochre-deep">inquiry</span>
          </h2>
          <p className="text-ink-soft leading-relaxed mb-12">
            Tell me about the piece you have in mind. I&apos;ll reply within a week.
          </p>
          <CommissionForm />
        </Container>
      </section>
    </>
  );
}
