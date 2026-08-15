import type { Metadata } from "next";
import ExperienceTimeline from "@/app/components/ExperienceTimeline";
import SubpageTopBar from "@/app/components/SubpageTopBar";
import { siteConfig } from "@/app/site.config";

const description = `A timeline of ${siteConfig.person.name}'s career — roles, responsibilities, and growth.`;

export const metadata: Metadata = {
  title: "Career Journey",
  description,
  metadataBase: new URL(siteConfig.seo.url),
  alternates: { canonical: `${siteConfig.seo.url}/journey` },
  openGraph: {
    type: "website",
    title: `Career Journey | ${siteConfig.person.name}`,
    description,
    url: `${siteConfig.seo.url}/journey`,
    images: [{ url: siteConfig.seo.ogImage, width: 500, height: 500, alt: siteConfig.person.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Career Journey | ${siteConfig.person.name}`,
    description,
    images: [siteConfig.seo.ogImage],
  },
};

export default function JourneyPage() {
  return (
    <main className="ds-page min-h-screen">
      <SubpageTopBar leftLabel="Journey" rightHref="/" />

      <ExperienceTimeline />

      {/* Download Resume button removed as requested */}
    </main>
  );
}
