"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export default function BlogToc({ items }: Readonly<{ items: TocItem[] }>) {
  const [open, setOpen] = useState(false);

  if (items.length < 2) return null;

  return (
    <div className="ds-rule border-y py-5">
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between md:hidden"
        aria-expanded={open}
      >
        <span className="ds-soft text-[11px] font-semibold uppercase tracking-[0.12em]">
          On this page
        </span>
        <ChevronDown
          className={`ds-soft h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Desktop label (always visible) */}
      <p className="ds-soft hidden text-[11px] font-semibold uppercase tracking-[0.12em] md:block">
        On this page
      </p>

      {/* TOC items */}
      <nav
        aria-label="Table of contents"
        className={`${open ? "block" : "hidden"} md:block`}
      >
        <ul className="mt-3 space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block py-1 text-sm transition-colors hover:text-[var(--ds-accent)] ${
                  item.level === 3 ? "ds-soft pl-4" : "ds-muted"
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
