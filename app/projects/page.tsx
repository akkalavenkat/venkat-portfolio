import type { Metadata } from "next";
import ProjectCard from "@/app/components/ProjectCard";
import SubpageTopBar from "@/app/components/SubpageTopBar";
import { projects } from "@/app/data/projects";
import { siteConfig } from "@/app/site.config";

const description = siteConfig.seo.description;

export const metadata: Metadata = {
  title: "Projects",
  description,
  metadataBase: new URL(siteConfig.seo.url),
  alternates: { canonical: `${siteConfig.seo.url}/projects` },
  openGraph: {
    type: "website",
    title: `Projects | ${siteConfig.person.name}`,
    description,
    url: `${siteConfig.seo.url}/projects`,
    images: [{ url: siteConfig.seo.ogImage, width: 500, height: 500, alt: siteConfig.person.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Projects | ${siteConfig.person.name}`,
    description,
    images: [siteConfig.seo.ogImage],
  },
};

export default function ProjectsIndexPage() {
  return (
    <main className="ds-page min-h-screen transition-colors">
      <SubpageTopBar leftLabel="Projects" rightHref="/#projects" />

      <section className="section-ambient border-b ds-rule bg-[var(--ds-bg-alt)]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="reveal mx-auto max-w-3xl text-center">
            <h2 className="ds-section-title text-3xl tracking-tight sm:text-5xl">Project implementation stories</h2>
            <p className="ds-section-sub mt-4 text-base leading-7 sm:text-lg sm:leading-8">
              Detailed project pages with context, architecture decisions, and measurable outcomes.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
              <div
                key={project.slug}
                className="reveal"
                style={{ "--reveal-delay": `${index * 110}ms` } as React.CSSProperties}
              >
                <ProjectCard
                  title={project.title}
                  description={project.description}
                  tags={project.tags}
                  detailsHref={`/projects/${project.slug}`}
                  detailsLabel="Open project page"
                  variant="compact"
                  preface={project.preface}
                  githubUrl={project.githubUrl}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.seo.url },
              { "@type": "ListItem", position: 2, name: "Projects", item: `${siteConfig.seo.url}/projects` },
            ],
          }),
        }}
      />
    </main>
  );
}
