import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

const root = resolve(__dirname, "../../../..");

const envFiles = [
  resolve(root, ".env"),
  resolve(__dirname, "../../.env"),
];

for (const file of envFiles) {
  if (existsSync(file)) {
    config({ path: file, override: false });
  }
}
