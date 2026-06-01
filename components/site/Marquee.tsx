"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Brand marquee — atmospheric phrases scrolling under the hero. Marked
 * presentation/aria-hidden so screen readers skip it (charter §motion
 * "atmospheric"). Pauses when off-viewport via IntersectionObserver so
 * background tabs and scrolled-past pages don't keep the compositor busy.
 *
 * Respects prefers-reduced-motion via CSS media query in globals.css.
 */
export function Marquee({ phrases }: { phrases: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setPaused(!entry?.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (phrases.length === 0) return null;
  // Duplicate the run so the marquee can loop seamlessly under the
  // 50%-translate keyframe.
  const doubled = [...phrases, ...phrases];

  return (
    <div
      ref={containerRef}
      role="presentation"
      className="overflow-hidden border-y border-rule/60 bg-ink py-8"
      aria-hidden
    >
      <div
        className="flex w-max animate-marquee gap-16 whitespace-nowrap"
        style={{ animationPlayState: paused ? "paused" : "running" }}
      >
        {doubled.map((phrase, i) => (
          <span
            key={i}
            className="font-display text-[2.5rem] md:text-[3rem] leading-none text-bone-deep"
          >
            {phrase}
            <span className="font-display-italic text-ochre ml-16">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
