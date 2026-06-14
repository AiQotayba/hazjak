import { test, expect } from "@playwright/test";
import { fillRegisterForm } from "../helpers/auth-forms";
import { TEST_PASSWORD, uniqueTestEmail } from "../helpers/test-users";

test.describe("Auth — /register/owner", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register/owner");
  });

  test("تعرض نموذج تسجيل صاحب الملعب", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "سجّل كصاحب ملعب" })).toBeVisible();
    await expect(page.getByRole("button", { name: "متابعة التسجيل" })).toBeVisible();
  });

  test("تسجيل ناجح ينقل لصفحة التحقق", async ({ page }) => {
    const email = uniqueTestEmail("owner");

    await fillRegisterForm(page, {
      firstName: "مالك",
      lastName: "ملعب",
      email,
      password: TEST_PASSWORD,
      phone: "+970599000099",
    });
    await page.getByRole("button", { name: "متابعة التسجيل" }).click();

    await expect(page).toHaveURL(/\/verify-email/, { timeout: 15_000 });
    await expect(page.getByText(email)).toBeVisible();
  });

  test("روابط الدخول وتسجيل اللاعب", async ({ page }) => {
    await page.getByRole("link", { name: "دخول" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/register/owner");
    await page.getByRole("link", { name: "تسجيل كلاعب" }).click();
    await expect(page).toHaveURL(/\/register$/);
  });
});
