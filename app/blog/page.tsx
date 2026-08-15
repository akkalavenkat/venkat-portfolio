import type { Metadata } from "next";
import { Suspense } from "react";
import BlogPreviewClient from "@/app/components/BlogPreviewClient";
import SubpageTopBar from "@/app/components/SubpageTopBar";
import { getPosts } from "@/app/lib/getPosts";
import { siteConfig } from "@/app/site.config";

const description =
  "Articles on backend engineering — Java microservices, distributed systems, resiliency patterns, observability, and event-driven architecture.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: { canonical: "https://www.shrikant-havale.in/blog" },
  openGraph: {
    type: "website",
    title: "Blog | Shrikant Havale",
    description,
    url: `${siteConfig.seo.url}/blog`,
    images: [{ url: siteConfig.seo.ogImage, width: 500, height: 500, alt: siteConfig.person.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Blog | ${siteConfig.person.name}`,
    description,
    images: ["/profile.jpg"],
  },
};

export default function BlogIndexPage() {
  const posts = getPosts();

  return (
    <main className="ds-page min-h-screen transition-colors">
      <SubpageTopBar leftLabel="Blog" rightHref="/#blog" />

      <section className="section-ambient border-b ds-rule bg-[var(--ds-bg-alt)]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="reveal mx-auto max-w-2xl text-center">
            <h2 className="ds-section-title text-3xl sm:text-5xl">Blog library</h2>
            <p className="ds-section-sub mt-4 text-base leading-7 sm:text-lg sm:leading-8">
              Explore all articles on backend architecture, distributed systems, and practical engineering patterns.
            </p>
          </div>
          <Suspense fallback={null}>
            <BlogPreviewClient posts={posts} />
          </Suspense>
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
              { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.seo.url}/blog` },
            ],
          }),
        }}
      />
    </main>
  );
}
