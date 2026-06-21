/** حسابات seed — apps/api/prisma/seed.ts */
export const TEST_PASSWORD = "Password123!" as const;

export const TEST_USER = {
  phone: "963599000002",
  password: TEST_PASSWORD,
  firstName: "محمد",
} as const;

export const TEST_OWNER = {
  phone: "963599000001",
  password: TEST_PASSWORD,
  firstName: "أحمد",
} as const;

/** رقم هاتف فريد لاختبارات التسجيل (صيغة سورية 96359xxxxxxx) */
export function uniqueTestPhone() {
  const suffix = String(Math.floor(Math.random() * 9_000_000) + 1_000_000);
  return `96359${suffix}`;
}
