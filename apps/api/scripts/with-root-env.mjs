import { config } from "dotenv";
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(apiRoot, "../..");

config({ path: resolve(repoRoot, ".env") });

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/with-root-env.mjs <prisma-args...>");
  process.exit(1);
}

const binDir = resolve(apiRoot, "node_modules/.bin");
const prismaBin = ["prisma.CMD", "prisma.cmd", "prisma"].find((name) =>
  existsSync(resolve(binDir, name))
);

if (!prismaBin) {
  console.error(
    "Prisma CLI not found. Run pnpm install from the repo root first."
  );
  process.exit(1);
}

const result = spawnSync(resolve(binDir, prismaBin), args, {
  cwd: apiRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

process.exit(result.status ?? 1);
