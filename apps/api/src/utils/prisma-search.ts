/** Case-insensitive `contains` — `mode` is PostgreSQL-only; MySQL ignores it. */
export function icontains(value: string): { contains: string; mode?: "insensitive" } {
  const filter = { contains: value } as { contains: string; mode?: "insensitive" };
  if (isPostgresDatabase()) filter.mode = "insensitive";
  return filter;
}

function isPostgresDatabase() {
  const provider = process.env.DATABASE_PROVIDER?.toLowerCase();
  if (provider === "postgresql" || provider === "postgres") return true;
  if (provider === "mysql") return false;

  const url = process.env.DATABASE_URL ?? "";
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}
