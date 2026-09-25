/**
 * convert-webp.mjs — Re-encode sequence frames to properly compressed WebP
 *
 * The existing webp/ folder was encoded at q:85 which produced files LARGER
 * than the source JPGs. Architectural animation frames are seen for ~16ms each
 * during scroll playback, so q:72 is visually indistinguishable while saving
 * ~55-65% over the original JPGs. Mobile frames are encoded at q:68 since they
 * are downscaled further.
 *
 * Run: node scripts/convert-webp.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const seqDir = path.join(rootDir, "public", "sequence");
const webpDir = path.join(seqDir, "webp");
const mobileDir = path.join(seqDir, "mobile");
const mobileWebpDir = path.join(seqDir, "mobile-webp");

// Create output dirs
[webpDir, mobileWebpDir].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const DESKTOP_QUALITY = 72; // q72 — sharp encoders use libwebp; this gives ~45-55% of JPG size
const MOBILE_QUALITY = 68;  // mobile frames are smaller source, slightly more aggressive

async function convertDir(srcDir, dstDir, quality, label, resizeOpt = null) {
  const files = fs
    .readdirSync(srcDir)
    .filter((f) => /^ezgif-frame-\d{3}\.jpg$/.test(f))
    .sort();

  console.log(`\n[${label}] Converting ${files.length} frames at q${quality}…`);
  let done = 0;

  // Process in batches of 16 for speed
  const BATCH = 16;
  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (file) => {
        const baseName = path.parse(file).name;
        const src = path.join(srcDir, file);
        const dst = path.join(dstDir, `${baseName}.webp`);
        let pipeline = sharp(src);
        if (resizeOpt) {
          pipeline = pipeline.resize(resizeOpt.width, resizeOpt.height);
        }
        await pipeline
          .webp({ quality, effort: 4, smartSubsample: true })
          .toFile(dst);
        done++;
        if (done % 50 === 0 || done === files.length) {
          console.log(`  ${done}/${files.length}`);
        }
      })
    );
  }
  console.log(`[${label}] Done.`);
}

async function measureDir(dir, ext) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(ext));
  const total = files.reduce((s, f) => s + fs.statSync(path.join(dir, f)).size, 0);
  return { count: files.length, mb: (total / 1_048_576).toFixed(1) };
}

async function main() {
  console.log("=== Home Studios — Sequence WebP Re-encode ===\n");

  const beforeDesktop = await measureDir(seqDir, ".jpg");
  const beforeMobile = await measureDir(mobileDir, ".jpg");
  console.log(`Before: Desktop JPG = ${beforeDesktop.mb} MB, Mobile JPG = ${beforeMobile.mb} MB`);

  await convertDir(seqDir, webpDir, DESKTOP_QUALITY, "Desktop WebP");
  await convertDir(mobileDir, mobileWebpDir, 75, "Mobile WebP", { width: 540, height: 960 });

  const afterDesktop = await measureDir(webpDir, ".webp");
  const afterMobile = await measureDir(mobileWebpDir, ".webp");
  console.log(`\nAfter: Desktop WebP = ${afterDesktop.mb} MB, Mobile WebP = ${afterMobile.mb} MB`);
  console.log(`Desktop savings: ${(100 - (afterDesktop.mb / beforeDesktop.mb) * 100).toFixed(0)}%`);
  console.log(`Mobile savings: ${(100 - (afterMobile.mb / beforeMobile.mb) * 100).toFixed(0)}%`);
}

main().catch((e) => { console.error(e); process.exit(1); });
