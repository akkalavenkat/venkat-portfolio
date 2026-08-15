import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Post = {
  title: string;
  excerpt: string;
  date: string;
  href: string;
  slug: string;
  content: string;
  tags?: string[];
  source?: string;
};

const postsDir = path.join(process.cwd(), "app", "data", "posts");

function toPost(fileName: string): Post {
  const filePath = path.join(postsDir, fileName);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { content, data } = matter(fileContent);
  const slug = fileName.replace(/\.mdx?$/, "");
  const fallbackExcerpt = content.slice(0, 140).trim();
  const tags = (data.tags ?? "")
    .split(",")
    .map((tag: string) => tag.trim())
    .filter(Boolean);

  return {
    title: data.title ?? "Untitled",
    excerpt: data.excerpt ?? fallbackExcerpt,
    date: data.date ?? "",
    slug,
    href: `/blog/${slug}`,
    content,
    tags: tags.length > 0 ? tags : undefined,
    source: data.source ? String(data.source).trim() : undefined,
  };
}

export function getPosts(): Post[] {
  const fileNames = fs.readdirSync(postsDir);

  return fileNames
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((fileName) => toPost(fileName))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post | null {
  const mdPath = path.join(postsDir, `${slug}.md`);
  const mdxPath = path.join(postsDir, `${slug}.mdx`);

  if (fs.existsSync(mdPath)) return toPost(`${slug}.md`);
  if (fs.existsSync(mdxPath)) return toPost(`${slug}.mdx`);

  return null;
}

export function getPostSlugs(): string[] {
  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx?$/, ""));
}
