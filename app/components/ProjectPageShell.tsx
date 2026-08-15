import SubpageTopBar from "@/app/components/SubpageTopBar";
import ProjectTabs, { type ProjectTab } from "@/app/components/ProjectTabs";
import { TECH_BADGE_META } from "@/app/components/ProjectCard";
import { siteConfig } from "@/app/site.config";
import type { Project } from "@/app/data/projects";
import { Cpu, Github } from "lucide-react";

type ProjectPageShellProps = {
  project: Project;
  slug: string;
  tabs: ProjectTab[];
};

export default function ProjectPageShell({ project, slug, tabs }: Readonly<ProjectPageShellProps>) {
  return (
    <main className="ds-page min-h-screen transition-colors">
      <SubpageTopBar leftLabel="← All projects" leftHref="/projects" maxWidthClass="max-w-4xl" />
      <article className="mx-auto max-w-4xl px-6 py-20">
        <header className="reveal border-b ds-rule pb-7">
          {project.preface && <p className="ds-eyebrow text-[11px]">{project.preface}</p>}
          <h1
            className={`ds-section-title text-3xl tracking-tight sm:text-5xl ${project.preface ? "mt-3" : ""}`}
          >
            {project.title}
          </h1>
          <p className="ds-muted mt-4 text-base leading-8">{project.description}</p>
          <p className="ds-soft mt-3 text-sm font-medium">Role: {project.role}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => {
              const Icon = (TECH_BADGE_META[tag] ?? { icon: Cpu }).icon;
              return (
                <span key={tag} className="ds-chip gap-1.5">
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
                  {tag}
                </span>
              );
            })}
          </div>
        </header>

        {project.githubUrl && (
          <div className="mt-6 flex flex-col gap-3 rounded-[var(--ds-radius-card)] border border-[var(--ds-accent-border)] bg-[var(--ds-accent-soft)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Github className="ds-accent-text h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="ds-text text-sm font-medium">
                This portfolio is open source and available as a template
              </p>
            </div>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-btn-secondary shrink-0 gap-1.5 self-start px-4 py-2 text-xs sm:self-auto"
            >
              Use this template →
            </a>
          </div>
        )}

        <div className="mt-8">
          <ProjectTabs tabs={tabs} />
        </div>
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.seo.url },
              { "@type": "ListItem", position: 2, name: "Projects", item: `${siteConfig.seo.url}/projects` },
              { "@type": "ListItem", position: 3, name: project.title, item: `${siteConfig.seo.url}/projects/${slug}` },
            ],
          }),
        }}
      />
    </main>
  );
}
