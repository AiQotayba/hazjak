import type { Page } from "@playwright/test";
import { passwordInput } from "./auth-forms";
import { TEST_USER } from "./test-users";

export async function loginAsUser(
  page: Page,
  credentials: { email: string; password: string } = TEST_USER,
) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(credentials.email);
  await passwordInput(page).fill(credentials.password);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await page.waitForURL("**/user/bookings**");
}

export async function loginAsOwner(
  page: Page,
  credentials: { email: string; password: string },
) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(credentials.email);
  await passwordInput(page).fill(credentials.password);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await page.waitForURL("**/owner**");
}
