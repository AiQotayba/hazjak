function normalizeOrigin(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function parseOrigins(...sources: (string | undefined)[]) {
  const origins = new Set<string>();

  for (const source of sources) {
    if (!source) continue;
    for (const part of source.split(",")) {
      const origin = normalizeOrigin(part);
      if (origin) origins.add(origin);
    }
  }

  return [...origins];
}

function withLocalhostAliases(origins: string[]) {
  const expanded = new Set(origins);

  for (const origin of origins) {
    if (origin.includes("://localhost")) {
      expanded.add(origin.replace("://localhost", "://127.0.0.1"));
    }
    if (origin.includes("://127.0.0.1")) {
      expanded.add(origin.replace("://127.0.0.1", "://localhost"));
    }
  }

  return [...expanded];
}

const defaultWebUrl = "http://localhost:3000";
const defaultAdminUrl = "http://localhost:3001";
const webUrl = process.env.WEB_URL ?? defaultWebUrl;
const adminUrl = process.env.ADMIN_URL ?? defaultAdminUrl;
const nodeEnv = process.env.NODE_ENV ?? "development";

const corsOrigins = withLocalhostAliases(
  parseOrigins(process.env.CORS_ORIGIN, process.env.CORS_ALLOWED_ORIGINS, webUrl, adminUrl),
);

if (corsOrigins.length === 0) {
  corsOrigins.push(defaultWebUrl, defaultAdminUrl);
}

export function isCorsOriginAllowed(origin: string) {
  const normalized = normalizeOrigin(origin);
  if (corsOrigins.includes(normalized)) return true;

  try {
    const { hostname, protocol } = new URL(normalized);
    if (protocol === "https:" && hostname.endsWith(".vercel.app")) return true;
  } catch {
    return false;
  }

  return false;
}

export const env = {
  nodeEnv,
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "hazjak-dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  refreshSecret: process.env.REFRESH_SECRET ?? "hazjak-refresh-secret",
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN ?? "30d",
  corsOrigin: corsOrigins[0] ?? defaultWebUrl,
  corsOrigins,
  apiPort: Number(process.env.API_PORT ?? 4000),
  webUrl,
  adminUrl,
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
