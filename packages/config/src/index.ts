export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "hazjak-dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  refreshSecret: process.env.REFRESH_SECRET ?? "hazjak-refresh-secret",
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN ?? "30d",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  apiPort: Number(process.env.API_PORT ?? 4000),
  webUrl: process.env.WEB_URL ?? "http://localhost:3000",
  adminUrl: process.env.ADMIN_URL ?? "http://localhost:3001",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  smtpFrom: process.env.SMTP_FROM ?? "noreply@hazjak.sy",
  trustProxy:
    process.env.TRUST_PROXY === "false" || process.env.TRUST_PROXY === "0"
      ? false
      : process.env.TRUST_PROXY
        ? Number(process.env.TRUST_PROXY) || 1
        : process.env.NODE_ENV === "production"
          ? 1
          : false,
};
