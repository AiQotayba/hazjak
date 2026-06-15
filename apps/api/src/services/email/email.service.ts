import nodemailer from "nodemailer";
import { env } from "@hazjak/config";

const transporter = env.smtpHost && env.smtpUser ? nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: { user: env.smtpUser, pass: env.smtpPass },
  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 30_000,
})
  : null;

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  console.log("SENDING EMAIL", input);
  if (!transporter) {
    return { delivered: false, logged: true };
  }

  await transporter.sendMail({
    from: env.smtpFrom,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
  console.log("EMAIL SENT");
  return { delivered: true, logged: false };
}