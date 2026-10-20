import sharp from 'sharp';
import fs from 'fs';

async function generate() {
  const markBuffer = fs.readFileSync('public/mark.png');
  const base64Mark = markBuffer.toString('base64');

  // 1. Create favicon.svg embedding the exact official brand mark
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <image href="data:image/png;base64,${base64Mark}" width="160" height="160" />
</svg>`;
  fs.writeFileSync('public/favicon.svg', svgContent);

  // 2. Generate PNGs at 16x16, 32x32, 48x48, 64x64, 180x180
  const png16 = await sharp(markBuffer)
    .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .sharpen({ sigma: 0.5 })
    .png()
    .toBuffer();

  const png32 = await sharp(markBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .sharpen({ sigma: 0.5 })
    .png()
    .toBuffer();

  const png48 = await sharp(markBuffer)
    .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const png64 = await sharp(markBuffer)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const png180 = await sharp(markBuffer)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  fs.writeFileSync('public/favicon-16x16.png', png16);
  fs.writeFileSync('public/favicon-32x32.png', png32);
  fs.writeFileSync('public/favicon.png', png64);
  fs.writeFileSync('public/apple-touch-icon.png', png180);

  // 3. Multi-resolution ICO (16, 32, 48)
  const icoSizes = [
    { size: 16, buf: png16 },
    { size: 32, buf: png32 },
    { size: 48, buf: png48 }
  ];

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO format
  header.writeUInt16LE(icoSizes.length, 4);

  const dirEntries = [];
  let offset = 6 + icoSizes.length * 16;
  const imageBuffers = [];

  for (const { size: s, buf } of icoSizes) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(s === 256 ? 0 : s, 0);
    entry.writeUInt8(s === 256 ? 0 : s, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    imageBuffers.push(buf);
    offset += buf.length;
  }

  const icoBuffer = Buffer.concat([header, ...dirEntries, ...imageBuffers]);
  fs.writeFileSync('public/favicon.ico', icoBuffer);

  console.log('Successfully generated all favicon assets from official brand mark!');
}

generate().catch(console.error);
