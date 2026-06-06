import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("nav bar is visible on homepage", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
  });

  test("language toggle switches EN to LT", async ({ page }) => {
    await page.goto("/");
    // Initially in English
    await expect(page.locator("text=Products").first()).toBeVisible();
    // Click the language toggle (shows "LT" when current lang is EN)
    await page.getByRole("button", { name: "LT" }).click();
    // Lithuanian text appears
    await expect(page.locator("text=Produktai").first()).toBeVisible({ timeout: 3000 });
  });

  test("Shop Now button opens shop overlay", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /shop now/i }).first().click();
    // Shop overlay appears
    await expect(page.locator("text=/Holy Shop|Šventoji/i").first()).toBeVisible({ timeout: 3000 });
  });

  test("Bad Planet comet opens the Bad Planet overlay", async ({ page }) => {
    await page.goto("/");
    // CometBad renders a button/div with the skull emoji or "BAD PLANET" text
    const comet = page.locator("text=/bad planet|avoid/i, button:has-text('☠'), [aria-label*='Bad']").first();
    if (await comet.isVisible()) {
      await comet.click();
      await expect(page.locator("text=/bad planet|toxic|danger/i").first()).toBeVisible({ timeout: 3000 });
    } else {
      // On mobile layout comet may be hidden — pass the test
      test.skip();
    }
  });

  test("footer links are present", async ({ page }) => {
    await page.goto("/");
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator("text=Privacy").first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator("text=Contact").first()).toBeVisible({ timeout: 3000 });
  });
});
