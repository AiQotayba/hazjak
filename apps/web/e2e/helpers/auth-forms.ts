import type { Page } from "@playwright/test";

export function passwordInput(page: Page) {
  return page.getByRole("textbox", { name: "كلمة المرور" });
}

export function newPasswordInput(page: Page) {
  return page.getByRole("textbox", { name: "كلمة المرور الجديدة" });
}

export async function fillRegisterForm(
  page: Page,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  },
) {
  await page.getByLabel("الاسم الأول").fill(data.firstName);
  await page.getByLabel("اسم العائلة").fill(data.lastName);
  await page.getByLabel("البريد الإلكتروني").fill(data.email);
  if (data.phone) {
    await page.getByLabel("الهاتف (اختياري)").fill(data.phone);
  }
  await passwordInput(page).fill(data.password);
}
