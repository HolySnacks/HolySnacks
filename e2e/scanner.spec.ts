import { test, expect } from "@playwright/test";

// Uses an ingredient list (>1 comma → looksLikeProductName returns false)
// so the scanner goes straight to local analysis with no API calls.
const BAD_INGREDIENT_LIST =
  "Water, Sugar, High Fructose Corn Syrup, Sodium Benzoate, Artificial Flavors, Red 40, Yellow 5";

test.describe("Ingredient scanner", () => {
  test("scans a pasted ingredient list and shows score + bad ingredients", async ({ page }) => {
    await page.goto("/#scanner");

    // Fill the textarea
    const textarea = page.locator("textarea").first();
    await textarea.fill(BAD_INGREDIENT_LIST);

    // Click the Scan button
    await page.getByRole("button", { name: /scan/i }).first().click();

    // Wait for the score to appear (600 ms animation delay + React render)
    const scoreHeading = page.locator("text=/\\d{3,4}/").first();
    await expect(scoreHeading).toBeVisible({ timeout: 5000 });

    // At least one bad ingredient card should be visible
    const badSection = page.locator("text=/High Fructose|Sodium Benzoate|Artificial/i").first();
    await expect(badSection).toBeVisible({ timeout: 3000 });

    // Grade label visible (e.g. "Poor", "Mediocre", "Avoid")
    const gradeText = page.locator("text=/poor|mediocre|avoid|alert|caution/i").first();
    await expect(gradeText).toBeVisible({ timeout: 3000 });
  });

  test("shows share button after scanning", async ({ page }) => {
    await page.goto("/#scanner");
    const textarea = page.locator("textarea").first();
    await textarea.fill(BAD_INGREDIENT_LIST);
    await page.getByRole("button", { name: /scan/i }).first().click();
    const shareBtn = page.locator("button", { hasText: /share result|dalintis/i });
    await expect(shareBtn).toBeVisible({ timeout: 5000 });
  });
});
