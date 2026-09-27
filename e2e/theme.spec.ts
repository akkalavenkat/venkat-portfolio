import { test, expect } from "@playwright/test";

test.describe("Theme toggle", () => {
  test("theme toggle button is visible in navbar", async ({ page }) => {
    await page.goto("/");
    // ThemeToggle renders a button in the navbar
    await expect(page.locator("header button[aria-label]").filter({ hasText: "" }).last()).toBeVisible();
  });

  test("clicking theme toggle switches between dark and light", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");

    // Locate the theme toggle button (last icon button in navbar)
    const toggle = page.locator("header").getByRole("button", { name: /theme|dark|light|toggle/i }).first();

    const initialClass = await html.getAttribute("class");

    await toggle.click();
    await page.waitForTimeout(100);

    const afterClass = await html.getAttribute("class");
    // Class should have changed (dark added or removed)
    expect(afterClass).not.toBe(initialClass);
  });

  test("theme persists on page reload", async ({ page }) => {
    await page.goto("/");

    const toggle = page.locator("header").getByRole("button", { name: /theme|dark|light|toggle/i }).first();
    await toggle.click();
    await page.waitForTimeout(100);

    const classAfterToggle = await page.locator("html").getAttribute("class");

    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    const classAfterReload = await page.locator("html").getAttribute("class");
    expect(classAfterReload).toBe(classAfterToggle);
  });
});
