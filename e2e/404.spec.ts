import { test, expect } from "@playwright/test";

test.describe("404 handling", () => {
  test("visiting a nonexistent page shows 404 UI or error page", async ({ page }) => {
    const response = await page.goto("/nonexistent-page");
    // Next.js returns 404 status for unknown routes
    expect(response?.status()).toBe(404);
    // The page should render something (not blank)
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("nonexistent project slug shows 404", async ({ page }) => {
    const response = await page.goto("/projects/this-project-does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("nonexistent blog slug shows 404", async ({ page }) => {
    const response = await page.goto("/blog/this-post-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
