import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

function assertPostgresUrl(connectionString: string) {
  if (
    connectionString.startsWith("mysql://") ||
    connectionString.startsWith("mysql2://")
  ) {
    throw new Error(
      "DATABASE_URL uses MySQL but Hazjak API requires PostgreSQL (postgresql://). " +
        "Update the server .env or migrate the beeplay database to PostgreSQL.",
    );
  }

  if (
    !connectionString.startsWith("postgresql://") &&
    !connectionString.startsWith("postgres://")
  ) {
    throw new Error(
      "DATABASE_URL must be a PostgreSQL connection string (postgresql://user:pass@host:5432/db).",
    );
  }
}

export function createPrismaClient(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  assertPostgresUrl(connectionString);

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}
