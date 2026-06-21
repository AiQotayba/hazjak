import { test, expect } from "@playwright/test";
import { fillRegisterForm } from "../helpers/auth-forms";
import { TEST_PASSWORD, TEST_USER, uniqueTestPhone } from "../helpers/test-users";

test.describe("Auth — /register", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("تعرض نموذج تسجيل اللاعب", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "إنشاء حساب" })).toBeVisible();
    await expect(page.getByLabel("الاسم الأول")).toBeVisible();
    await expect(page.getByLabel("اسم العائلة")).toBeVisible();
    await expect(page.getByRole("button", { name: "تسجيل" })).toBeVisible();
  });

  test("التحقق من الحقول المطلوبة", async ({ page }) => {
    await page.getByRole("button", { name: "تسجيل" }).click();

    await expect(page.getByText("الاسم الأول مطلوب")).toBeVisible();
    await expect(page.getByText("اسم العائلة مطلوب")).toBeVisible();
    await expect(page.getByText("رقم الهاتف مطلوب")).toBeVisible();
  });

  test("رقم مستخدم مسبقاً يعرض خطأ", async ({ page }) => {
    await fillRegisterForm(page, {
      firstName: "اختبار",
      lastName: "مستخدم",
      phone: TEST_USER.phone,
      password: TEST_PASSWORD,
    });
    await page.getByRole("button", { name: "تسجيل" }).click();

    await expect(page.getByText("رقم الهاتف مستخدم مسبقاً")).toBeVisible();
  });

  test("تسجيل ناجح ينقل لصفحة التحقق", async ({ page }) => {
    const phone = uniqueTestPhone();

    await fillRegisterForm(page, {
      firstName: "لاعب",
      lastName: "اختبار",
      phone,
      password: TEST_PASSWORD,
    });
    await page.getByRole("button", { name: "تسجيل" }).click();

    await expect(page).toHaveURL(/\/verify-email/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "تحقق من واتساب" })).toBeVisible();
    await expect(page.getByText(/\+963/)).toBeVisible();
  });

  test("روابط الدخول وتسجيل صاحب الملعب", async ({ page }) => {
    await page.getByRole("link", { name: "دخول" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/register");
    await page.getByRole("link", { name: "سجّل ملعبك" }).click();
    await expect(page).toHaveURL(/\/register\/owner/);
  });
});
