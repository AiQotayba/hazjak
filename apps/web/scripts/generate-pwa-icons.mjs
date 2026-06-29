import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");
const source = join(publicDir, "logo.jpg");

const icons = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of icons) {
  await sharp(source)
    .resize(size, size, { fit: "contain", background: "#ffffff" })
    .png()
    .toFile(join(publicDir, name));
  console.log(`Wrote ${name} (${size}x${size})`);
}
