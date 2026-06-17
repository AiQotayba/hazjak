#!/usr/bin/env node
/** SMTP probe — run: node scripts/smtp-probe.mjs [to]  (loads ../../.env via dotenv) */
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
config({ path: resolve(repoRoot, ".env") });

const host = process.env.SMTP_HOST?.trim();
const port = Number(process.env.SMTP_PORT ?? 587);
const user = process.env.SMTP_USER?.trim();
const pass = process.env.SMTP_PASS?.trim();
const from = process.env.SMTP_FROM?.trim() || user;
const to = process.argv[2]?.trim() || user;

console.info("── SMTP probe ──");
console.info(`host: ${host}:${port}`);
console.info(`from: ${from}`);
console.info(`to:   ${to}`);

if (!host || !user || !pass) {
  console.error("❌ SMTP_HOST / SMTP_USER / SMTP_PASS مطلوبة");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 30_000,
});

try {
  await transporter.verify();
  console.info("✅ verify OK");
} catch (error) {
  console.error("❌ verify failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}

try {
  const info = await transporter.sendMail({
    from,
    to,
    subject: "حجزك — اختبار SMTP",
    text: `اختبار بريد من السيرفر — ${new Date().toISOString()}`,
    html: `<p dir="rtl">اختبار بريد حجزك من السيرفر — ${new Date().toISOString()}</p>`,
  });
  console.info("✅ sent:", info.messageId);
} catch (error) {
  console.error("❌ send failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
