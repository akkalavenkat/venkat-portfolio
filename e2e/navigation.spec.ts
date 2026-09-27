import { test, expect } from "@playwright/test";
import { siteConfig } from "@/app/site.config";

test.describe("Navigation", () => {
  test("homepage loads with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(new RegExp(siteConfig.person.name));
  });

  test("logo/name links back to homepage", async ({ page }) => {
    await page.goto("/journey");
    await page.locator('a').filter({ hasText: 'Home' }).first().click();
    await expect(page).not.toHaveURL(/journey/);
  });

  test("Projects nav link is visible on homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('nav a[href="#projects"]')).toBeVisible();
  });

  test("Blog nav link is visible on homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('nav a[href="#blog"]')).toBeVisible();
  });

  test("Contact nav link is visible on homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('nav a[href="#contact"]')).toBeVisible();
  });

  test("'Let's talk' button is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="#contact"]').filter({ hasText: /let.s talk/i })).toBeVisible();
  });
});
