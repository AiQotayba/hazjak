import path from "node:path";
import dotenv from "dotenv";
import { createPrismaClient } from "../../../api/src/db/create-prisma-client";

const rootDir = path.join(__dirname, "../../../..");
dotenv.config({ path: path.join(rootDir, ".env"), override: true });

async function readOtp(email: string): Promise<string | null> {
  const prisma = createPrismaClient();
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { otpCode: true },
    });
    const otp = user?.otpCode?.trim();
    return otp && /^\d{6}$/.test(otp) ? otp : null;
  } finally {
    await prisma.$disconnect();
  }
}

/** يقرأ otpCode من قاعدة البيانات (بعد register / forgot-password) */
export async function fetchUserOtp(email: string): Promise<string> {
  for (let attempt = 0; attempt < 15; attempt++) {
    const otp = await readOtp(email);
    if (otp) return otp;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(`لم يُعثر على رمز OTP صالح للبريد: ${email}`);
}
