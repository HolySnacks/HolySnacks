import { test, expect } from "@playwright/test";

test.describe("Static content pages", () => {
  test("product page loads with correct content", async ({ page }) => {
    await page.goto("/products/kubix-classic");
    await expect(page).toHaveTitle(/KubiX|HolySnacks/i);
    // Product name visible in the page body
    await expect(page.locator("text=KubiX").first()).toBeVisible();
    // JSON-LD structured data injected
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toHaveCount(1);
    const ldContent = await jsonLd.textContent();
    expect(ldContent).toContain("Product");
  });

  test("ingredient education page loads with correct content", async ({ page }) => {
    await page.goto("/ingredients/high-fructose-corn-syrup");
    await expect(page).toHaveTitle(/fructose|HolySnacks/i);
    await expect(page.locator("text=/fructose/i").first()).toBeVisible();
  });

  test("history page shows sign-in prompt when unauthenticated", async ({ page }) => {
    await page.goto("/history");
    // Should show a sign-in prompt, not a 404 or blank page
    const prompt = page.locator("text=/sign in|log in|prisijungti/i").first();
    await expect(prompt).toBeVisible({ timeout: 5000 });
  });

  test("about page renders", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("text=/about|apie/i").first()).toBeVisible();
  });

  test("product page 404 for unknown slug", async ({ page }) => {
    await page.goto("/products/this-product-does-not-exist-xyz");
    // Either a 404 page or a not-found message
    const body = await page.content();
    const is404 = body.includes("404") || body.includes("not found") || body.includes("Not Found");
    expect(is404).toBe(true);
  });
});
