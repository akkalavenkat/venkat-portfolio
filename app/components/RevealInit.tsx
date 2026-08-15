"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Adds `.is-visible` to `.reveal` elements as they scroll into view.
 * Pure CSS handles the transition; respects prefers-reduced-motion via CSS.
 */
export default function RevealInit() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (elements.length === 0) return;

    if (typeof IntersectionObserver === "undefined") {
      for (const el of elements) el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    for (const el of elements) {
      if (el.classList.contains("is-visible")) continue;
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
