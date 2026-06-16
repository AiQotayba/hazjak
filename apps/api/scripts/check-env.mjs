import { config } from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(apiRoot, "../..");
const envPath = resolve(repoRoot, ".env");

const REQUIRED = [
  "DATABASE_URL",
  "DATABASE_PROVIDER",
  "JWT_SECRET",
  "REFRESH_SECRET",
  "API_PORT",
];

const RECOMMENDED = [
  "CORS_ORIGIN",
  "CORS_ALLOWED_ORIGINS",
  "WEB_URL",
  "ADMIN_URL",
  "NODE_ENV",
  "TRUST_PROXY",
];

const OPTIONAL = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "API_PUBLIC_URL"];

const SECRET_KEYS = new Set([
  "DATABASE_URL",
  "JWT_SECRET",
  "REFRESH_SECRET",
  "SMTP_PASS",
  "SMTP_USER",
]);

function mask(key, value) {
  if (!value) return "(فارغ)";
  if (SECRET_KEYS.has(key)) {
    if (key === "DATABASE_URL") return value.replace(/:([^:@]+)@/, ":****@");
    return "****";
  }
  return value.length > 80 ? `${value.slice(0, 77)}...` : value;
}

function parseEnvKeys(filePath) {
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  const keys = [];
  const duplicates = [];
  const seen = new Set();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
    if (!match) continue;
    const key = match[1];
    keys.push(key);
    if (seen.has(key)) duplicates.push(key);
    seen.add(key);
  }

  return { keys, duplicates };
}

function statusIcon(ok) {
  return ok ? "✅" : "❌";
}

function main() {
  console.info("── فحص متغيرات البيئة ──\n");

  const wrongPaths = [
    { label: "جذر المشروع (المطلوب)", path: envPath },
    { label: "apps/api/.env (اختياري — غير مستخدم من PM2)", path: resolve(apiRoot, ".env") },
    { label: "apps/web/.env (للواجهة فقط — Vercel)", path: resolve(repoRoot, "apps/web/.env") },
  ];

  console.info("مسارات الملفات:");
  for (const { label, path } of wrongPaths) {
    const exists = existsSync(path);
    console.info(`  ${exists ? "✅" : "○ "} ${label}`);
    console.info(`     ${path}`);
  }
  console.info();

  if (!existsSync(envPath)) {
    console.error(`❌ ملف .env غير موجود في جذر المشروع:\n   ${envPath}`);
    console.error("\nالـ API يقرأ من: node --env-file=../../.env (من apps/api)");
    process.exit(1);
  }

  const parsed = parseEnvKeys(envPath);
  if (parsed.duplicates.length > 0) {
    console.warn(`⚠️  مفاتيح مكررة في .env: ${[...new Set(parsed.duplicates)].join(", ")}`);
    console.warn("   (dotenv يأخذ أول قيمة فقط)\n");
  }

  config({ path: envPath, override: true });

  console.info(`مصدر التحميل: ${envPath}\n`);
  console.info("── مطلوب ──");
  let failed = false;
  for (const key of REQUIRED) {
    const value = process.env[key]?.trim() ?? "";
    const ok = value.length > 0;
    if (!ok) failed = true;
    console.info(`  ${statusIcon(ok)} ${key}: ${mask(key, value)}`);
  }

  console.info("\n── موصى به (إنتاج) ──");
  for (const key of RECOMMENDED) {
    const value = process.env[key]?.trim() ?? "";
    const ok = value.length > 0;
    console.info(`  ${statusIcon(ok)} ${key}: ${mask(key, value)}`);
  }

  console.info("\n── اختياري ──");
  for (const key of OPTIONAL) {
    const value = process.env[key]?.trim() ?? "";
    const ok = value.length > 0;
    console.info(`  ${ok ? "✅" : "○ "} ${key}: ${mask(key, value)}`);
  }

  const provider = process.env.DATABASE_PROVIDER?.trim().toLowerCase();
  const dbUrl = process.env.DATABASE_URL?.trim() ?? "";
  if (provider === "mysql" && !dbUrl.startsWith("mysql://")) {
    console.error("\n❌ DATABASE_PROVIDER=mysql لكن DATABASE_URL ليس mysql://");
    failed = true;
  }
  if (
    (provider === "postgresql" || provider === "postgres") &&
    !dbUrl.startsWith("postgresql://") &&
    !dbUrl.startsWith("postgres://")
  ) {
    console.error("\n❌ DATABASE_PROVIDER=postgresql لكن DATABASE_URL ليس postgresql://");
    failed = true;
  }

    console.info(`
── كيف يقرأ الـ API المتغيرات ──

  PM2 / production:
    cwd: apps/api
    command: node --env-file=../../.env dist/server.js
    → يقرأ: ${envPath}

  pnpm dev / db:test / prisma:
    → نفس الملف: ${envPath}

  Vercel (web):
    → متغيرات في لوحة Vercel (ليس .env على السيرفر)
`);

  if (failed) {
    console.error("❌ نقص متغيرات مطلوبة — راجع .env في جذر المشروع");
    process.exit(1);
  }

  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpFrom = process.env.SMTP_FROM?.trim();
  if (smtpUser && smtpFrom && smtpUser !== smtpFrom) {
    console.warn(
      "\n⚠️  SMTP_FROM يختلف عن SMTP_USER — Gmail قد يرفض الإرسال أو يضع الرسائل في Spam"
    );
    console.warn("   الأفضل: SMTP_FROM=" + smtpUser);
  }

  console.info("✅ المتغيرات المطلوبة موجودة في المكان الصحيح");
}

main();
