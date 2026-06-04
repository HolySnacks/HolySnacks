import { test, expect } from "@playwright/test";

test.describe("Homepage smoke tests", () => {
  test("loads the homepage and shows the HolySnacks brand", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/HolySnacks/i);
    await expect(page.locator("text=HolySnacks").first()).toBeVisible();
  });

  test("ingredient scanner section is present", async ({ page }) => {
    await page.goto("/");
    const scanner = page.locator("[data-testid='ingredient-scanner'], input[placeholder*='ingredient'], textarea[placeholder*='ingredient']").first();
    // Scanner section should exist in the DOM even if not immediately visible
    await expect(page.locator("text=Scan").first()).toBeVisible({ timeout: 10000 });
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveTitle(/About/i);
  });

  test("contact page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(page).toHaveTitle(/Contact/i);
  });

  test("privacy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveTitle(/Privacy/i);
  });
});
