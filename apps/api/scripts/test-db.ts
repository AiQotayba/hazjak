import { PrismaClient } from "@prisma/client";

const candidates = [
  process.env.DATABASE_URL,
  "postgresql://beeplay:beeplay@localhost:5433/beeplay",
  "postgresql://beeplay:beeplay@localhost:5432/beeplay",
].filter(Boolean) as string[];

const unique = [...new Set(candidates)];

function mask(url: string) {
  return url.replace(/:[^:@]+@/, ":****@");
}

async function tryUrl(url: string) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  if (unique.length === 0) {
    console.error("❌ DATABASE_URL غير معرّف في .env");
    process.exit(1);
  }

  console.log("جاري اختبار الاتصال...\n");

  for (const url of unique) {
    console.log(`  → ${mask(url)}`);
    if (await tryUrl(url)) {
      console.log("\n✅ الاتصال ناجح");
      if (url !== process.env.DATABASE_URL) {
        console.log("\nحدّث .env في جذر المشروع إلى:");
        console.log(`DATABASE_URL="${url}"`);
      }
      process.exit(0);
    }
    console.log("     ✗ فشل");
  }

  console.error(`
❌ لم ينجح أي اتصال.

الوضع الحالي:
  • PostgreSQL محلي يعمل غالباً على المنفذ 5432
  • Docker غير شغّال (المنفذ 5433 غير متاح)

الحل (PostgreSQL مثبت على Windows):
  1. شغّل (استبدل كلمة مرور postgres):
     $env:PGPASSWORD = "YOUR_POSTGRES_PASSWORD"
     .\\scripts\\ensure-beeplay-db.ps1

  2. ثم:
     pnpm db:push
     pnpm db:seed
     pnpm db:test

الحل (Docker):
  1. شغّل Docker Desktop
  2. docker compose up -d
  3. في .env:
     DATABASE_URL="postgresql://beeplay:beeplay@localhost:5433/beeplay"
  4. pnpm db:push && pnpm db:seed
`);
  process.exit(1);
}

main();
