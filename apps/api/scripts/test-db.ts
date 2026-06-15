import { createPrismaClient } from "../src/db/create-prisma-client";
import { parseMysqlUrl, resolveDatabaseProvider } from "../src/db/database-url";

function mask(url: string) {
  return url.replace(/:[^:@]+@/, ":****@");
}

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  const providerEnv = process.env.DATABASE_PROVIDER?.trim();

  console.log("── تشخيص قاعدة البيانات ──\n");

  if (!url) {
    console.error("❌ DATABASE_URL غير معرّف في .env (جذر المشروع)");
    process.exit(1);
  }

  const provider = resolveDatabaseProvider(url, providerEnv);

  console.log(`DATABASE_PROVIDER: ${providerEnv ?? "(غير معرّف — يُستنتج من الرابط)"}`);
  console.log(`المزوّد المستخدم:    ${provider}`);
  console.log(`DATABASE_URL:        ${mask(url)}`);

  if (provider === "mysql") {
    const cfg = parseMysqlUrl(url);
    console.log(`MySQL host:          ${cfg.host}:${cfg.port}`);
    console.log(`MySQL database:      ${cfg.database}`);
    console.log(`MySQL user:          ${cfg.user}`);
  }

  console.log("\nجاري الاتصال عبر Prisma...\n");

  const prisma = createPrismaClient(url);

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ SELECT 1 — ناجح");

    if (provider === "mysql") {
      const tables = await prisma.$queryRaw<Array<{ cnt: bigint }>>`
        SELECT COUNT(*) AS cnt
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
      `;
      const count = Number(tables[0]?.cnt ?? 0);
      console.log(`✅ جداول في قاعدة beeplay: ${count}`);

      if (count === 0) {
        console.log("\n⚠️  القاعدة فارغة — شغّل: pnpm run push && pnpm run seed");
      }
    } else {
      const users = await prisma.user.count();
      console.log(`✅ جدول User — ${users} مستخدم`);
    }

    console.log("\n✅ الاتصال سليم — المشكلة ليست في credentials أو الشبكة.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ فشل الاتصال:\n");
    if (error instanceof Error) {
      console.error(error.message);
      if (error.stack) {
        console.error("\n" + error.stack.split("\n").slice(0, 6).join("\n"));
      }
    } else {
      console.error(error);
    }

    console.error(`
── أين يحدث الخلل؟ ──

  .env (جذر المشروع)
    └─ DATABASE_URL / DATABASE_PROVIDER
         └─ src/db/database-url.ts     ← يحدد mysql أو postgresql
              └─ src/db/create-prisma-client.ts  ← mariadb أو pg adapter
                   └─ prisma.$queryRaw   ← هنا فشل الاختبار

── أخطاء شائعة على السيرفر ──

  • received invalid response: 4d
    → DATABASE_PROVIDER=mysql لكن الكود يستخدم pg (أو العكس)
    → تأكد: generate + build بعد تغيير .env

  • Cannot find module '.prisma/client'
    → شغّل: pnpm run generate

  • Access denied / ECONNREFUSED
    → تحقق من user/password ومن أن MySQL شغّال:
      systemctl status mysql
      mysql -u USER -p -h 127.0.0.1 beeplay -e "SELECT 1"

  • Table doesn't exist
    → شغّل: pnpm run push
`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
