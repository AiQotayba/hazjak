import type { Page } from "@playwright/test";
import { fillPhone, passwordInput } from "./auth-forms";
import { TEST_USER } from "./test-users";

export async function loginAsUser(
  page: Page,
  credentials: { phone: string; password: string } = TEST_USER,
) {
  await page.goto("/login");
  await fillPhone(page, credentials.phone);
  await passwordInput(page).fill(credentials.password);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await page.waitForURL("**/user/bookings**");
}

export async function loginAsOwner(
  page: Page,
  credentials: { phone: string; password: string },
) {
  await page.goto("/login");
  await fillPhone(page, credentials.phone);
  await passwordInput(page).fill(credentials.password);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await page.waitForURL("**/owner**");
}
