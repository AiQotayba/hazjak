import path from "node:path";
import dotenv from "dotenv";
import { createPrismaClient } from "../src/db/create-prisma-client";

const repoRoot = path.join(__dirname, "../../..");
dotenv.config({ path: path.join(repoRoot, ".env"), override: true });

const prisma = createPrismaClient();
const provider = (process.env.DATABASE_PROVIDER ?? "mysql").toLowerCase();
const isMysql = provider === "mysql";
const table = "User";

function qTable() {
  return isMysql ? `\`${table}\`` : `"${table}"`;
}

async function columnExists(column: string): Promise<boolean> {
  if (isMysql) {
    const rows = await prisma.$queryRawUnsafe<{ cnt: bigint | number }[]>(
      `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      table,
      column,
    );
    return Number(rows[0]?.cnt ?? 0) > 0;
  }

  const rows = await prisma.$queryRawUnsafe<{ cnt: bigint | number }[]>(
    `SELECT COUNT(*) AS cnt FROM information_schema.columns
     WHERE table_schema = current_schema() AND lower(table_name) = lower($1) AND column_name = $2`,
    table,
    column,
  );
  return Number(rows[0]?.cnt ?? 0) > 0;
}

function phoneFromId(id: string, salt: number): string {
  const digits = id.replace(/\D/g, "");
  const n = (parseInt(digits.slice(0, 12), 16) + salt) % 9_000_000;
  return `96359${String(n + 1_000_000).padStart(7, "0")}`;
}

async function phoneTaken(phone: string, excludeId: string): Promise<boolean> {
  const q = qTable();
  if (isMysql) {
    const rows = await prisma.$queryRawUnsafe<{ cnt: bigint | number }[]>(
      `SELECT COUNT(*) AS cnt FROM ${q} WHERE phone = ? AND id <> ?`,
      phone,
      excludeId,
    );
    return Number(rows[0]?.cnt ?? 0) > 0;
  }

  const rows = await prisma.$queryRawUnsafe<{ cnt: bigint | number }[]>(
    `SELECT COUNT(*) AS cnt FROM ${q} WHERE phone = $1 AND id <> $2`,
    phone,
    excludeId,
  );
  return Number(rows[0]?.cnt ?? 0) > 0;
}

async function main() {
  if (!(await columnExists("phone"))) {
    console.info("[backfill-phone] column phone not found — skip (schema will add it)");
    return;
  }

  const hasEmail = await columnExists("email");
  const q = qTable();
  const selectEmail = hasEmail ? "email" : "NULL AS email";

  const orphans = await prisma.$queryRawUnsafe<
    { id: string; email: string | null }[]
  >(`SELECT id, ${selectEmail} FROM ${q} WHERE phone IS NULL OR phone = ''`);

  if (orphans.length === 0) {
    console.info("[backfill-phone] all users already have phone");
  } else {
    console.info(`[backfill-phone] assigning phone to ${orphans.length} user(s)`);
    for (let i = 0; i < orphans.length; i++) {
      const row = orphans[i];
      let phone = phoneFromId(row.id, i);
      for (let attempt = 0; attempt < 20 && (await phoneTaken(phone, row.id)); attempt++) {
        phone = phoneFromId(row.id, i + attempt + 1);
      }

      if (isMysql) {
        await prisma.$executeRawUnsafe(
          `UPDATE ${q} SET phone = ? WHERE id = ?`,
          phone,
          row.id,
        );
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE ${q} SET phone = $1 WHERE id = $2`,
          phone,
          row.id,
        );
      }

      const label = row.email ? row.email : row.id;
      console.info(`[backfill-phone] ${label} → ${phone}`);
    }
  }

  const hasEmailVerified = await columnExists("isEmailVerified");
  const hasPhoneVerified = await columnExists("isPhoneVerified");

  if (hasEmailVerified && !hasPhoneVerified) {
    console.info("[backfill-phone] adding isPhoneVerified from isEmailVerified");
    if (isMysql) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE ${q} ADD COLUMN isPhoneVerified TINYINT(1) NOT NULL DEFAULT 0`,
      );
    } else {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE ${q} ADD COLUMN "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false`,
      );
    }
  }

  if (hasEmailVerified && (await columnExists("isPhoneVerified"))) {
    if (isMysql) {
      await prisma.$executeRawUnsafe(
        `UPDATE ${q} SET \`isPhoneVerified\` = \`isEmailVerified\``,
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE ${q} SET "isPhoneVerified" = "isEmailVerified"`,
      );
    }
    console.info("[backfill-phone] copied isEmailVerified → isPhoneVerified");
  }
}

main()
  .catch((err) => {
    console.error("[backfill-phone] failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
