import { test, expect } from "@playwright/test";
import { fillPhone, fillRegisterForm, newPasswordInput, passwordInput } from "../helpers/auth-forms";
import { fetchUserOtp } from "../helpers/otp";
import { TEST_PASSWORD, TEST_USER, uniqueTestPhone } from "../helpers/test-users";

test.describe("Auth — /reset-password", () => {
  test("تعرض النموذج مع الرقم من query string", async ({ page }) => {
    await page.goto(`/reset-password?phone=${encodeURIComponent(TEST_USER.phone)}`);

    await expect(page.getByRole("heading", { name: "إعادة تعيين كلمة المرور" })).toBeVisible();
    await expect(page.getByLabel("رقم الهاتف")).toHaveValue(/599000002/);
    await expect(page.getByLabel("رمز التحقق")).toBeVisible();
    await expect(newPasswordInput(page)).toBeVisible();
  });

  test("رمز خاطئ يعرض خطأ", async ({ page }) => {
    await page.goto(`/reset-password?phone=${encodeURIComponent(TEST_USER.phone)}`);

    await page.getByLabel("رمز التحقق").fill("000000");
    await newPasswordInput(page).fill("NewPassword123!");
    await page.getByRole("button", { name: "حفظ كلمة المرور" }).click();

    await expect(page.getByText("رمز التحقق غير صحيح")).toBeVisible({ timeout: 15_000 });
  });

  test("إعادة تعيين كلمة المرور بنجاح", async ({ page, request }) => {
    const phone = uniqueTestPhone();
    const newPassword = "ResetPass123!";

    await page.goto("/register");
    await fillRegisterForm(page, {
      firstName: "مستخدم",
      lastName: "إعادة",
      phone,
      password: TEST_PASSWORD,
    });
    await page.getByRole("button", { name: "تسجيل" }).click();
    await expect(page).toHaveURL(/\/verify-email/, { timeout: 15_000 });

    const verifyOtp = await fetchUserOtp(phone);
    await page.getByLabel("رمز التحقق").fill(verifyOtp);
    await page.getByRole("button", { name: "تحقق" }).click();
    await expect(page).toHaveURL(/\/user\/bookings/, { timeout: 15_000 });

    const forgotRes = await request.post("http://localhost:4000/api/v1/auth/forgot-password", {
      data: { phone },
    });
    expect(forgotRes.ok()).toBeTruthy();

    const resetOtp = await fetchUserOtp(phone);
    await page.goto(`/reset-password?phone=${encodeURIComponent(phone)}`);
    await page.getByLabel("رمز التحقق").fill(resetOtp);
    await newPasswordInput(page).fill(newPassword);
    await page.getByRole("button", { name: "حفظ كلمة المرور" }).click();

    await expect(
      page.getByText("تم تحديث كلمة المرور — جاري تحويلك لتسجيل الدخول..."),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

    await fillPhone(page, phone);
    await passwordInput(page).fill(newPassword);
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();
    await expect(page).toHaveURL(/\/user\/bookings/, { timeout: 15_000 });
  });

  test("رابط إعادة إرسال الرمز", async ({ page }) => {
    await page.goto("/reset-password");
    await page.getByRole("link", { name: "إعادة الإرسال" }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});
