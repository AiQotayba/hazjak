import { test, expect } from "@playwright/test";
import { fillRegisterForm } from "../helpers/auth-forms";
import { TEST_PASSWORD, uniqueTestPhone } from "../helpers/test-users";

test.describe("Auth — /register/owner", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register/owner");
  });

  test("تعرض نموذج تسجيل صاحب الملعب", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "سجّل كصاحب ملعب" })).toBeVisible();
    await expect(page.getByRole("button", { name: "متابعة التسجيل" })).toBeVisible();
  });

  test("تسجيل ناجح ينقل لصفحة التحقق", async ({ page }) => {
    const phone = uniqueTestPhone();

    await fillRegisterForm(page, {
      firstName: "مالك",
      lastName: "ملعب",
      phone,
      password: TEST_PASSWORD,
    });
    await page.getByRole("button", { name: "متابعة التسجيل" }).click();

    await expect(page).toHaveURL(/\/verify-email/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "تحقق من واتساب" })).toBeVisible();
  });

  test("روابط الدخول وتسجيل اللاعب", async ({ page }) => {
    await page.getByRole("link", { name: "دخول" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/register/owner");
    await page.getByRole("link", { name: "تسجيل كلاعب" }).click();
    await expect(page).toHaveURL(/\/register$/);
  });
});
