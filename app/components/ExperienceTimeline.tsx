"use client";

import { BriefcaseBusiness, GraduationCap, MapPin, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { timelineEntries, type TimelineEntry } from "@/app/data/journey";

const timelineEntriesLatestFirst = [...timelineEntries].reverse();

const entryKindMeta: Record<
  TimelineEntry["kind"],
  { label: string; icon: LucideIcon; chipClassName: string; markerClassName: string }
> = {
  work: {
    label: "Experience",
    icon: BriefcaseBusiness,
    chipClassName:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-700/80 dark:bg-sky-900/30 dark:text-sky-200",
    markerClassName: "bg-sky-500",
  },
  education: {
    label: "Education",
    icon: GraduationCap,
    chipClassName:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-700/80 dark:bg-violet-900/30 dark:text-violet-200",
    markerClassName: "bg-violet-500",
  },
};

export default function ExperienceTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(0);
  const lastProgressRef = useRef(0);

  useEffect(() => {
    let frame = 0;

    const updateActiveItem = () => {
      const viewportFocus = window.innerHeight * 0.42;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      const itemMidpoints: number[] = [];
      const itemDistances: number[] = [];

      itemRefs.current.forEach((item, index) => {
        if (!item) {
          return;
        }

        const rect = item.getBoundingClientRect();
        const itemMidpoint = rect.top + rect.height / 2;
        itemMidpoints.push(itemMidpoint);
        const distance = Math.abs(itemMidpoint - viewportFocus);
        itemDistances[index] = distance;

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      const currentIndex = activeIndexRef.current;
      const currentDistance = itemDistances[currentIndex] ?? Number.POSITIVE_INFINITY;
      const shouldSwitch = currentIndex !== closestIndex && closestDistance + 26 < currentDistance;

      if (shouldSwitch || !Number.isFinite(currentDistance)) {
        activeIndexRef.current = closestIndex;
        setActiveIndex(closestIndex);
      }

      const firstMidpoint = itemMidpoints[0];
      const lastMidpoint = itemMidpoints.at(-1);

      if (typeof firstMidpoint === "number" && typeof lastMidpoint === "number") {
        const nextProgress =
          firstMidpoint === lastMidpoint
            ? 100
            : Math.min(100, Math.max(0, ((viewportFocus - firstMidpoint) / (lastMidpoint - firstMidpoint)) * 100));

        if (Math.abs(nextProgress - lastProgressRef.current) > 0.2) {
          timelineRef.current?.style.setProperty("--timeline-progress", `${nextProgress}%`);
          lastProgressRef.current = nextProgress;
        }
      }

      frame = 0;
    };

    const requestUpdate = () => {
      if (frame !== 0) {
        return;
      }

      frame = globalThis.requestAnimationFrame(updateActiveItem);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame !== 0) {
        globalThis.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const activeEntry = timelineEntriesLatestFirst[activeIndex];
  const activeAccentClassName = `timeline-accent-${activeEntry.accent}`;

  return (
    <section
      id="experience"
      className="ds-section-alt"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ds-eyebrow">Career and education journey</p>
          <h2 className="ds-section-title mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Career Journey</h2>
          <p className="ds-muted mt-4 text-base leading-7 sm:text-lg sm:leading-8">
            From academic foundations to building real-world systems at scale.
          </p>
          <p className="ds-soft mt-3 text-sm leading-6 sm:text-base">
            {"Foundation -> Enterprise systems -> Distributed depth -> Mission-critical delivery."}
          </p>
        </div>

        <div ref={timelineRef} className={`experience-timeline ${activeAccentClassName} mt-12 md:mt-14`}>

          <div className="experience-timeline__line" aria-hidden="true" />
          <div className="experience-timeline__line experience-timeline__line--active" aria-hidden="true" />

          <ol className="space-y-12 md:space-y-0">
            {timelineEntriesLatestFirst.map((entry, index) => {
              const visibleHighlights = entry.highlights.slice(0, 3);
              const visibleTags = entry.tags.slice(0, 5);
              const hiddenTagCount = entry.tags.length - visibleTags.length;

              let stateClass: string;
              if (index === activeIndex) {
                stateClass = "is-active";
              } else if (index < activeIndex) {
                stateClass = "is-past";
              } else {
                stateClass = "is-upcoming";
              }

              const kindMeta = entryKindMeta[entry.kind];

              return (
                <li
                  key={`${entry.title}-${entry.period}`}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  className={`experience-timeline__item timeline-accent-${entry.accent} ${stateClass}`}
                >
                  <div className="experience-timeline__grid">
                    <div className={`experience-timeline__content ${index % 2 === 0 ? "md:col-start-1" : "md:col-start-3"}`}>
                      <article className="glass-card experience-timeline__card rounded-[1.9rem] p-6 sm:p-8">
                        <div className="experience-timeline__card-shell">
                          <div className="experience-timeline__brand-row">
                            <div className="experience-timeline__brand-mark" aria-hidden="true">
                              <kindMeta.icon className="ds-text h-4.5 w-4.5" />
                            </div>

                            <div className="min-w-0">
                              <h3 className="ds-display-font ds-text text-xl font-bold sm:text-2xl">{entry.title}</h3>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <p className="experience-timeline__role ds-muted text-base font-medium">{entry.role}</p>
                                <span className="ds-chip">{entry.stage}</span>
                              </div>
                              <p className="ds-accent-text mt-1.5 flex items-center gap-1 text-[0.7rem] font-semibold uppercase tracking-[0.28em]">
                                <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                                {entry.location}
                              </p>
                              <span
                                className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${kindMeta.chipClassName}`}
                              >
                                <kindMeta.icon className="h-3 w-3" aria-hidden="true" />
                                {kindMeta.label}
                              </span>
                            </div>

                            </div>

                          <p className="experience-timeline__summary ds-text mt-5 text-[0.98rem] font-semibold leading-6">{entry.narrative}</p>

                          <div className="experience-timeline__tag-list mt-6" aria-label={`${entry.title} areas`}>
                            {visibleTags.map((tag) => (
                              <span key={tag} className="experience-timeline__tag">
                                {tag}
                              </span>
                            ))}
                            {hiddenTagCount > 0 && <span className="experience-timeline__tag">+{hiddenTagCount}</span>}
                          </div>

                          <ul className="experience-timeline__highlights ds-muted mt-7 space-y-3 text-sm leading-relaxed">
                            {visibleHighlights.map((point, pointIndex) => (
                              <li key={point} className={`experience-timeline__highlight experience-timeline__highlight--${pointIndex + 1} flex gap-3`}>
                                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${kindMeta.markerClassName}`} aria-hidden="true" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </article>
                    </div>

                    <div className="experience-timeline__marker-column" aria-hidden="true">
                      <div className="experience-timeline__marker-ring">
                        <div className={`experience-timeline__marker-dot ${kindMeta.markerClassName}`} />
                      </div>
                      <span className="experience-timeline__year">{entry.period}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}