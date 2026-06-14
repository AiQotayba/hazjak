/** حسابات seed — apps/api/prisma/seed.ts */
export const TEST_PASSWORD = "Password123!" as const;

export const TEST_USER = {
  email: "user@hazjak.sy",
  password: TEST_PASSWORD,
  firstName: "محمد",
} as const;

export const TEST_OWNER = {
  email: "owner@hazjak.sy",
  password: TEST_PASSWORD,
  firstName: "أحمد",
} as const;

export function uniqueTestEmail(prefix = "e2e") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.hazjak.sy`;
}
