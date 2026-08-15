"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, ChevronDown, Feather, LayoutGrid, Palette, Square, Terminal, Sparkles, type LucideIcon } from "lucide-react";

export type DesignId = "bento" | "editorial" | "brutalist" | "terminal" | "peacock";

const DESIGNS: { id: DesignId; label: string; icon: LucideIcon }[] = [
  { id: "bento", label: "Bento", icon: LayoutGrid },
  { id: "editorial", label: "Editorial", icon: Feather },
  { id: "brutalist", label: "Brutalist", icon: Square },
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "peacock", label: "Peacock", icon: Sparkles },
];

const STORAGE_KEY = "portfolio-design";

function readDesign(): DesignId {
  const current = document.documentElement.getAttribute("data-design");
  return DESIGNS.find((d) => d.id === current)?.id ?? "peacock";
}

function subscribeToDesign(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributeFilter: ["data-design"] });
  return () => observer.disconnect();
}

function applyDesign(id: DesignId) {
  document.documentElement.setAttribute("data-design", id);
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // localStorage unavailable (private mode) — design still applies for this visit
  }
}

export default function DesignSwitcher() {
  const design = useSyncExternalStore(subscribeToDesign, readDesign, () => "peacock" as DesignId);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const active = DESIGNS.find((d) => d.id === design) ?? DESIGNS[0];

  const select = (id: DesignId) => {
    applyDesign(id);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2.5">
      {open && (
        <div
          role="radiogroup"
          aria-label="Choose a site design"
          className="ds-switcher-panel flex min-w-[11.5rem] flex-col gap-0.5 bg-[var(--ds-surface)] p-1.5 shadow-xl"
          style={{
            border: "var(--ds-border-w) solid var(--ds-border)",
            borderRadius: "var(--ds-radius-card)",
          }}
        >
          <p className="ds-soft px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-[0.14em]">
            Site design
          </p>
          {DESIGNS.map(({ id, label, icon: Icon }) => {
            const isActive = design === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => select(id)}
                className={`flex items-center gap-2.5 px-2.5 py-2 text-left text-sm transition-colors duration-150 ${
                  isActive
                    ? "bg-[var(--ds-accent)] text-[var(--ds-accent-contrast)]"
                    : "text-[var(--ds-text)] hover:bg-[var(--ds-accent-soft)]"
                }`}
                style={{ borderRadius: "calc(var(--ds-radius-card) - 4px)" }}
              >
                <Icon className="h-[1.05rem] w-[1.05rem] shrink-0" aria-hidden="true" />
                <span className="font-medium">{label}</span>
                {isActive && <Check className="ml-auto h-4 w-4 shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Choose site design"
        onClick={() => setOpen((value) => !value)}
        className="ds-switcher-fab flex items-center gap-2 bg-[var(--ds-surface)] py-2.5 pl-3.5 pr-3 text-sm shadow-lg transition-all duration-200 hover:shadow-xl"
        style={{
          border: "var(--ds-border-w) solid var(--ds-border)",
          borderRadius: "9999px",
        }}
      >
        <Palette className="ds-accent-text h-[1.15rem] w-[1.15rem] shrink-0" aria-hidden="true" />
        <span className="ds-text font-medium">{active.label}</span>
        <ChevronDown
          className="ds-soft h-4 w-4 shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
