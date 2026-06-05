import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "@beeplay/config";
import type { AuthUser } from "@beeplay/types";

export function signAccessToken(user: AuthUser): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] }
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
    email: string;
    role: string;
  };
}
