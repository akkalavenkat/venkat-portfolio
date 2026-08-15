import type { Metadata } from "next";
import CertificationsClient from "@/app/components/CertificationsClient";
import SubpageTopBar from "@/app/components/SubpageTopBar";
import { certifications } from "@/app/data/certifications";
import { siteConfig } from "@/app/site.config";

const description = siteConfig.seo.description;

export const metadata: Metadata = {
  title: "Certifications",
  description,
  metadataBase: new URL(siteConfig.seo.url),
  alternates: { canonical: `${siteConfig.seo.url}/certifications` },
  openGraph: {
    type: "website",
    title: `Certifications | ${siteConfig.person.name}`,
    description,
    url: `${siteConfig.seo.url}/certifications`,
    images: [{ url: siteConfig.seo.ogImage, width: 500, height: 500, alt: siteConfig.person.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Certifications | ${siteConfig.person.name}`,
    description,
    images: [siteConfig.seo.ogImage],
  },
};

export default function CertificationsPage() {
  return (
    <main className="ds-page min-h-screen">
      <SubpageTopBar leftLabel="Certifications" rightHref="/" />

      <section className="ds-section-alt">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="reveal mx-auto max-w-3xl text-center">
            <p className="ds-eyebrow">Professional learning</p>
            <h1 className="ds-section-title mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Technical Certifications</h1>
            <p className="ds-muted mt-4 text-base leading-7 sm:text-lg sm:leading-8">
              A curated view of cloud, backend, and software engineering certifications with filtering by domain, issuer, and status.
            </p>
          </div>

          <CertificationsClient certifications={certifications} />
        </div>
      </section>
    </main>
  );
}
