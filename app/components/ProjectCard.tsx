import {
  BarChart3,
  BrainCircuit,
  Coffee,
  Cpu,
  Database,
  FileCode2,
  Layers3,
  FileText,
  Gauge,
  GitBranch,
  Globe,
  HardDrive,
  Leaf,
  Paintbrush,
  Play,
  Radio,
  ServerCog,
  ShieldCheck,
  Triangle,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

type ProjectCardProps = {
  title: string;
  role?: string;
  description: string;
  context?: string;
  outcomes?: string[];
  tags: string[];
  detailsHref?: string;
  detailsLabel?: string;
  variant?: "compact" | "detailed";
  preface?: string;
  githubUrl?: string;
};

export const TECH_BADGE_META: Record<string, { icon: LucideIcon; tone: string }> = {
  Java: { icon: Coffee, tone: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-500/10 dark:text-amber-100" },
  "Spring Boot": { icon: Leaf, tone: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-500/10 dark:text-emerald-100" },
  RabbitMQ: { icon: Radio, tone: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700/50 dark:bg-orange-500/10 dark:text-orange-100" },
  Redis: { icon: Database, tone: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700/50 dark:bg-rose-500/10 dark:text-rose-100" },
  PostgreSQL: { icon: HardDrive, tone: "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700/50 dark:bg-sky-500/10 dark:text-sky-100" },
  Prometheus: { icon: BarChart3, tone: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700/50 dark:bg-orange-500/10 dark:text-orange-100" },
  Grafana: { icon: Gauge, tone: "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-700/50 dark:bg-fuchsia-500/10 dark:text-fuchsia-100" },
  Logging: { icon: FileText, tone: "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-700/50 dark:bg-cyan-500/10 dark:text-cyan-100" },
  "CI/CD": { icon: GitBranch, tone: "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700/50 dark:bg-violet-500/10 dark:text-violet-100" },
  "Eclipse RCP": { icon: Layers3, tone: "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700/50 dark:bg-indigo-500/10 dark:text-indigo-100" },
  Oracle: { icon: HardDrive, tone: "border-red-300 bg-red-50 text-red-700 dark:border-red-700/50 dark:bg-red-500/10 dark:text-red-100" },
  Db2: { icon: ServerCog, tone: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700/50 dark:bg-blue-500/10 dark:text-blue-100" },
  "Robot Framework": { icon: Workflow, tone: "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-700/50 dark:bg-teal-500/10 dark:text-teal-100" },
  Microservices: { icon: Cpu, tone: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100" },
  "Next.js": { icon: Globe, tone: "border-zinc-500 bg-zinc-100 text-zinc-800 dark:border-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-100" },
  TypeScript: { icon: FileCode2, tone: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700/50 dark:bg-blue-500/10 dark:text-blue-100" },
  "Tailwind CSS": { icon: Paintbrush, tone: "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-700/50 dark:bg-teal-500/10 dark:text-teal-100" },
  "GitHub Actions": { icon: Play, tone: "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300" },
  SonarCloud: { icon: ShieldCheck, tone: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700/50 dark:bg-orange-500/10 dark:text-orange-100" },
  Vercel: { icon: Triangle, tone: "border-zinc-500 bg-zinc-100 text-zinc-800 dark:border-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-100" },
  "Claude Code": { icon: BrainCircuit, tone: "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700/50 dark:bg-violet-500/10 dark:text-violet-100" },
};

export default function ProjectCard({
  title,
  role,
  description,
  context,
  outcomes,
  tags,
  detailsHref,
  detailsLabel = "View project details",
  variant = "compact",
  preface,
  githubUrl,
}: Readonly<ProjectCardProps>) {
  const isDetailed = variant === "detailed";
  const prefaceLabel = preface ?? (isDetailed ? "Project narrative" : "Case study");

  return (
    <article className="ds-card ds-card-hover flex h-full min-h-[300px] flex-col justify-between p-6">
      <div>
        <p className="ds-eyebrow text-[11px]">{prefaceLabel}</p>
        <h3 className="ds-display-font ds-text mt-3 text-xl leading-tight sm:text-2xl">{title}</h3>
        {role && <p className="ds-soft mt-3 text-xs font-medium uppercase tracking-[0.14em]">{role}</p>}
        <p className={`ds-muted mt-4 text-sm leading-7 ${isDetailed ? "" : "line-clamp-4"}`}>{description}</p>

        {isDetailed && context && <p className="ds-soft mt-4 text-sm leading-7">{context}</p>}

        {!isDetailed && outcomes?.length ? (
          <div className="ds-border-box mt-4 rounded-[var(--ds-radius-btn)] bg-[var(--ds-accent-soft)] px-3 py-2">
            <p className="ds-muted text-xs font-medium leading-5">Impact: {outcomes[0]}</p>
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ds-link-accent mt-1.5 block text-xs"
              >
                Open source — available as a template on GitHub
              </a>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-7 flex flex-wrap gap-1.5 sm:gap-2">
        {tags.map((tag) => (
          <span key={tag} className="ds-chip">
            {tag}
          </span>
        ))}
      </div>

      {isDetailed && outcomes?.length ? (
        <div className="ds-border-box mt-6 rounded-[var(--ds-radius-btn)] bg-[var(--ds-accent-soft)] p-4">
          <p className="ds-soft text-[11px] font-semibold uppercase tracking-[0.14em]">Selected outcomes</p>
          <ul className="ds-muted mt-3 space-y-2 text-sm leading-6">
            {outcomes.slice(0, 2).map((item) => (
              <li key={item} className="flex gap-2">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ds-accent)]"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {detailsHref && (
        <div className="ds-rule mt-6 flex items-center justify-between gap-3 border-t pt-5">
          <p className="ds-soft text-xs font-medium uppercase tracking-[0.14em]">
            {isDetailed ? "Open full case study" : "Open project narrative"}
          </p>
          <Link href={detailsHref} className="ds-btn-secondary px-3 py-1.5 text-xs">
            {detailsLabel} →
          </Link>
        </div>
      )}
    </article>
  );
}
