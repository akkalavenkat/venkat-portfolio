import Link from "next/link";
import BlogCard from "@/app/components/BlogCard";
import { getPosts } from "@/app/lib/getPosts";

export default function BlogPreview() {
  const posts = getPosts().slice(0, 3);

  return (
    <section id="blog" className="ds-section ds-section-alt">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="reveal mx-auto max-w-2xl text-center">
          <h2 className="ds-section-title">Blog preview</h2>
          <p className="ds-section-sub mt-4 text-base leading-8 sm:text-lg sm:leading-9">
            Thoughts on backend architecture, scaling systems, and practical engineering patterns.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {posts.map((post, index) => (
            <div
              key={post.slug}
              className="reveal"
              style={{ "--reveal-delay": `${index * 110}ms` } as React.CSSProperties}
            >
              <BlogCard post={post} variant="compact" />
            </div>
          ))}
        </div>

        <div className="reveal mt-8 text-center" style={{ "--reveal-delay": "200ms" } as React.CSSProperties}>
          <Link href="/blog" className="ds-btn-primary px-4 py-2 text-sm">
            View all blogs
          </Link>
        </div>
      </div>
    </section>
  );
}
