import ProjectCard from "./ProjectCard";
import Link from "next/link";
import { projects } from "@/app/data/projects";

const featuredSlugs = [
  "portfolio-development",
  "secure-code-execution-engine",
  "emergency-operations-control-platform",
];
const featuredProjects = featuredSlugs
  .map((slug) => projects.find((p) => p.slug === slug))
  .filter(Boolean);

export default function Projects() {
  return (
    <section id="projects" className="ds-section ds-section-alt">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="reveal mx-auto max-w-2xl text-center">
          <h2 className="ds-section-title">Featured projects</h2>
          <p className="ds-section-sub mt-4 text-base leading-8 sm:text-lg sm:leading-9">
            Selected work demonstrating backend design, system reliability, and engineering collaboration. Open each project for dedicated implementation and architecture details.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:gap-7 lg:grid-cols-3">
          {featuredProjects.map((project, index) => (
            <div
              key={project!.title}
              className="reveal"
              style={{ "--reveal-delay": `${index * 110}ms` } as React.CSSProperties}
            >
              <ProjectCard
                title={project!.title}
                description={project!.description}
                outcomes={project!.outcomes}
                tags={project!.tags}
                detailsHref={`/projects/${project!.slug}`}
                detailsLabel="View project page"
                variant="compact"
                preface={project!.preface}
                githubUrl={project!.githubUrl}
              />
            </div>
          ))}
        </div>
        <div className="reveal mt-8 text-center" style={{ "--reveal-delay": "200ms" } as React.CSSProperties}>
          <Link href="/projects" className="ds-btn-primary px-4 py-2 text-sm">
            View all projects →
          </Link>
        </div>
      </div>
    </section>
  );
}
