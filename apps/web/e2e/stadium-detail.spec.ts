import { test, expect } from "@playwright/test";
import { SEED_STADIUM_NAKHEEL } from "./helpers/seed-stadiums";

/**
 * US-03: كزائر، أريد فتح صفحة ملعب حتى أرى التفاصيل قبل الحجز.
 */
test.describe("US-03 — صفحة الملعب", () => {
  test("فتح تفاصيل ملعب من القائمة", async ({ page }) => {
    await page.goto("/stadiums");

    const stadiumLink = page.getByRole("link", { name: SEED_STADIUM_NAKHEEL.name });
    await expect(stadiumLink).toBeVisible({ timeout: 15_000 });
    await stadiumLink.click();

    await expect
      .poll(() => decodeURIComponent(new URL(page.url()).pathname))
      .toBe(SEED_STADIUM_NAKHEEL.path);

    await expect(
      page.getByRole("heading", { name: SEED_STADIUM_NAKHEEL.name }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: "سجّل للحجز" })).toBeVisible();
  });
});
