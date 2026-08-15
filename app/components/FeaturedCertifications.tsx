import Link from "next/link";
import { certifications } from "@/app/data/certifications";
import IssuerIcon from "@/app/components/IssuerIcon";

const statusBadgeClassName = {
  active:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/80 dark:bg-emerald-900/30 dark:text-emerald-300",
  "no-expiry":
    "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700/80 dark:bg-sky-900/30 dark:text-sky-300",
  expired:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/80 dark:bg-amber-900/30 dark:text-amber-300",
} as const;

const statusLabel = {
  active: "Active",
  "no-expiry": "No expiry",
  expired: "Expired",
} as const;

const featuredCertifications = certifications.filter((item) => item.featured);

export default function FeaturedCertifications({ showLink = true }: Readonly<{ showLink?: boolean }>) {
  return (
    <section className="ds-section">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        {showLink && (
          <div className="reveal mx-auto max-w-2xl text-center">
            <h2 className="ds-section-title text-3xl font-bold tracking-tight sm:text-5xl">Featured certifications</h2>
            <p className="ds-muted mt-4 text-base leading-8 sm:text-lg sm:leading-9">
              Snapshot of top certifications across cloud architecture, AI, Java, and backend engineering.
            </p>
          </div>
        )}

        {!showLink && (
          <div className="mb-10">
            <h2 className="ds-display-font ds-text text-lg font-bold">Highlights</h2>
            <p className="ds-soft mt-1 text-sm">Top 5 featured certifications</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredCertifications.map((item, index) => (
            <article
              key={item.id}
              className="ds-card ds-card-hover reveal flex h-full flex-col justify-between p-5"
              style={{ "--reveal-delay": `${index * 110}ms` } as React.CSSProperties}
            >
              <div>
                <div className="flex items-start gap-3">
                  <IssuerIcon issuer={item.issuer} />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="ds-chip">{item.domain}</span>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${statusBadgeClassName[item.status]}`}>
                      {statusLabel[item.status]}
                    </span>
                  </div>
                </div>

                <h3 className="ds-display-font ds-text mt-4 line-clamp-3 text-base font-bold leading-snug">
                  {item.title}
                </h3>
                <p className="ds-muted mt-1.5 text-sm font-medium">{item.issuer}</p>
                <p className="ds-soft mt-0.5 text-xs uppercase tracking-[0.12em]">Issued {item.year}</p>
              </div>
            </article>
          ))}
        </div>

        {showLink && (
          <div className="mt-10 text-center">
            <Link
              href="/certifications"
              className="ds-btn-primary inline-flex items-center px-4 py-2 text-sm font-semibold"
            >
              View all certifications →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
