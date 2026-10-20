import sharp from 'sharp';
import fs from 'fs';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <!-- Dark Onyx Base Gradient -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1c1917" />
      <stop offset="100%" stop-color="#090807" />
    </linearGradient>

    <!-- Warm Ochre / Solar Glow Gradient -->
    <linearGradient id="ochre" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb923c" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>

  <!-- Luxury dark squircle with warm ochre rim (100% visible on dark/light tabs) -->
  <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#bg)" stroke="#ea580c" stroke-width="2.5" />

  <!-- Architectural House Silhouette with Integrated 'H' -->
  <!-- Unified Roof -->
  <path d="M 32 10 L 53 27 L 45 27 L 32 16 L 19 27 L 11 27 Z" fill="#f5f2eb" />

  <!-- Left 'H' Pillar / Wall -->
  <rect x="15" y="24" width="7.5" height="27" rx="2" fill="#f5f2eb" />

  <!-- Right 'H' Pillar / Wall -->
  <rect x="41.5" y="24" width="7.5" height="27" rx="2" fill="#f5f2eb" />

  <!-- Architectural Lintel / Crossbar -->
  <rect x="19" y="34" width="26" height="5" rx="1.5" fill="#f5f2eb" />

  <!-- Solar Core / Pendant Light in the upper apex -->
  <circle cx="32" cy="24.5" r="4.5" fill="url(#ochre)" />

  <!-- Walkthrough Portal / Doorway at 1:1 scale -->
  <rect x="27.5" y="39" width="9" height="12" rx="2" fill="url(#ochre)" />
</svg>`;

async function build() {
  const svgBuffer = Buffer.from(svg);
  fs.writeFileSync('public/favicon.svg', svgBuffer);

  // Render PNGs at various resolutions
  const sizes = [16, 32, 48, 64, 180, 512];
  const pngBuffers = {};

  for (const s of sizes) {
    const buf = await sharp(svgBuffer, { density: 300 })
      .resize(s, s)
      .png()
      .toBuffer();
    pngBuffers[s] = buf;
  }

  // Save standard icon files
  fs.writeFileSync('public/favicon.png', pngBuffers[64]);
  fs.writeFileSync('public/favicon-32x32.png', pngBuffers[32]);
  fs.writeFileSync('public/favicon-16x16.png', pngBuffers[16]);
  fs.writeFileSync('public/apple-touch-icon.png', pngBuffers[180]);

  // Construct multi-size ICO file (16x16, 32x32, 48x48)
  const icoSizes = [16, 32, 48];
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO format
  header.writeUInt16LE(icoSizes.length, 4);

  const dirEntries = [];
  let offset = 6 + icoSizes.length * 16;
  const imageBuffers = [];

  for (const s of icoSizes) {
    const buf = pngBuffers[s];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(s === 256 ? 0 : s, 0); // width
    entry.writeUInt8(s === 256 ? 0 : s, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset
    dirEntries.push(entry);
    imageBuffers.push(buf);
    offset += buf.length;
  }

  const icoBuffer = Buffer.concat([header, ...dirEntries, ...imageBuffers]);
  fs.writeFileSync('public/favicon.ico', icoBuffer);

  console.log('Successfully generated all new high-visibility favicon assets!');
}

build().catch(console.error);
