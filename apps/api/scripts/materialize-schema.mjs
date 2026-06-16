import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export function materializePrismaSchema(
  provider = process.env.DATABASE_PROVIDER?.trim().toLowerCase(),
  apiRoot = resolve(import.meta.dirname ?? ".", ".."),
) {
  const normalized = provider === "mysql" ? "mysql" : "postgresql";
  const sourcePath = resolve(apiRoot, "prisma/schema.prisma");
  // Materialize outside prisma/ so Prisma tooling indexes only one schema file.
  const outputPath = resolve(apiRoot, ".prisma/schema");

  const source = readFileSync(sourcePath, "utf8");
  const generated = source.replace(
    /provider\s*=\s*"(?:mysql|postgresql)"/,
    `provider = "${normalized}"`,
  );

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, generated, "utf8");
  return outputPath;
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  const path = materializePrismaSchema();
  console.info(`Prisma schema materialized for ${process.env.DATABASE_PROVIDER}: ${path}`);
}
