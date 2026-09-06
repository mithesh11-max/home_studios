import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const seqDir = path.join(rootDir, "public", "sequence");
const webpDir = path.join(seqDir, "webp");
const halfDir = path.join(seqDir, "half");
const liteDir = path.join(seqDir, "lite");

[webpDir, halfDir, liteDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function processFrames() {
  console.log("Starting frame processing...");
  const files = fs
    .readdirSync(seqDir)
    .filter((f) => /^ezgif-frame-\d{3}\.jpg$/.test(f))
    .sort();

  console.log(`Found ${files.length} frames.`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const frameNum = i + 1;
    const baseName = path.parse(file).name;
    const inputPath = path.join(seqDir, file);

    // 1. Convert to WebP (q: 85)
    const webpOutput = path.join(webpDir, `${baseName}.webp`);
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(webpOutput);

    // 2. Generate half-res 640x360 (.jpg and .webp)
    const halfJpgOutput = path.join(halfDir, `${baseName}.jpg`);
    const halfWebpOutput = path.join(halfDir, `${baseName}.webp`);
    await sharp(inputPath)
      .resize(640, 360, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toFile(halfJpgOutput);
    await sharp(inputPath)
      .resize(640, 360, { fit: "cover" })
      .webp({ quality: 80 })
      .toFile(halfWebpOutput);

    // 3. Generate 60-frame lite set (every 5th frame)
    if (frameNum % 5 === 1 || frameNum === 300) {
      const liteJpgOutput = path.join(liteDir, `${baseName}.jpg`);
      const liteWebpOutput = path.join(liteDir, `${baseName}.webp`);
      await sharp(inputPath)
        .resize(640, 360, { fit: "cover" })
        .jpeg({ quality: 75 })
        .toFile(liteJpgOutput);
      await sharp(inputPath)
        .resize(640, 360, { fit: "cover" })
        .webp({ quality: 75 })
        .toFile(liteWebpOutput);
    }

    if ((i + 1) % 50 === 0 || i === files.length - 1) {
      console.log(`Processed ${i + 1}/${files.length} frames...`);
    }
  }

  console.log("All frame processing complete!");
}

processFrames().catch((err) => {
  console.error("Error processing frames:", err);
  process.exit(1);
});
// Automated sequence processor for Home Studios
