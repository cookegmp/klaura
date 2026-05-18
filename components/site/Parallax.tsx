"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface ParallaxProps {
  children: ReactNode;
  /**
   * How far the content drifts relative to its container's scroll
   * progress. 0 = no movement, 1 = moves at the same rate as scroll
   * (so it appears completely stationary in viewport coordinates).
   * Typical values: 0.15–0.35 for subtle drift.
   */
  amount?: number;
  className?: string;
}

/**
 * Lightweight scroll-linked translateY. The wrapper computes its own
 * intersection progress with the viewport and shifts the child Y
 * position accordingly via transform. Cheap, GPU-accelerated, honors
 * prefers-reduced-motion.
 */
export function Parallax({ children, amount = 0.2, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const handle = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // Center of the element's relative position to viewport center.
      const center = rect.top + rect.height / 2 - viewportH / 2;
      // Translate by -center * amount → element drifts opposite to its
      // natural scroll, giving the parallax illusion.
      setOffset(-center * amount);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(handle);
    };

    handle();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, amount]);

  return (
    <div ref={ref} className={className} style={{ willChange: reduced ? "auto" : "transform" }}>
      <div
        style={{
          transform: reduced ? "none" : `translate3d(0, ${offset}px, 0)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
