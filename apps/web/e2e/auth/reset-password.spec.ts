import { test, expect } from "@playwright/test";
import { fillRegisterForm, newPasswordInput } from "../helpers/auth-forms";
import { fetchUserOtp } from "../helpers/otp";
import { TEST_PASSWORD, TEST_USER, uniqueTestEmail } from "../helpers/test-users";

test.describe("Auth — /reset-password", () => {
  test("تعرض النموذج مع البريد من query string", async ({ page }) => {
    await page.goto(`/reset-password?email=${encodeURIComponent(TEST_USER.email)}`);

    await expect(page.getByRole("heading", { name: "إعادة تعيين كلمة المرور" })).toBeVisible();
    await expect(page.getByLabel("البريد الإلكتروني")).toHaveValue(TEST_USER.email);
    await expect(page.getByLabel("رمز التحقق")).toBeVisible();
    await expect(newPasswordInput(page)).toBeVisible();
  });

  test("رمز خاطئ يعرض خطأ", async ({ page }) => {
    await page.goto(`/reset-password?email=${encodeURIComponent(TEST_USER.email)}`);

    await page.getByLabel("رمز التحقق").fill("000000");
    await newPasswordInput(page).fill("NewPassword123!");
    await page.getByRole("button", { name: "حفظ كلمة المرور" }).click();

    await expect(page.getByText("رمز التحقق غير صحيح")).toBeVisible({ timeout: 15_000 });
  });

  test("إعادة تعيين كلمة المرور بنجاح", async ({ page, request }) => {
    const email = uniqueTestEmail("reset");
    const newPassword = "ResetPass123!";

    await page.goto("/register");
    await fillRegisterForm(page, {
      firstName: "مستخدم",
      lastName: "إعادة",
      email,
      password: TEST_PASSWORD,
    });
    await page.getByRole("button", { name: "تسجيل" }).click();
    await expect(page).toHaveURL(/\/verify-email/, { timeout: 15_000 });

    const verifyOtp = await fetchUserOtp(email);
    await page.getByLabel("رمز التحقق").fill(verifyOtp);
    await page.getByRole("button", { name: "تحقق" }).click();
    await expect(page).toHaveURL(/\/user\/bookings/, { timeout: 15_000 });

    const forgotRes = await request.post("http://localhost:4000/api/v1/auth/forgot-password", {
      data: { email },
    });
    expect(forgotRes.ok()).toBeTruthy();

    const resetOtp = await fetchUserOtp(email);
    await page.goto(`/reset-password?email=${encodeURIComponent(email)}`);
    await page.getByLabel("رمز التحقق").fill(resetOtp);
    await newPasswordInput(page).fill(newPassword);
    await page.getByRole("button", { name: "حفظ كلمة المرور" }).click();

    await expect(
      page.getByText("تم تحديث كلمة المرور — جاري تحويلك لتسجيل الدخول..."),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

    await page.getByLabel("البريد الإلكتروني").fill(email);
    await page.getByRole("textbox", { name: "كلمة المرور" }).fill(newPassword);
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();
    await expect(page).toHaveURL(/\/user\/bookings/, { timeout: 15_000 });
  });

  test("رابط إعادة إرسال الرمز", async ({ page }) => {
    await page.goto("/reset-password");
    await page.getByRole("link", { name: "إعادة الإرسال" }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});
