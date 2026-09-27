/**
 * Tests for the projects data array and getProjectBySlug().
 * No mocks needed — these are pure data integrity checks.
 *
 * Note: the actual Project type has no `id` field; the unique identifier
 * is `slug`. Required fields checked here match the TypeScript definition.
 */

import { projects, getProjectBySlug } from "@/app/data/projects";

describe("projects array", () => {
  it("is not empty", () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it("has unique slugs across all entries", () => {
    const slugs = projects.map((p) => p.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });
});

describe("each project", () => {
  it.each(projects)("$title — has a non-empty slug", ({ slug }) => {
    expect(typeof slug).toBe("string");
    expect(slug.trim().length).toBeGreaterThan(0);
  });

  it.each(projects)("$title — has a non-empty title", ({ title }) => {
    expect(typeof title).toBe("string");
    expect(title.trim().length).toBeGreaterThan(0);
  });

  it.each(projects)("$title — has a non-empty description", ({ description }) => {
    expect(typeof description).toBe("string");
    expect(description.trim().length).toBeGreaterThan(0);
  });

  it.each(projects)("$title — has at least one tag", ({ tags }) => {
    expect(Array.isArray(tags)).toBe(true);
    expect(tags.length).toBeGreaterThan(0);
    tags.forEach((tag) => {
      expect(typeof tag).toBe("string");
      expect(tag.trim().length).toBeGreaterThan(0);
    });
  });

  it.each(projects)("$title — has a non-empty role", ({ role }) => {
    expect(typeof role).toBe("string");
    expect(role.trim().length).toBeGreaterThan(0);
  });

  it.each(projects)("$title — has a non-empty context", ({ context }) => {
    expect(typeof context).toBe("string");
    expect(context.trim().length).toBeGreaterThan(0);
  });

  it.each(projects)("$title — has at least one architecture bullet", ({ architecture }) => {
    expect(Array.isArray(architecture)).toBe(true);
    expect(architecture.length).toBeGreaterThan(0);
  });

  it.each(projects)("$title — has at least one outcome", ({ outcomes }) => {
    expect(Array.isArray(outcomes)).toBe(true);
    expect(outcomes.length).toBeGreaterThan(0);
  });
});

describe("getProjectBySlug()", () => {
  it("returns the matching project for a known slug", () => {
    const first = projects[0];
    const found = getProjectBySlug(first.slug);

    expect(found).not.toBeNull();
    expect(found?.slug).toBe(first.slug);
    expect(found?.title).toBe(first.title);
  });

  it("returns the exact same object reference as the array entry", () => {
    const first = projects[0];
    expect(getProjectBySlug(first.slug)).toBe(first);
  });

  it("returns null for a slug that does not exist", () => {
    expect(getProjectBySlug("project-that-does-not-exist")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(getProjectBySlug("")).toBeNull();
  });

  it("is case-sensitive (uppercase slug does not match)", () => {
    const first = projects[0];
    const upperSlug = first.slug.toUpperCase();
    // Only test case-sensitivity when the slug has letters that differ under upper-casing
    if (upperSlug !== first.slug) {
      expect(getProjectBySlug(upperSlug)).toBeNull();
    }
  });
});
