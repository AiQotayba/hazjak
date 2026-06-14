import { test, expect } from "@playwright/test";
import { SEED_STADIUM_NAKHEEL } from "./helpers/seed-stadiums";

/**
 * US-01: كزائر، أريد تصفّح الملاعب حتى أختار ملعباً للحجز.
 */
test.describe("US-01 — تصفّح الملاعب", () => {
  test("من الصفحة الرئيسية إلى قائمة الملاعب", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /احجز ملعبك/i })).toBeVisible();

    await page.getByRole("link", { name: "تصفح الملاعب" }).click();
    await expect(page).toHaveURL(/\/stadiums/);

    await expect(
      page.getByRole("link", { name: SEED_STADIUM_NAKHEEL.name }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
