import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "@hazjak/config";
import type { AuthUser } from "@hazjak/types";

export function signAccessToken(user: AuthUser): string {
  return jwt.sign(
    { sub: user.id, phone: user.phone, role: user.role, purpose: "access" },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] }
  );
}

export function signVerificationToken(userId: string, phone: string): string {
  return jwt.sign(
    { sub: userId, phone, purpose: "phone_verification" },
    env.jwtSecret,
    { expiresIn: "15m" }
  );
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.refreshSecret, {
    expiresIn: env.refreshExpiresIn as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as {
    sub: string;
    phone: string;
    role?: string;
    purpose?: string;
  };
}
