import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, env } from "prisma/config";
import { materializePrismaSchema } from "./scripts/materialize-schema.mjs";

const repoRoot = resolve(__dirname, "../..");
const envPath = resolve(repoRoot, ".env");

if (existsSync(envPath)) {
  config({ path: envPath });
}

const schema = materializePrismaSchema(process.env.DATABASE_PROVIDER, __dirname);

export default defineConfig({
  schema,
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
