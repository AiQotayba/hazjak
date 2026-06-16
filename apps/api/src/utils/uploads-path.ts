import { existsSync, readFileSync } from "fs";
import path from "path";

function findApiPackageRoot(startDir: string): string {
  let dir = startDir;
  for (let i = 0; i < 8; i++) {
    const pkgPath = path.join(dir, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { name?: string };
        if (pkg.name === "@hazjak/api") return dir;
      } catch {
        // ignore invalid package.json
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(startDir, "../..");
}

const API_ROOT = findApiPackageRoot(__dirname);

/** Always apps/api/uploads — stable in dev (tsx), dist, and Vercel bundle. */
export const UPLOADS_ROOT = path.join(API_ROOT, "uploads");
