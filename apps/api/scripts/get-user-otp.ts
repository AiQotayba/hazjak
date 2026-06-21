import { createPrismaClient } from "../src/db/create-prisma-client";
import { normalizePhone } from "@hazjak/utils";

const prisma = createPrismaClient();

async function main() {
  const rawPhone = process.argv[2];
  if (!rawPhone) {
    console.error("Usage: tsx scripts/get-user-otp.ts <phone>");
    process.exit(1);
  }

  const phone = normalizePhone(rawPhone);
  const user = await prisma.user.findUnique({
    where: { phone },
    select: { otpCode: true, otpExpiresAt: true },
  });

  if (!user?.otpCode) {
    console.error("No OTP found for this phone");
    process.exit(1);
  }

  if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
    console.error("OTP expired");
    process.exit(1);
  }

  console.log(user.otpCode);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
