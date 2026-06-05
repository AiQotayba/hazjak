import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db";
import type { Role } from "@beeplay/types";
import { verifyAccessToken } from "../utils/jwt";
import { sendError } from "../utils/response";
import { omitPassword } from "@beeplay/utils";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ")
    ? header.slice(7)
    : req.cookies?.accessToken;

  if (!token) {
    return sendError(res, "يجب تسجيل الدخول", 401);
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.isBanned) {
      return sendError(res, "حساب غير صالح", 401);
    }
    req.user = omitPassword(user) as AuthRequest["user"];
    next();
  } catch {
    return sendError(res, "جلسة منتهية، سجّل دخولك مجدداً", 401);
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return sendError(res, "غير مصرح", 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, "ليس لديك صلاحية لهذا الإجراء", 403);
    }
    next();
  };
}
