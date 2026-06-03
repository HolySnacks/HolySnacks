#!/usr/bin/env node
// Generates PNG icons for the HolySnacks PWA manifest.
// Uses only Node.js built-ins (zlib). No external dependencies needed.

const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf, start, end) {
  let c = 0xffffffff;
  for (let i = start; i < end; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u32(buf, off, val) {
  buf[off]     = (val >>> 24) & 0xff;
  buf[off + 1] = (val >>> 16) & 0xff;
  buf[off + 2] = (val >>> 8)  & 0xff;
  buf[off + 3] =  val         & 0xff;
}

function makeChunk(type, data) {
  const buf = Buffer.alloc(data.length + 12);
  u32(buf, 0, data.length);
  buf.write(type, 4, 'ascii');
  if (data.length) data.copy(buf, 8);
  u32(buf, 8 + data.length, crc32(buf, 4, 8 + data.length));
  return buf;
}

// Draw a HolySnacks "H" icon at the given size.
// Returns a Buffer containing a valid PNG file (RGB, no alpha).
function drawIcon(size) {
  const BG   = [11,  18,  32];  // #0b1220
  const GOLD = [240, 200, 85];  // #f0c855

  // "H" letter geometry — proportional to icon size
  const pad  = Math.round(size * 0.22);   // left/right/top/bottom letter padding
  const barW = Math.round(size * 0.14);   // width of each vertical stroke
  const midH = Math.round(size * 0.10);   // height of the crossbar
  const midY = Math.round(size * 0.50);   // centre-Y of crossbar

  const lx0 = pad;
  const lx1 = pad + barW;
  const rx0 = size - pad - barW;
  const rx1 = size - pad;
  const cy0 = midY - Math.round(midH / 2);
  const cy1 = cy0 + midH;

  // Build raw (uncompressed) PNG row data.
  // Each row: 1 filter byte (0 = None) + 3 bytes per pixel (RGB)
  const rawRows = Buffer.alloc(size * (1 + size * 3));

  for (let y = 0; y < size; y++) {
    const base = y * (1 + size * 3);
    rawRows[base] = 0; // filter: None

    for (let x = 0; x < size; x++) {
      const isLeftBar   = x >= lx0 && x < lx1 && y >= pad  && y < size - pad;
      const isRightBar  = x >= rx0 && x < rx1 && y >= pad  && y < size - pad;
      const isCrossbar  = x >= lx0 && x < rx1 && y >= cy0  && y < cy1;
      const color = (isLeftBar || isRightBar || isCrossbar) ? GOLD : BG;

      const off = base + 1 + x * 3;
      rawRows[off]     = color[0];
      rawRows[off + 1] = color[1];
      rawRows[off + 2] = color[2];
    }
  }

  const compressed = zlib.deflateSync(rawRows);

  const ihdr = Buffer.alloc(13);
  u32(ihdr, 0, size);
  u32(ihdr, 4, size);
  ihdr[8]  = 8; // 8 bits per channel
  ihdr[9]  = 2; // colour type: RGB
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace: none

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // PNG signature
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

const publicDir = path.join(__dirname, '..', 'public');
const icons = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

for (const { size, name } of icons) {
  fs.writeFileSync(path.join(publicDir, name), drawIcon(size));
  console.log(`✓ ${name} (${size}×${size})`);
}
