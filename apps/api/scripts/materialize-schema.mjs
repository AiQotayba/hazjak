import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export function materializePrismaSchema(
  provider = process.env.DATABASE_PROVIDER?.trim().toLowerCase(),
  apiRoot = resolve(import.meta.dirname ?? ".", ".."),
) {
  const normalized = provider === "mysql" ? "mysql" : "postgresql";
  const sourcePath = resolve(apiRoot, "prisma/schema.prisma");
  const outputPath = resolve(apiRoot, "prisma/.schema.generated.prisma");

  const source = readFileSync(sourcePath, "utf8");
  const generated = source.replace(
    /provider\s*=\s*"(?:mysql|postgresql)"/,
    `provider = "${normalized}"`,
  );

  writeFileSync(outputPath, generated, "utf8");
  return outputPath;
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  const path = materializePrismaSchema();
  console.log(`Prisma schema materialized for ${process.env.DATABASE_PROVIDER}: ${path}`);
}
