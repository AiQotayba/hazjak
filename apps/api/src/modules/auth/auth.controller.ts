import type { Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../db";
import { omitPassword, normalizePhone } from "@hazjak/utils";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "@hazjak/validation";
import type { AuthRequest } from "../../middlewares/auth";
import { signAccessToken, signRefreshToken, signVerificationToken } from "../../utils/jwt";
import { sendError, sendSuccess } from "../../utils/response";
import { sendWhatsAppMessageAsync } from "../../services/whatsapp/whatsapp.service";
import { otpWhatsAppMessage } from "../../services/whatsapp/messages";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function issueSession(user: { id: string; phone: string; role: string }) {
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

async function findUserByPhone(rawPhone: string) {
  const phone = normalizePhone(rawPhone);
  return prisma.user.findUnique({ where: { phone } });
}

function sendOtp(phone: string, otp: string, purpose: "verify" | "reset") {
  sendWhatsAppMessageAsync(phone, otpWhatsAppMessage(otp, purpose));
}

export async function register(req: AuthRequest, res: Response) {
  const body = registerSchema.parse(req.body);
  const phone = normalizePhone(body.phone);
  const exists = await prisma.user.findUnique({ where: { phone } });
  if (exists) return sendError(res, "رقم الهاتف مستخدم مسبقاً", 409);

  const { role, phone: _p, ...profile } = body;
  const otp = generateOtp();
  const hashed = await bcrypt.hash(profile.password, 12);
  const user = await prisma.user.create({
    data: {
      ...profile,
      phone,
      password: hashed,
      role: role === "STADIUM_OWNER" ? "STADIUM_OWNER" : "USER",
      otpCode: otp,
      otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  sendOtp(phone, otp, "verify");
  const safe = omitPassword(user);
  const verificationToken = signVerificationToken(user.id, user.phone);
  return sendSuccess(
    res,
    { verificationToken, user: safe, otpSent: true },
    "تم التسجيل — تحقق من واتساب",
    201
  );
}

export async function login(req: AuthRequest, res: Response) {
  const { phone: rawPhone, password } = loginSchema.parse(req.body);
  const phone = normalizePhone(rawPhone);
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || user.isBanned) {
    return sendError(res, "بيانات الدخول غير صحيحة", 401);
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return sendError(res, "بيانات الدخول غير صحيحة", 401);

  if (!user.isPhoneVerified) {
    const otp = generateOtp();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    sendOtp(user.phone, otp, "verify");

    const safe = omitPassword(user);
    return sendError(res, "يجب التحقق من رقم هاتفك أولاً", 403, {
      code: "PHONE_NOT_VERIFIED",
      data: {
        verificationToken: signVerificationToken(user.id, user.phone),
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
  const { phone: rawPhone, otp } = verifyOtpSchema.parse(req.body);
  const user = await findUserByPhone(rawPhone);
  if (!user || user.otpCode !== otp) {
    return sendError(res, "رمز التحقق غير صحيح", 400);
  }
  if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
    return sendError(res, "انتهت صلاحية الرمز", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isPhoneVerified: true, otpCode: null, otpExpiresAt: null },
  });

  const session = await issueSession(user);
  res.cookie("accessToken", session.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, session, "تم التحقق من رقم الهاتف");
}

export async function resetPassword(req: AuthRequest, res: Response) {
  const { phone: rawPhone, otp, password } = resetPasswordSchema.parse(req.body);
  const user = await findUserByPhone(rawPhone);
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
  const { phone: rawPhone } = forgotPasswordSchema.parse(req.body);
  const user = await findUserByPhone(rawPhone);
  if (user) {
    const otp = generateOtp();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    sendOtp(user.phone, otp, "reset");
  }
  return sendSuccess(res, null, "إذا كان الرقم مسجلاً، ستصلك رسالة واتساب قريباً");
}

export async function logout(req: AuthRequest, res: Response) {
  res.clearCookie("accessToken");
  return sendSuccess(res, null, "تم تسجيل الخروج");
}
