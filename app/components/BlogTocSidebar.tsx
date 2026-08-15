"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "./BlogToc";

export default function BlogTocSidebar({ items }: Readonly<{ items: TocItem[] }>) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0% -70% 0%", threshold: 0 },
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="Table of contents (sidebar)">
      <p className="ds-soft text-[11px] font-semibold uppercase tracking-[0.12em]">
        On this page
      </p>
      <ul className="mt-3 space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={[
                "block py-1 text-[0.8125rem] leading-snug transition-colors hover:text-[var(--ds-accent)]",
                item.level === 3 ? "pl-3.5" : "",
                activeId === item.id ? "ds-accent-text font-medium" : "ds-muted",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
