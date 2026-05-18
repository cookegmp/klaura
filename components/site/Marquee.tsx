export function Marquee({ phrases }: { phrases: string[] }) {
  if (phrases.length === 0) return null;
  // Duplicate the run so the marquee can loop seamlessly under the
  // 50%-translate keyframe.
  const doubled = [...phrases, ...phrases];

  return (
    <div
      role="presentation"
      className="overflow-hidden border-y border-rule/60 bg-bone py-8"
      aria-hidden
    >
      <div className="flex w-max animate-marquee gap-16 whitespace-nowrap">
        {doubled.map((phrase, i) => (
          <span
            key={i}
            className="font-display text-[2.5rem] md:text-[3rem] leading-none text-ink-soft"
          >
            {phrase}
            <span className="font-display-italic text-ochre ml-16">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
