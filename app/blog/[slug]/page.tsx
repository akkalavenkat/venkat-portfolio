import React from "react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Link from "next/link";
import SubpageTopBar from "@/app/components/SubpageTopBar";
import BlogToc from "@/app/components/BlogToc";
import BlogTocSidebar from "@/app/components/BlogTocSidebar";
import CodeBlock from "@/app/components/CodeBlock";
import type { TocItem } from "@/app/components/BlogToc";
import { getPostBySlug, getPostSlugs, getPosts } from "@/app/lib/getPosts";
import type { Metadata } from "next";
import { siteConfig } from "@/app/site.config";
import { Linkedin } from "lucide-react";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const architectureNotes = [
  "API Gateway handles authentication, routing, and rate limiting",
  "Payment Service publishes events to RabbitMQ for async processing",
  "Worker services consume events for validation and settlement",
  "Redis is used for caching and idempotency handling",
  "Database ensures transactional consistency",
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function stripMarkdownInline(value: string): string {
  // Safe: bounded character classes, no nested quantifiers
  let result = value;
  result = result.replaceAll(/`[^`]{1,200}`/g, "");
  result = result.replaceAll(/\[([^\]]{1,200})]\([^)]{0,500}\)/g, "$1");
  result = result.replaceAll(/[*_~]+/g, "");
  result = result.replaceAll(/<[^>]{0,200}>/g, "");
  return result.trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9\s-]/g, "")
    .trim()
    .replaceAll(/\s+/g, "-");
}

function estimateReadingTime(content: string): number {
  const plain = content
    .replaceAll(/```[\s\S]*?```/g, " ")
    .replaceAll(/`[^`]+`/g, " ")
    .replaceAll(/[>#*_-]/g, " ");
  const words = plain.split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 220));
}

// The following regex is safe because blog content is trusted and not attacker-controlled.
function extractTocItems(content: string): TocItem[] {
  if (content.length > 100_000) return [];
  const matches = content.matchAll(/^(##|###)\s+([^\r\n]{1,200})$/gm);
  const seen = new Map<string, number>();

  return Array.from(matches).map((match) => {
    const level = match[1] === "###" ? 3 : 2;
    const text = stripMarkdownInline(match[2]);
    const baseId = slugify(text);
    const count = seen.get(baseId) ?? 0;
    seen.set(baseId, count + 1);

    return {
      id: count > 0 ? `${baseId}-${count + 1}` : baseId,
      text,
      level,
    };
  });
}

// ─── Markdown components ──────────────────────────────────────────────────────

const MarkdownPre: React.FC<React.HTMLAttributes<HTMLPreElement>> = ({ children }) => (
  <>{children}</>
);

const MarkdownCode = ({
  className,
  children,
  ...rest
}: { className?: string; children?: React.ReactNode } & React.HTMLAttributes<HTMLElement>) => {
  if (className) {
    const lang = className.replace("language-", "");
    const codeText = typeof children === "string" ? children.replace(/\n$/, "") : "";
    return (
      <CodeBlock lang={lang} codeText={codeText}>
        {children}
      </CodeBlock>
    );
  }
  return (
    <code
      {...rest}
      className="ds-accent-text rounded bg-[var(--ds-accent-soft)] px-1.5 py-0.5 font-mono text-[0.875em]"
    >
      {children}
    </code>
  );
};

const MarkdownH2 = ({ children, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    {...rest}
    className={
      "ds-text mt-12 scroll-mt-24 text-2xl font-bold tracking-tight " +
      (rest.className ?? "")
    }
  >
    {children}
  </h2>
);

const MarkdownH3 = ({ children, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    {...rest}
    className={
      "ds-text mt-8 scroll-mt-24 text-lg font-semibold " +
      (rest.className ?? "")
    }
  >
    {children}
  </h3>
);

const MarkdownP = ({ children, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    {...rest}
    className={
      "ds-text mt-6 text-[1.0625rem] leading-[1.75] " +
      (rest.className ?? "")
    }
  >
    {children}
  </p>
);

const MarkdownUl = ({ children, ...rest }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul
    {...rest}
    className={
      "ds-text mt-6 space-y-3 pl-6 text-[1.0625rem] leading-[1.75] marker:text-[var(--ds-accent)] " +
      (rest.className ?? "")
    }
  >
    {children}
  </ul>
);

const MarkdownOl = ({ children, ...rest }: React.OlHTMLAttributes<HTMLOListElement>) => (
  <ol
    {...rest}
    className={
      "ds-text mt-6 list-decimal space-y-3 pl-6 text-[1.0625rem] leading-[1.75] marker:text-[var(--ds-accent)] " +
      (rest.className ?? "")
    }
  >
    {children}
  </ol>
);

const MarkdownBlockquote = ({
  children,
  ...rest
}: React.BlockquoteHTMLAttributes<HTMLElement>) => (
  <blockquote
    {...rest}
    className={
      "ds-muted my-7 border-l-4 border-[var(--ds-accent-border)] pl-5 italic " +
      (rest.className ?? "")
    }
  >
    {children}
  </blockquote>
);

const MarkdownA = ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a
    href={href ?? "#"}
    {...rest}
    className={
      "ds-link-accent font-medium underline underline-offset-4 transition " +
      (rest.className ?? "")
    }
  >
    {children}
  </a>
);

const MarkdownHr = (props: React.HTMLAttributes<HTMLHRElement>) => (
  <hr
    {...props}
    className={"ds-rule my-10 " + (props.className ?? "")}
  />
);

const MarkdownImg = ({ src, alt }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const href = typeof src === "string" ? src : "";
  return (
  <span className="my-10 block">
    <a href={href} target="_blank" rel="noopener noreferrer" title="Click to open full size">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src ?? ""}
        alt={alt ?? ""}
        className="ds-rule w-full cursor-zoom-in rounded-[var(--ds-radius-card)] border shadow-sm transition-opacity hover:opacity-90"
      />
    </a>
    {alt && (
      <span className="ds-soft mt-3 block text-center text-[0.8125rem] italic leading-relaxed">
        {alt}
      </span>
    )}
  </span>
  );
};

const MarkdownTable = ({ children, ...rest }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="ds-rule my-7 overflow-x-auto rounded-[var(--ds-radius-card)] border">
    <table
      {...rest}
      className={"w-full border-collapse text-sm " + (rest.className ?? "")}
    >
      {children}
    </table>
  </div>
);

const MarkdownTh = ({ children, ...rest }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    {...rest}
    className={
      "ds-muted ds-rule border-b bg-[var(--ds-surface)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide " +
      (rest.className ?? "")
    }
  >
    {children}
  </th>
);

const MarkdownTd = ({ children, ...rest }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    {...rest}
    className={
      "ds-text border-b border-[var(--ds-divider)] px-4 py-3 " +
      (rest.className ?? "")
    }
  >
    {children}
  </td>
);

// ─── Route exports ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  return params.then(({ slug }) => {
    const post = getPostBySlug(slug);

    if (!post) {
      return { title: "Post not found" };
    }

    return {
      title: post.title,
      description: post.excerpt,
      alternates: {
        canonical: `${siteConfig.seo.url}/blog/${slug}`,
      },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: "article",
        publishedTime: post.date,
        authors: [siteConfig.person.name],
        tags: post.tags,
        url: `${siteConfig.seo.url}/blog/${slug}`,
        images: [{ url: siteConfig.seo.ogImage, width: 500, height: 500, alt: siteConfig.person.name }],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
        images: ["/profile.jpg"],
      },
    };
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: Readonly<BlogPostPageProps>) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const readMinutes = estimateReadingTime(post.content);
  const tocItems = extractTocItems(post.content);
  const isArchitecturePost = slug === "scaling-event-driven-systems";

  const allPosts = getPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const previousPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  return (
    <main className="ds-page min-h-screen transition-colors">
      <SubpageTopBar leftLabel="← All blogs" leftHref="/blog" maxWidthClass="max-w-[1100px]" />

      <div className="mx-auto max-w-[1100px] px-6 py-16 sm:py-24">
        <div className="lg:flex lg:items-start lg:gap-12">

        {/* ── Content column ── */}
        <div className="min-w-0 lg:max-w-[680px] lg:flex-1">

        {/* ── Header ── */}
        <header className="reveal">
          {/* Title */}
          <h1 className="ds-display-font ds-text text-[2rem] leading-[1.15] tracking-tight sm:text-[2.75rem]">
            {post.title}
          </h1>

          {/* Tag pills */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={`${post.slug}-tag-${tag}`}
                  className="ds-chip text-[10px] font-semibold uppercase tracking-[0.07em]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Excerpt */}
          <p className="ds-muted mt-6 max-w-[60ch] text-[1.125rem] leading-relaxed">
            {post.excerpt}
          </p>

          {/* Meta row — indigo left-border accent */}
          <div className="mt-7 border-l-2 border-[var(--ds-accent-border)] pl-3">
            <div className="ds-soft flex items-center justify-between gap-x-3 gap-y-1 text-sm">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{formatDate(post.date)}</span>
                <span aria-hidden="true">·</span>
                <span>{readMinutes} min read</span>
                {post.source === "original" && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Original</span>
                  </>
                )}
                {post.source === "thesis" && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Master&apos;s Thesis</span>
                  </>
                )}
                {post.source && post.source !== "original" && post.source !== "thesis" && (
                  <>
                    <span aria-hidden="true">·</span>
                    <a
                      href={post.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ds-link-accent font-medium transition"
                    >
                      Source article ↗
                    </a>
                  </>
                )}
              </div>
              {(() => {
                const postUrl = `${siteConfig.seo.url}/blog/${slug}`;
                const pillCls = "ds-rule flex shrink-0 items-center gap-1.5 rounded-[var(--ds-radius-chip)] border px-3 py-1 text-xs transition-colors hover:border-[var(--ds-accent-border)] hover:text-[var(--ds-accent)]";
                return (
                  <div className="flex shrink-0 items-center gap-2">
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className={`ds-accent-text ${pillCls}`}>
                      <Linkedin className="h-4 w-4" aria-hidden="true" />
                      <span>LinkedIn</span>
                    </a>
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className={`ds-muted ${pillCls}`}>
                      <span className="font-bold leading-none">𝕏</span>
                      <span>Twitter</span>
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        </header>

        {/* ── Table of contents (inline — hidden on desktop where sidebar takes over) ── */}
        <div className="mt-10 lg:hidden">
          <BlogToc items={tocItems} />
        </div>

        {/* ── Architecture context cards (specific post) ── */}
        {isArchitecturePost && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {architectureNotes.map((note, index) => (
              <div
                key={note}
                className="reveal ds-accent-text rounded-[var(--ds-radius-card)] border border-[var(--ds-accent-border)] bg-[var(--ds-accent-soft)] px-4 py-3 text-sm leading-relaxed"
                style={{ "--reveal-delay": `${index * 110}ms` } as React.CSSProperties}
              >
                {note}
              </div>
            ))}
          </div>
        )}

        {/* ── Article body ── */}
        <article className="mt-12">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug]}
            components={{
              pre: MarkdownPre,
              code: MarkdownCode,
              h2: MarkdownH2,
              h3: MarkdownH3,
              p: MarkdownP,
              ul: MarkdownUl,
              ol: MarkdownOl,
              blockquote: MarkdownBlockquote,
              a: MarkdownA,
              hr: MarkdownHr,
              table: MarkdownTable,
              th: MarkdownTh,
              td: MarkdownTd,
              img: MarkdownImg,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        {/* ── Footer ── */}
        <footer className="ds-rule mt-16 border-t pt-10">
          {/* Tags reprise */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={`${post.slug}-footer-${tag}`}
                  className="ds-chip text-[11px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Prev / Next navigation */}
          {(previousPost ?? nextPost) && (
            <nav
              aria-label="Post navigation"
              className="mt-8 grid gap-4 sm:grid-cols-2"
            >
              {previousPost ? (
                <Link
                  href={previousPost.href}
                  className="ds-card ds-card-hover group flex flex-col gap-1 p-5 transition"
                >
                  <span className="ds-soft text-xs font-semibold uppercase tracking-wide">
                    ← Previous
                  </span>
                  <span className="ds-text mt-1 line-clamp-2 text-sm font-medium group-hover:text-[var(--ds-accent)]">
                    {previousPost.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextPost ? (
                <Link
                  href={nextPost.href}
                  className="ds-card ds-card-hover group flex flex-col items-end gap-1 p-5 text-right transition"
                >
                  <span className="ds-soft text-xs font-semibold uppercase tracking-wide">
                    Next →
                  </span>
                  <span className="ds-text mt-1 line-clamp-2 text-sm font-medium group-hover:text-[var(--ds-accent)]">
                    {nextPost.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </nav>
          )}

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="ds-link-accent text-sm font-medium transition"
            >
              ← Back to all posts
            </Link>
          </div>
        </footer>

        </div>{/* end content column */}

        {/* ── TOC sidebar (desktop only) ── */}
        {tocItems.length >= 2 && (
          <aside className="hidden lg:block lg:w-[220px] lg:shrink-0 lg:sticky lg:top-24 lg:self-start">
            <BlogTocSidebar items={tocItems} />
          </aside>
        )}

        </div>{/* end flex row */}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: {
              "@type": "Person",
              name: siteConfig.person.name,
              url: siteConfig.seo.url,
            },
            url: `${siteConfig.seo.url}/blog/${slug}`,
          }),
        }}
      />
    </main>
  );
}
