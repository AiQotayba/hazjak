import { test, expect } from "@playwright/test";
import { fillPhone, passwordInput } from "../helpers/auth-forms";
import { TEST_OWNER, TEST_PASSWORD, TEST_USER } from "../helpers/test-users";

test.describe("Auth — /login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("تعرض نموذج تسجيل الدخول", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "مرحباً بعودتك" })).toBeVisible();
    await expect(page.getByLabel("رقم الهاتف")).toBeVisible();
    await expect(passwordInput(page)).toBeVisible();
    await expect(page.getByRole("button", { name: "تسجيل الدخول" })).toBeVisible();
  });

  test("تسجيل دخول مستخدم والانتقال للحجوزات", async ({ page }) => {
    await fillPhone(page, TEST_USER.phone);
    await passwordInput(page).fill(TEST_USER.password);
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    await expect(page).toHaveURL(/\/user\/bookings/, { timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: `أهلاً، ${TEST_USER.firstName}` }),
    ).toBeVisible();
  });

  test("تسجيل دخول صاحب ملعب والانتقال للوحة التحكم", async ({ page }) => {
    await fillPhone(page, TEST_OWNER.phone);
    await passwordInput(page).fill(TEST_OWNER.password);
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    await expect(page).toHaveURL(/\/owner/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "الإحصائيات" })).toBeVisible();
  });

  test("بيانات خاطئة تعرض رسالة خطأ", async ({ page }) => {
    await fillPhone(page, "963599999999");
    await passwordInput(page).fill("WrongPass123!");
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    await expect(page.getByText("بيانات الدخول غير صحيحة")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/login/);
  });

  test("التحقق من الحقول الفارغة", async ({ page }) => {
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();

    await expect(page.getByText("رقم الهاتف مطلوب")).toBeVisible();
    await expect(page.getByText("كلمة المرور مطلوبة")).toBeVisible();
  });

  test("روابط إنشاء حساب واستعادة كلمة المرور", async ({ page }) => {
    await page.locator('a[href="/register"]').click();
    await expect(page).toHaveURL(/\/register$/);

    await page.goto("/login");
    await page.locator('a[href="/forgot-password"]').click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});
