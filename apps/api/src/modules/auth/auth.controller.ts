import type { Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../db";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "@beeplay/validation";
import { omitPassword } from "@beeplay/utils";
import type { AuthRequest } from "../../middlewares/auth";
import { signAccessToken, signRefreshToken } from "../../utils/jwt";
import { sendError, sendSuccess } from "../../utils/response";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

  // In production: send email with OTP
  console.log(`[OTP] ${user.email}: ${otp}`);

  const safe = omitPassword(user);
  const accessToken = signAccessToken(safe as never);
  return sendSuccess(
    res,
    { accessToken, user: safe, otpSent: true },
    "تم التسجيل. تحقق من بريدك الإلكتروني",
    201
  );
}

export async function login(req: AuthRequest, res: Response) {
  const { email, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.isBanned) {
    return sendError(res, "بيانات الدخول غير صحيحة", 401);
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return sendError(res, "بيانات الدخول غير صحيحة", 401);

  const safe = omitPassword(user);
  const accessToken = signAccessToken(safe as never);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, { accessToken, user: safe }, "تم تسجيل الدخول بنجاح");
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

  return sendSuccess(res, null, "تم التحقق من البريد الإلكتروني");
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
    console.log(`[Reset OTP] ${email}: ${otp}`);
  }
  return sendSuccess(res, null, "إذا كان البريد مسجلاً، ستصلك رسالة قريباً");
}

export async function logout(req: AuthRequest, res: Response) {
  res.clearCookie("accessToken");
  return sendSuccess(res, null, "تم تسجيل الخروج");
}
