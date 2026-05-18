"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  /** Stagger within a row of reveals — milliseconds. */
  delay?: number;
  /** Distance to rise from in pixels. Default 32. */
  rise?: number;
  /** Once revealed, stay revealed. Almost always true. */
  once?: boolean;
  /** Element tag. Useful for `as="li"` inside tables/lists. */
  as?: "div" | "li" | "section" | "article" | "header" | "footer";
  className?: string;
}

/**
 * IntersectionObserver-driven scroll reveal. Fades + rises content into
 * place when it crosses ~10% from the bottom of the viewport. Honors
 * prefers-reduced-motion by skipping the animation entirely.
 *
 * Used per the Galleria-style scroll choreography — every section reveals
 * once, sets, and stays.
 */
export function Reveal({
  children,
  delay = 0,
  rise = 32,
  once = true,
  as = "div",
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Detect reduced-motion preference once at mount (and on system changes).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, reduced]);

  const Component = as as "div";

  return (
    <Component
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        transitionDelay: `${delay}ms`,
        transform: visible ? "translateY(0)" : `translateY(${rise}px)`,
        opacity: visible ? 1 : 0,
        // Reduced-motion users get the final state instantly.
        transition: reduced
          ? "none"
          : "transform 1000ms cubic-bezier(0.2, 0.6, 0.2, 1), opacity 900ms cubic-bezier(0.2, 0.6, 0.2, 1)",
        willChange: visible ? "auto" : "transform, opacity",
      }}
      className={className}
    >
      {children}
    </Component>
  );
}
