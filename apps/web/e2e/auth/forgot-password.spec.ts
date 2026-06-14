import { test, expect } from "@playwright/test";
import { TEST_USER } from "../helpers/test-users";

test.describe("Auth — /forgot-password", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/forgot-password");
  });

  test("تعرض نموذج استعادة كلمة المرور", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "استعادة كلمة المرور" })).toBeVisible();
    await expect(page.getByLabel("البريد الإلكتروني")).toBeVisible();
    await expect(page.getByRole("button", { name: "إرسال رمز التحقق" })).toBeVisible();
  });

  test("إرسال بريد مسجّل يعرض رسالة نجاح", async ({ page }) => {
    await page.getByLabel("البريد الإلكتروني").fill(TEST_USER.email);
    await page.getByRole("button", { name: "إرسال رمز التحقق" }).click();

    await expect(
      page.getByText("إذا كان البريد مسجلاً، ستصلك رسالة قريباً برمز التحقق"),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("link", { name: "إدخال الرمز وكلمة المرور" })).toBeVisible();
  });

  test("الانتقال لإعادة التعيين مع البريد في الرابط", async ({ page }) => {
    await page.getByLabel("البريد الإلكتروني").fill(TEST_USER.email);
    await page.getByRole("button", { name: "إرسال رمز التحقق" }).click();

    await page.getByRole("link", { name: "إدخال الرمز وكلمة المرور" }).click();
    await expect(page).toHaveURL(/\/reset-password/);
    await expect(page.getByLabel("البريد الإلكتروني")).toHaveValue(TEST_USER.email);
  });

  test("الحقول الفارغة تعرض أخطاء تحقق", async ({ page }) => {
    await page.getByRole("button", { name: "إرسال رمز التحقق" }).click();

    await expect(page.getByText("البريد الإلكتروني غير صالح")).toBeVisible();
  });

  test("رابط العودة لتسجيل الدخول", async ({ page }) => {
    await page.getByRole("link", { name: "العودة لتسجيل الدخول" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
