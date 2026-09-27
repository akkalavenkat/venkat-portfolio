/**
 * Tests for getPosts() — the main listing function.
 * fs and gray-matter are fully mocked so no real files are touched.
 */

import fs from "node:fs";
import { getPosts } from "@/app/lib/getPosts";

jest.mock("node:fs");
jest.mock("gray-matter", () => jest.fn());

// gray-matter is a CJS default export; cast to a plain Mock for easy setup.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockMatter = require("gray-matter") as jest.Mock;

const mockedFs = jest.mocked(fs);

// Minimal shape returned by gray-matter that toPost() cares about.
function fakeGrayMatter(overrides: { title?: string; date?: string; excerpt?: string; tags?: string } = {}) {
  return {
    content: "post body",
    data: {
      title: overrides.title ?? "Untitled",
      date: overrides.date ?? "2024-01-01",
      excerpt: overrides.excerpt ?? "An excerpt.",
      tags: overrides.tags ?? "",
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getPosts()", () => {
  it("returns an array of posts", () => {
    (mockedFs.readdirSync as jest.Mock).mockReturnValue(["post-a.md"]);
    (mockedFs.readFileSync as jest.Mock).mockReturnValue("raw content");
    mockMatter.mockReturnValue(fakeGrayMatter({ title: "Post A", date: "2024-03-01" }));

    const posts = getPosts();

    expect(Array.isArray(posts)).toBe(true);
    expect(posts).toHaveLength(1);
  });

  it("each post has the required fields: slug, title, date, href, content, excerpt", () => {
    (mockedFs.readdirSync as jest.Mock).mockReturnValue(["my-post.md"]);
    (mockedFs.readFileSync as jest.Mock).mockReturnValue("raw");
    mockMatter.mockReturnValue(fakeGrayMatter({ title: "My Post", date: "2024-05-10", excerpt: "Short summary." }));

    const [post] = getPosts();

    expect(post.slug).toBe("my-post");
    expect(post.title).toBe("My Post");
    expect(post.date).toBe("2024-05-10");
    expect(post.href).toBe("/blog/my-post");
    expect(post.content).toBe("post body");
    expect(post.excerpt).toBe("Short summary.");
  });

  it("strips .md extension to produce the slug", () => {
    (mockedFs.readdirSync as jest.Mock).mockReturnValue(["hello-world.md"]);
    (mockedFs.readFileSync as jest.Mock).mockReturnValue("raw");
    mockMatter.mockReturnValue(fakeGrayMatter());

    const [post] = getPosts();

    expect(post.slug).toBe("hello-world");
  });

  it("strips .mdx extension to produce the slug", () => {
    (mockedFs.readdirSync as jest.Mock).mockReturnValue(["hello-world.mdx"]);
    (mockedFs.readFileSync as jest.Mock).mockReturnValue("raw");
    mockMatter.mockReturnValue(fakeGrayMatter());

    const [post] = getPosts();

    expect(post.slug).toBe("hello-world");
  });

  it("returns posts sorted by date descending (newest first)", () => {
    (mockedFs.readdirSync as jest.Mock).mockReturnValue(["older.md", "newer.md"]);
    (mockedFs.readFileSync as jest.Mock).mockReturnValue("raw");
    mockMatter
      .mockReturnValueOnce(fakeGrayMatter({ title: "Older Post", date: "2022-06-01" }))
      .mockReturnValueOnce(fakeGrayMatter({ title: "Newer Post", date: "2024-12-01" }));

    const posts = getPosts();

    expect(posts[0].title).toBe("Newer Post");
    expect(posts[1].title).toBe("Older Post");
  });

  it("returns an empty array when there are no markdown files", () => {
    (mockedFs.readdirSync as jest.Mock).mockReturnValue([]);

    const posts = getPosts();

    expect(posts).toEqual([]);
  });

  it("ignores non-markdown files", () => {
    (mockedFs.readdirSync as jest.Mock).mockReturnValue(["readme.txt", "image.png", "data.json", "valid.md"]);
    (mockedFs.readFileSync as jest.Mock).mockReturnValue("raw");
    mockMatter.mockReturnValue(fakeGrayMatter({ title: "Valid" }));

    const posts = getPosts();

    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe("valid");
  });

  it("falls back to 'Untitled' when frontmatter has no title", () => {
    (mockedFs.readdirSync as jest.Mock).mockReturnValue(["no-title.md"]);
    (mockedFs.readFileSync as jest.Mock).mockReturnValue("raw");
    mockMatter.mockReturnValue({ content: "body text", data: { date: "2024-01-01", tags: "" } });

    const [post] = getPosts();

    expect(post.title).toBe("Untitled");
  });

  it("splits comma-separated tags into an array", () => {
    (mockedFs.readdirSync as jest.Mock).mockReturnValue(["tagged.md"]);
    (mockedFs.readFileSync as jest.Mock).mockReturnValue("raw");
    mockMatter.mockReturnValue(fakeGrayMatter({ tags: "java, spring, microservices" }));

    const [post] = getPosts();

    expect(post.tags).toEqual(["java", "spring", "microservices"]);
  });

  it("sets tags to undefined when the tags field is empty", () => {
    (mockedFs.readdirSync as jest.Mock).mockReturnValue(["no-tags.md"]);
    (mockedFs.readFileSync as jest.Mock).mockReturnValue("raw");
    mockMatter.mockReturnValue(fakeGrayMatter({ tags: "" }));

    const [post] = getPosts();

    expect(post.tags).toBeUndefined();
  });
});
