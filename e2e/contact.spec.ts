import { test, expect } from "@playwright/test";

test.describe("Contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("contact form is visible on homepage", async ({ page }) => {
    await expect(page.locator("form#contact-form")).toBeVisible();
  });

  test("name, email, and message fields are present", async ({ page }) => {
    const form = page.locator("form#contact-form");
    await expect(form.locator('input[type="text"], input:not([type])').first()).toBeVisible();
    await expect(form.locator('input[type="email"]')).toBeVisible();
    await expect(form.locator("textarea")).toBeVisible();
  });

  test("submit button is present and labelled", async ({ page }) => {
    await expect(
      page.locator("form#contact-form button[type='submit']")
    ).toBeVisible();
  });

  test("honeypot field exists but is hidden", async ({ page }) => {
    const honeypot = page.locator("form#contact-form label.hidden input");
    await expect(honeypot).toHaveCount(1);
    // Must not be visible to real users
    await expect(honeypot).toBeHidden();
  });
});
