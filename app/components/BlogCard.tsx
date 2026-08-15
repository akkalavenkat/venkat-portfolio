import Link from "next/link";
import type { Post } from "@/app/lib/getPosts";

type BlogCardProps = {
  post: Post;
  variant?: "compact" | "detailed";
};

export default function BlogCard({ post, variant = "compact" }: Readonly<BlogCardProps>) {
  const isDetailed = variant === "detailed";

  return (
    <article className="ds-card ds-card-hover flex h-full flex-col justify-between p-6">
      <div>
        <p className="ds-eyebrow text-[11px]">{isDetailed ? "Technical article" : "Article preview"}</p>
        <h3 className="ds-display-font ds-text mt-3 text-xl leading-snug sm:text-2xl">{post.title}</h3>
        <p className="ds-soft mt-3 text-xs font-medium uppercase tracking-[0.14em]">{post.date}</p>
        <p className={`ds-muted mt-4 text-sm leading-7 ${isDetailed ? "" : "line-clamp-4"}`}>{post.excerpt}</p>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="mt-7 flex flex-wrap gap-2 sm:gap-2.5">
          {post.tags.slice(0, isDetailed ? 4 : 3).map((tag) => (
            <span key={`${post.slug}-${tag}`} className="ds-chip">
              {tag}
            </span>
          ))}
        </div>
      )}

      {isDetailed && (
        <div className="ds-border-box mt-6 rounded-[var(--ds-radius-btn)] bg-[var(--ds-accent-soft)] p-4">
          <p className="ds-soft text-[11px] font-semibold uppercase tracking-[0.14em]">Article focus</p>
          <p className="ds-muted mt-3 text-sm leading-7">
            Practical notes on backend engineering decisions, tradeoffs, and implementation patterns drawn from real system design concerns.
          </p>
        </div>
      )}

      <div className="ds-rule mt-6 flex items-center justify-between gap-3 border-t pt-5 text-xs">
        <p className="ds-soft font-medium uppercase tracking-[0.14em]">
          {isDetailed ? "Open full article" : "Read article"}
        </p>
        <Link href={post.href} className="ds-btn-secondary px-3 py-1.5">
          Read more →
        </Link>
      </div>
    </article>
  );
}
