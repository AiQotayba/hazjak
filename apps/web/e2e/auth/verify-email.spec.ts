import { test, expect } from "@playwright/test";
import { fillRegisterForm } from "../helpers/auth-forms";
import { fetchUserOtp } from "../helpers/otp";
import { TEST_PASSWORD, uniqueTestEmail } from "../helpers/test-users";

test.describe("Auth — /verify-email", () => {
  test("زيارة مباشرة تعرض البريد ورمز التحقق", async ({ page }) => {
    await page.goto("/verify-email");

    await expect(page.getByRole("heading", { name: "تحقق من بريدك" })).toBeVisible();
    await expect(page.getByLabel("البريد الإلكتروني")).toBeVisible();
    await expect(page.getByLabel("رمز التحقق")).toBeVisible();
    await expect(page.getByRole("link", { name: "تسجيل الدخول" })).toBeVisible();
  });

  test("رمز خاطئ يعرض خطأ", async ({ page }) => {
    const email = uniqueTestEmail("verify-fail");

    await page.goto("/register");
    await fillRegisterForm(page, {
      firstName: "اختبار",
      lastName: "تحقق",
      email,
      password: TEST_PASSWORD,
    });
    await page.getByRole("button", { name: "تسجيل" }).click();
    await expect(page).toHaveURL(/\/verify-email/, { timeout: 15_000 });

    await page.getByLabel("رمز التحقق").fill("000000");
    await page.getByRole("button", { name: "تحقق" }).click();

    await expect(page.getByText("رمز التحقق غير صحيح")).toBeVisible({ timeout: 15_000 });
  });

  test("تحقق ناجح للاعب ينقل للحجوزات", async ({ page }) => {
    const email = uniqueTestEmail("verify-player");

    await page.goto("/register");
    await fillRegisterForm(page, {
      firstName: "لاعب",
      lastName: "جديد",
      email,
      password: TEST_PASSWORD,
    });
    await page.getByRole("button", { name: "تسجيل" }).click();
    await expect(page).toHaveURL(/\/verify-email/, { timeout: 15_000 });

    const otp = await fetchUserOtp(email);
    await page.getByLabel("رمز التحقق").fill(otp);
    await page.getByRole("button", { name: "تحقق" }).click();

    await expect(page.getByText("تم التحقق بنجاح — جاري التحويل...")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/user\/bookings/, { timeout: 15_000 });
  });

  test("تحقق ناجح لصاحب ملعب ينقل لإضافة ملعب", async ({ page }) => {
    const email = uniqueTestEmail("verify-owner");

    await page.goto("/register/owner");
    await fillRegisterForm(page, {
      firstName: "مالك",
      lastName: "جديد",
      email,
      password: TEST_PASSWORD,
    });
    await page.getByRole("button", { name: "متابعة التسجيل" }).click();
    await expect(page).toHaveURL(/\/verify-email/, { timeout: 15_000 });

    const otp = await fetchUserOtp(email);
    await page.getByLabel("رمز التحقق").fill(otp);
    await page.getByRole("button", { name: "تحقق" }).click();

    await expect(page).toHaveURL(/\/owner\/stadium\/new/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "تسجيل ملعب جديد" })).toBeVisible({
      timeout: 15_000,
    });
  });
});
