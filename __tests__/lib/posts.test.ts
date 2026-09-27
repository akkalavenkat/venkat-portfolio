/**
 * Tests for getPostBySlug() and getPostSlugs().
 * Focuses on slug resolution, file-extension handling, and null returns.
 */

import fs from "node:fs";
import { getPostBySlug, getPostSlugs } from "@/app/lib/getPosts";

jest.mock("node:fs");
jest.mock("gray-matter", () => jest.fn());

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockMatter = require("gray-matter") as jest.Mock;

const mockedFs = jest.mocked(fs);

function fakeGrayMatter(title = "Test Post", date = "2024-01-01") {
  return {
    content: "post body",
    data: { title, date, excerpt: "An excerpt.", tags: "" },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getPostBySlug()", () => {
  it("returns null for a slug that does not exist as .md or .mdx", () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValue(false);

    const result = getPostBySlug("non-existent-post");

    expect(result).toBeNull();
  });

  it("returns the post when a .md file exists for the slug", () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValueOnce(true); // .md exists
    (mockedFs.readFileSync as jest.Mock).mockReturnValue("raw content");
    mockMatter.mockReturnValue(fakeGrayMatter("My Post"));

    const post = getPostBySlug("my-post");

    expect(post).not.toBeNull();
    expect(post?.slug).toBe("my-post");
    expect(post?.title).toBe("My Post");
    expect(post?.href).toBe("/blog/my-post");
  });

  it("returns the post when only a .mdx file exists (no .md)", () => {
    (mockedFs.existsSync as jest.Mock)
      .mockReturnValueOnce(false)  // .md does not exist
      .mockReturnValueOnce(true);  // .mdx exists
    (mockedFs.readFileSync as jest.Mock).mockReturnValue("raw content");
    mockMatter.mockReturnValue(fakeGrayMatter("MDX Post", "2024-06-15"));

    const post = getPostBySlug("mdx-post");

    expect(post).not.toBeNull();
    expect(post?.slug).toBe("mdx-post");
    expect(post?.date).toBe("2024-06-15");
  });

  it("prefers .md over .mdx when both would exist", () => {
    // existsSync returns true on first call (.md) — .mdx never checked
    (mockedFs.existsSync as jest.Mock).mockReturnValueOnce(true);
    (mockedFs.readFileSync as jest.Mock).mockReturnValue("raw");
    mockMatter.mockReturnValue(fakeGrayMatter("Markdown Post"));

    const post = getPostBySlug("dual-format");

    expect(post?.slug).toBe("dual-format");
    // existsSync should only have been called once (short-circuit on .md)
    expect(mockedFs.existsSync).toHaveBeenCalledTimes(1);
  });

  it("includes the source field from frontmatter when present", () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValueOnce(true);
    (mockedFs.readFileSync as jest.Mock).mockReturnValue("raw");
    mockMatter.mockReturnValue({
      content: "body",
      data: {
        title: "Post With Source",
        date: "2024-01-01",
        excerpt: "excerpt",
        tags: "",
        source: "https://www.example.com/blog/post-with-source",
      },
    });

    const post = getPostBySlug("post-with-source");

    expect(post?.source).toBe("https://www.example.com/blog/post-with-source");
  });
});

describe("getPostSlugs()", () => {
  it("returns slugs without file extensions", () => {
    (mockedFs.readdirSync as jest.Mock).mockReturnValue(["first-post.md", "second-post.mdx"]);

    const slugs = getPostSlugs();

    expect(slugs).toEqual(["first-post", "second-post"]);
  });

  it("excludes non-markdown files from the slug list", () => {
    (mockedFs.readdirSync as jest.Mock).mockReturnValue(["post.md", "image.png", "config.json", "notes.mdx"]);

    const slugs = getPostSlugs();

    expect(slugs).toHaveLength(2);
    expect(slugs).toContain("post");
    expect(slugs).toContain("notes");
  });

  it("returns an empty array when no markdown files exist", () => {
    (mockedFs.readdirSync as jest.Mock).mockReturnValue([]);

    expect(getPostSlugs()).toEqual([]);
  });
});
