"use client";

import { useState, type ReactNode } from "react";
import { Cpu } from "lucide-react";
import { TECH_BADGE_META } from "@/app/components/ProjectCard";

export type ProjectTab = {
  id: string;
  label: string;
  content: ReactNode;
};

export default function ProjectTabs({ tabs }: Readonly<{ tabs: ProjectTab[] }>) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div>
      <div className="border-b ds-rule">
        <nav className="-mb-px flex overflow-x-auto" aria-label="Project sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveId(tab.id)}
              aria-selected={activeId === tab.id}
              role="tab"
              className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ds-accent)] ${
                activeId === tab.id
                  ? "border-[var(--ds-accent)] text-[var(--ds-accent)]"
                  : "border-transparent text-[var(--ds-soft)] hover:border-[var(--ds-border)] hover:text-[var(--ds-text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">{activeTab?.content}</div>
    </div>
  );
}

const TAG_GROUPS: Record<string, string> = {
  Java: "Backend",
  J2EE: "Backend",
  "Spring Boot": "Backend",
  RabbitMQ: "Backend",
  Redis: "Backend",
  Tomcat: "Backend",
  SSH: "Backend",
  Oracle: "Backend",
  Db2: "Backend",
  "REST API": "API & Integration",
  Moodle: "API & Integration",
  "Oracle VirtualBox": "Infrastructure",
  "SliTaz Linux": "Infrastructure",
  "Eclipse RCP": "Frontend",
  "Next.js": "Frontend",
  TypeScript: "Frontend",
  "Tailwind CSS": "Frontend",
  "CI/CD": "DevOps",
  "GitHub Actions": "DevOps",
  SonarCloud: "DevOps",
  Vercel: "DevOps",
  "Robot Framework": "Testing",
  Microservices: "Architecture",
  "System Design": "Architecture",
  Security: "Architecture",
  "Claude Code": "Tools",
};

function TechChips({ tagList }: Readonly<{ tagList: string[] }>) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {tagList.map((tag) => {
        const meta = TECH_BADGE_META[tag] ?? {
          icon: Cpu,
          tone: "border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-text)]",
        };
        const Icon = meta.icon;
        return (
          <span
            key={tag}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${meta.tone}`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {tag}
          </span>
        );
      })}
    </div>
  );
}

export function TechStackContent({ tags }: Readonly<{ tags: string[] }>) {
  const grouped: Record<string, string[]> = {};
  const ungrouped: string[] = [];

  for (const tag of tags) {
    const group = TAG_GROUPS[tag];
    if (group) {
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(tag);
    } else {
      ungrouped.push(tag);
    }
  }

  const groupEntries = Object.entries(grouped);
  const showHeaders = groupEntries.length > 1;

  if (!showHeaders) {
    return <TechChips tagList={tags} />;
  }

  return (
    <div className="space-y-6">
      {groupEntries.map(([group, groupTags]) => (
        <div key={group}>
          <p className="ds-soft mb-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
            {group}
          </p>
          <TechChips tagList={groupTags} />
        </div>
      ))}
      {ungrouped.length > 0 && (
        <div>
          <p className="ds-soft mb-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
            Other
          </p>
          <TechChips tagList={ungrouped} />
        </div>
      )}
    </div>
  );
}
