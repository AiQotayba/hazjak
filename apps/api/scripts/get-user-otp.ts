import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createPrismaClient } from "../src/db/create-prisma-client";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
dotenv.config({ path: path.join(repoRoot, ".env"), override: true });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: tsx scripts/get-user-otp.ts <email>");
    process.exit(1);
  }

  const prisma = createPrismaClient();

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { otpCode: true },
    });

    if (!user?.otpCode) {
      process.exit(1);
    }

    process.stdout.write(user.otpCode);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => process.exit(1));
