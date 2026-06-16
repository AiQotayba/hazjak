import nodemailer from "nodemailer";
import { env } from "@hazjak/config";
import { sendEmail } from "../src/services/email/email.service";
import {
  bookingConfirmedEmail,
  bookingRejectedEmail,
  depositRequestEmail,
  passwordResetOtpEmail,
  verificationOtpEmail,
} from "../src/services/email/templates";

const TEST_OTP = "482916";
const TEST_DATE = new Date(Date.now() + 24 * 60 * 60 * 1000);

type CheckResult = { name: string; ok: boolean; detail?: string };

function status(ok: boolean) {
  return ok ? "✅" : "❌";
}

function mask(value: string) {
  if (!value) return "(فارغ)";
  if (value.length <= 4) return "****";
  return `${value.slice(0, 2)}****${value.slice(-2)}`;
}

function checkEnv(): CheckResult[] {
  const checks: Array<{ name: string; key: keyof typeof env | "smtpPass"; required?: boolean }> = [
    { name: "SMTP_HOST", key: "smtpHost", required: true },
    { name: "SMTP_PORT", key: "smtpPort", required: true },
    { name: "SMTP_USER", key: "smtpUser", required: true },
    { name: "SMTP_PASS", key: "smtpPass", required: true },
    { name: "SMTP_FROM", key: "smtpFrom", required: true },
  ];

  return checks.map(({ name, key, required }) => {
    const raw =
      key === "smtpPass"
        ? process.env.SMTP_PASS?.trim() ?? ""
        : String(env[key as keyof typeof env] ?? "").trim();
    const ok = required ? raw.length > 0 : true;
    const detail =
      key === "smtpPass" || key === "smtpUser"
        ? mask(raw)
        : key === "smtpPort"
          ? String(env.smtpPort)
          : raw || "(فارغ)";
    return { name, ok: required ? ok : true, detail };
  });
}

function smtpTransport() {
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: env.smtpUser, pass: env.smtpPass },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`انتهت المهلة (${ms / 1000}ث) — ${label}`)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

async function verifySmtpConnection(): Promise<CheckResult> {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return {
      name: "اتصال SMTP (verify)",
      ok: false,
      detail: "متغيرات SMTP غير مكتملة — لن يُنشأ transporter",
    };
  }

  if (env.smtpFrom && env.smtpFrom.trim() !== env.smtpUser.trim()) {
    console.info(
      `  ⚠️  SMTP_FROM (${env.smtpFrom}) يختلف عن SMTP_USER (${env.smtpUser}) — Gmail قد يرفض الإرسال`
    );
  }

  const transporter = smtpTransport();

  try {
    console.info("  … جاري الاتصال بـ SMTP (حتى 20 ثانية)");
    await withTimeout(transporter.verify(), 20_000, "اتصال SMTP");
    return { name: "اتصال SMTP (verify)", ok: true, detail: `${env.smtpHost}:${env.smtpPort}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { name: "اتصال SMTP (verify)", ok: false, detail: message };
  } finally {
    transporter.close();
  }
}

async function sendTemplate(
  label: string,
  to: string,
  tpl: { subject: string; text: string; html: string }
): Promise<CheckResult> {
  try {
    const result = await sendEmail({ to, ...tpl });
    if (!result.delivered) {
      return {
        name: label,
        ok: false,
        detail: "sendEmail أعاد delivered:false — transporter غير مُعد",
      };
    }
    return { name: label, ok: true, detail: `→ ${to}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { name: label, ok: false, detail: message };
  }
}

async function main() {
  const quick = process.argv.includes("--quick");
  const to =
    process.argv.find((a) => a.includes("@"))?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "";

  console.info("── اختبار البريد الإلكتروني (Hazjak API) ──\n");

  const envChecks = checkEnv();
  console.info("── متغيرات SMTP ──");
  for (const c of envChecks) {
    console.info(`  ${status(c.ok)} ${c.name}: ${c.detail}`);
  }
  console.info();

  const envOk = envChecks.every((c) => c.ok);
  if (!envOk) {
    console.error("❌ أكمل SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM في .env");
    process.exit(1);
  }

  const verify = quick
    ? { name: "اتصال SMTP (verify)", ok: true, detail: "تخطي (--quick)" }
    : await verifySmtpConnection();
  console.info(`── ${verify.name} ──`);
  console.info(`  ${status(verify.ok)} ${verify.detail}`);
  console.info();

  if (!verify.ok) {
    console.error(`
── أخطاء شائعة ──

  • Invalid login / Username and Password not accepted (Gmail)
    → استخدم App Password وليس كلمة مرور الحساب
    → SMTP_USER يجب أن يطابق حساب Gmail المُفعَّل عليه 2FA

  • SMTP_FROM مختلف عن SMTP_USER (Gmail)
    → اجعل SMTP_FROM = نفس SMTP_USER أو alias مُصرَّح به

  • Connection timeout
    → تأكد أن المنفذ ${env.smtpPort} مفتوح على السيرفر (587 أو 465)
`);
    process.exit(1);
  }

  if (!to) {
    console.error("❌ حدّد بريد المستلم: pnpm email:test you@example.com");
    process.exit(1);
  }

  console.info(`── إرسال قوالب الاختبار إلى: ${to} ──\n`);

  const templates: Array<{ label: string; tpl: { subject: string; text: string; html: string } }> = [
    { label: "رمز التحقق (تسجيل)", tpl: verificationOtpEmail(TEST_OTP) },
    { label: "رمز إعادة كلمة المرور", tpl: passwordResetOtpEmail(TEST_OTP) },
    {
      label: "تأكيد الحجز",
      tpl: bookingConfirmedEmail({
        stadiumName: "ملعب الاختبار",
        startTime: TEST_DATE,
        endTime: new Date(TEST_DATE.getTime() + 90 * 60 * 1000),
        totalPrice: 75_000,
      }),
    },
    { label: "رفض الحجز", tpl: bookingRejectedEmail("ملعب الاختبار") },
    {
      label: "طلب دفع العربون",
      tpl: depositRequestEmail({
        stadiumName: "ملعب الاختبار",
        depositAmount: 25_000,
        referenceCode: "HZJ-TEST",
        shamCashId: "sham-cash-demo",
      }),
    },
  ];

  const results: CheckResult[] = [];
  for (const { label, tpl } of templates) {
    const result = await sendTemplate(label, to, tpl);
    results.push(result);
    console.info(`  ${status(result.ok)} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
  }

  console.info();
  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    console.error(`❌ فشل ${failed.length} من ${results.length} رسائل`);
    process.exit(1);
  }

  console.info(`✅ نجح الاختبار — ${results.length} رسائل أُرسلت. تحقق من صندوق الوارد (والـ Spam).`);
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ خطأ غير متوقع:", error);
  process.exit(1);
});
