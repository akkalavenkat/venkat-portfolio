"use client";

import { useMemo, useState } from "react";
import IssuerIcon from "@/app/components/IssuerIcon";
import type { Certification } from "@/app/data/certifications";

type CertificationsClientProps = {
  certifications: Certification[];
};

const statusLabel: Record<Certification["status"], string> = {
  active: "Active",
  "no-expiry": "No expiry",
  expired: "Expired",
};

const statusBadgeClassName: Record<Certification["status"], string> = {
  active:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/80 dark:bg-emerald-900/30 dark:text-emerald-300",
  "no-expiry":
    "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700/80 dark:bg-sky-900/30 dark:text-sky-300",
  expired:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/80 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function CertificationsClient({ certifications }: Readonly<CertificationsClientProps>) {
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedIssuer, setSelectedIssuer] = useState("all");
  const [selectedFeatured, setSelectedFeatured] = useState("featured");

  const domains = useMemo(
    () => ["all", ...Array.from(new Set(certifications.map((item) => item.domain))).sort((a, b) => a.localeCompare(b))],
    [certifications],
  );

  const issuers = useMemo(
    () => ["all", ...Array.from(new Set(certifications.map((item) => item.issuer))).sort((a, b) => a.localeCompare(b))],
    [certifications],
  );

  const filteredCertifications = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    return certifications
      .filter((item) => {
        if (selectedDomain !== "all" && item.domain !== selectedDomain) {
          return false;
        }

        if (selectedIssuer !== "all" && item.issuer !== selectedIssuer) {
          return false;
        }

        if (selectedFeatured === "featured" && !item.featured) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const haystack = `${item.title} ${item.issuer} ${item.domain} ${item.credentialId ?? ""}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  }, [certifications, search, selectedDomain, selectedIssuer, selectedFeatured]);

  const resetFilters = () => {
    setSearch("");
    setSelectedDomain("all");
    setSelectedIssuer("all");
    setSelectedFeatured("all");
  };

  return (
    <div className="mt-12">
      <div className="ds-card p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="lg:col-span-2">
            <span className="sr-only">Search certifications</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, issuer, domain, or credential ID"
              className="ds-input w-full px-3 py-2 text-sm"
            />
          </label>

          <label>
            <span className="sr-only">Filter by domain</span>
            <select
              value={selectedDomain}
              onChange={(event) => setSelectedDomain(event.target.value)}
              className="ds-input w-full px-3 py-2 text-sm"
            >
              {domains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain === "all" ? "All domains" : domain}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Filter by issuer</span>
            <select
              value={selectedIssuer}
              onChange={(event) => setSelectedIssuer(event.target.value)}
              className="ds-input w-full px-3 py-2 text-sm"
            >
              {issuers.map((issuer) => (
                <option key={issuer} value={issuer}>
                  {issuer === "all" ? "All issuers" : issuer}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Filter by featured</span>
            <select
              value={selectedFeatured}
              onChange={(event) => setSelectedFeatured(event.target.value)}
              className="ds-input w-full px-3 py-2 text-sm"
            >
              <option value="featured">Featured only</option>
              <option value="all">All certifications</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="ds-muted text-sm">
              Showing <span className="ds-text font-semibold">{filteredCertifications.length}</span> of {certifications.length} certifications.
            </p>
            {selectedFeatured === "featured" && (
              <span className="ds-chip">Default filter: Featured only</span>
            )}
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="ds-btn-secondary px-3 py-1.5 text-xs font-semibold"
          >
            Reset filters
          </button>
        </div>
      </div>

      {filteredCertifications.length === 0 ? (
        <div className="ds-rule mt-8 rounded-[var(--ds-radius-card)] border border-dashed bg-[var(--ds-surface)] p-8 text-center">
          <p className="ds-text text-sm font-medium">No certifications match the selected filters.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCertifications.map((item, index) => (
            <article
              key={item.id}
              className="ds-card ds-card-hover reveal relative flex h-full flex-col justify-between p-5"
              style={{ "--reveal-delay": `${index * 110}ms` } as React.CSSProperties}
            >
              {item.featured && (
                <span
                  className="absolute right-4 top-4 text-base leading-none text-amber-400"
                  title="Featured"
                  aria-label="Featured"
                >
                  ★
                </span>
              )}
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

                <h2 className="ds-display-font ds-text mt-4 text-lg font-bold leading-snug">{item.title}</h2>
                <p className="ds-muted mt-2 text-sm font-medium">{item.issuer}</p>
                <p className="ds-soft mt-1 text-xs uppercase tracking-[0.12em]">Issued {item.year}</p>

                {item.credentialId && (
                  <p className="ds-soft mt-4 text-xs">
                    Credential ID: <span className="ds-muted font-medium">{item.credentialId}</span>
                  </p>
                )}
              </div>

              <div className="ds-rule mt-6 border-t pt-4">
                {item.verifyUrl ? (
                  <a
                    href={item.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ds-btn-primary inline-flex items-center px-3 py-1.5 text-xs font-semibold"
                  >
                    Verify credential
                  </a>
                ) : (
                  <span className="ds-soft text-xs font-medium">Verification link not added yet</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
