import type { Page } from "@playwright/test";

export function passwordInput(page: Page) {
  return page.getByRole("textbox", { name: "كلمة المرور" });
}

export function newPasswordInput(page: Page) {
  return page.getByRole("textbox", { name: "كلمة المرور الجديدة" });
}

export async function fillPhone(page: Page, phone: string, label = "رقم الهاتف") {
  const input = page.getByLabel(label);
  await input.click();
  await input.fill(`+${phone.replace(/^\+/, "")}`);
}

export async function fillRegisterForm(
  page: Page,
  data: {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
  },
) {
  await page.getByLabel("الاسم الأول").fill(data.firstName);
  await page.getByLabel("اسم العائلة").fill(data.lastName);
  await fillPhone(page, data.phone, "رقم الهاتف (واتساب)");
  await passwordInput(page).fill(data.password);
}
