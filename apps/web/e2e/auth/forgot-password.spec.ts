import { test, expect } from "@playwright/test";
import { fillPhone } from "../helpers/auth-forms";
import { TEST_USER } from "../helpers/test-users";

test.describe("Auth — /forgot-password", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/forgot-password");
  });

  test("تعرض نموذج استعادة كلمة المرور", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "استعادة كلمة المرور" })).toBeVisible();
    await expect(page.getByLabel("رقم الهاتف")).toBeVisible();
    await expect(page.getByRole("button", { name: "إرسال رمز التحقق" })).toBeVisible();
  });

  test("إرسال رقم مسجّل يعرض رسالة نجاح", async ({ page }) => {
    await fillPhone(page, TEST_USER.phone);
    await page.getByRole("button", { name: "إرسال رمز التحقق" }).click();

    await expect(
      page.getByText("إذا كان الرقم مسجلاً، ستصلك رسالة واتساب برمز التحقق"),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("link", { name: "إدخال الرمز وكلمة المرور" })).toBeVisible();
  });

  test("الانتقال لإعادة التعيين مع الرقم في الرابط", async ({ page }) => {
    await fillPhone(page, TEST_USER.phone);
    await page.getByRole("button", { name: "إرسال رمز التحقق" }).click();

    await page.getByRole("link", { name: "إدخال الرمز وكلمة المرور" }).click();
    await expect(page).toHaveURL(/\/reset-password/);
    await expect(page.getByLabel("رقم الهاتف")).toHaveValue(/599000002/);
  });

  test("الحقول الفارغة تعرض أخطاء تحقق", async ({ page }) => {
    await page.getByRole("button", { name: "إرسال رمز التحقق" }).click();

    await expect(page.getByText("رقم الهاتف مطلوب")).toBeVisible();
  });

  test("رابط العودة لتسجيل الدخول", async ({ page }) => {
    await page.getByRole("link", { name: "العودة لتسجيل الدخول" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
