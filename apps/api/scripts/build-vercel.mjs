import * as esbuild from "esbuild";
import { mkdirSync } from "fs";

const sharedOptions = {
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  sourcemap: true,
  packages: "bundle",
  external: ["@prisma/client", ".prisma", "prisma"],
  logLevel: "info",
};

mkdirSync("api", { recursive: true });
mkdirSync("dist", { recursive: true });

await esbuild.build({
  ...sharedOptions,
  entryPoints: ["scripts/vercel-entry.ts"],
  outfile: "api/index.js",
});

await esbuild.build({
  ...sharedOptions,
  entryPoints: ["src/server.ts"],
  outfile: "dist/server.js",
});

console.log("API bundles written to api/index.js and dist/server.js");
