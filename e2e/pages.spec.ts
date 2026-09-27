import { test, expect } from "@playwright/test";

test.describe("Static pages", () => {
  test("/projects page loads and shows project cards", async ({ page }) => {
    await page.goto("/projects");
    await expect(page).toHaveTitle(/Projects/i);
    await expect(page.locator("article, [data-testid='project-card'], a[href^='/projects/']").first()).toBeVisible();
  });

  test("/blog page loads and shows blog posts", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/Blog/i);
    await expect(page.locator("article, a[href^='/blog/']").first()).toBeVisible();
  });

  test("/journey page loads and shows timeline", async ({ page }) => {
    await page.goto("/journey");
    await expect(page).toHaveTitle(/Journey/i);
    // Timeline section should be present
    await expect(page.locator("section, main").first()).toBeVisible();
  });

  test("/certifications page loads", async ({ page }) => {
    await page.goto("/certifications");
    await expect(page).toHaveTitle(/Certifications/i);
    await expect(page.locator("main")).toBeVisible();
  });

  test("project detail page loads (emergency-operations-control-platform)", async ({ page }) => {
    await page.goto("/projects/emergency-operations-control-platform");
    await expect(page).toHaveTitle(/Emergency Operations/i);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("blog post loads (designing-resilient-microservices)", async ({ page }) => {
    await page.goto("/blog/designing-resilient-microservices");
    await expect(page.locator("h1")).toBeVisible();
  });
});
