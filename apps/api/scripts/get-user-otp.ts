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
    select: {
      otpCode: true,
      otpExpiresAt: true,
      isPhoneVerified: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!user) {
    console.error(`No user with phone ${phone}`);
    console.error("Register first or check the number (normalized without +).");
    process.exit(1);
  }

  if (!user.otpCode) {
    if (user.isPhoneVerified) {
      console.error(
        `User ${user.firstName} ${user.lastName} is already phone-verified — login does not send OTP.`,
      );
      console.error("To test OTP: register a new number, use forgot-password, or login before verify.");
    } else {
      console.error(
        `No pending OTP for ${phone}. Trigger one: register, login (unverified), or forgot-password.`,
      );
    }
    process.exit(1);
  }

  if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
    console.error("OTP expired — request a new code from the app.");
    process.exit(1);
  }

  console.log(user.otpCode);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
