import type { Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../db";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "@hazjak/validation";
import { omitPassword } from "@hazjak/utils";
import type { AuthRequest } from "../../middlewares/auth";
import { signAccessToken, signRefreshToken, signVerificationToken } from "../../utils/jwt";
import { sendError, sendSuccess } from "../../utils/response";
import { sendEmail } from "../../services/email/email.service";
import {
  passwordResetOtpEmail,
  verificationOtpEmail,
} from "../../services/email/templates";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function issueSession(user: { id: string; email: string; role: string }) {
  const safe = omitPassword(
    await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
  );
  const accessToken = signAccessToken(safe as never);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken, user: safe };
}

async function sendOtpEmail(email: string, otp: string) {
  const tpl = verificationOtpEmail(otp);
  sendEmail({ to: email, ...tpl });
}

export async function register(req: AuthRequest, res: Response) {
  const body = registerSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) return sendError(res, "البريد الإلكتروني مستخدم مسبقاً", 409);

  const { role, ...profile } = body;
  const otp = generateOtp();
  const hashed = await bcrypt.hash(profile.password, 12);
  const user = await prisma.user.create({
    data: {
      ...profile,
      password: hashed,
      role: role === "STADIUM_OWNER" ? "STADIUM_OWNER" : "USER",
      otpCode: otp,
      otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });
  sendOtpEmail(user.email, otp);
  const safe = omitPassword(user);
  const verificationToken = signVerificationToken(user.id, user.email);
  return sendSuccess(
    res,
    { verificationToken, user: safe, otpSent: true },
    "تم التسجيل. تحقق من بريدك الإلكتروني",
    201
  );
}

export async function login(req: AuthRequest, res: Response) {
  const { email, password } = loginSchema.parse(req.body);
  console.log(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.isBanned) {
    return sendError(res, "بيانات الدخول غير صحيحة", 401);
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return sendError(res, "بيانات الدخول غير صحيحة", 401);

  console.log("USER", user);
  console.log("IS EMAIL VERIFIED", user.isEmailVerified);
  if (!user.isEmailVerified) {
    console.log("GENERATING OTP");
    const otp = generateOtp();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    sendOtpEmail(user.email, otp);

    const safe = omitPassword(user);
    return sendError(res, "يجب التحقق من بريدك الإلكتروني أولاً", 403, {
      code: "EMAIL_NOT_VERIFIED",
      data: {
        verificationToken: signVerificationToken(user.id, user.email),
        user: safe,
      },
    });
  }

  const session = await issueSession(user);
  res.cookie("accessToken", session.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, session, "تم تسجيل الدخول بنجاح");
}

export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return sendError(res, "المستخدم غير موجود", 404);
  return sendSuccess(res, omitPassword(user));
}

export async function verifyOtp(req: AuthRequest, res: Response) {
  const { email, otp } = verifyOtpSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.otpCode !== otp) {
    return sendError(res, "رمز التحقق غير صحيح", 400);
  }
  if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
    return sendError(res, "انتهت صلاحية الرمز", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, otpCode: null, otpExpiresAt: null },
  });

  const session = await issueSession(user);
  res.cookie("accessToken", session.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, session, "تم التحقق من البريد الإلكتروني");
}

export async function resetPassword(req: AuthRequest, res: Response) {
  const { email, otp, password } = resetPasswordSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.otpCode !== otp) {
    return sendError(res, "رمز التحقق غير صحيح", 400);
  }
  if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
    return sendError(res, "انتهت صلاحية الرمز", 400);
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, otpCode: null, otpExpiresAt: null },
  });

  return sendSuccess(res, null, "تم تحديث كلمة المرور");
}

export async function forgotPassword(req: AuthRequest, res: Response) {
  const { email } = forgotPasswordSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const otp = generateOtp();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    const tpl = passwordResetOtpEmail(otp);
    sendEmail({ to: email, ...tpl });
  }
  return sendSuccess(res, null, "إذا كان البريد مسجلاً، ستصلك رسالة قريباً");
}

export async function logout(req: AuthRequest, res: Response) {
  res.clearCookie("accessToken");
  return sendSuccess(res, null, "تم تسجيل الخروج");
}
