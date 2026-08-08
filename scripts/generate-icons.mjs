// Generates minimal PWA icons (solid color square with logo glyph) without external deps.
// Usage: node scripts/generate-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const SIZES = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'maskable-512x512.png', size: 512 },
]

mkdirSync('public', { recursive: true })

function crc32(buf) {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff]
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

function makePng(size) {
  const w = size
  const h = size
  const bytesPerPx = 4
  const rowLen = w * bytesPerPx + 1
  const raw = Buffer.alloc(rowLen * h)
  const radius = Math.floor(size * 0.22)
  for (let y = 0; y < h; y++) {
    raw[y * rowLen] = 0 // filter: None
    for (let x = 0; x < w; x++) {
      // rounded rect mask
      const dx = Math.min(x, w - 1 - x)
      const dy = Math.min(y, h - 1 - y)
      const inside = dx < radius && dy < radius ? Math.hypot(radius - dx, radius - dy) <= radius : true
      let r = 17, g = 17, b = 17, a = 255
      if (!inside) {
        a = 0
      } else {
        // simple glyph: horizontal lines (like a receipt)
        const lineHeight = Math.max(2, Math.floor(size / 28))
        const lineGap = Math.floor(size / 6)
        const baseY = Math.floor(size * 0.32)
        const lineW = [0.55, 0.4, 0.28].map((p) => Math.floor(size * p))
        const lineX = Math.floor(size * 0.18)
        const linesY = [0, 1, 2].map((i) => baseY + i * lineGap)
        for (let li = 0; li < linesY.length; li++) {
          const ly = linesY[li]
          if (y >= ly && y < ly + lineHeight && x >= lineX && x < lineX + lineW[li]) {
            r = 255; g = 255; b = 255
          }
        }
        // green dot for currency
        const cx = Math.floor(size * 0.74)
        const cy = Math.floor(size * 0.66)
        const cr = Math.floor(size * 0.13)
        const d = Math.hypot(x - cx, y - cy)
        if (d <= cr) {
          r = 22; g = 163; b = 74
          if (d > cr - 3) {
            // ring
            r = 255; g = 255; b = 255
          }
        }
      }
      const idx = y * rowLen + 1 + x * bytesPerPx
      raw[idx] = r
      raw[idx + 1] = g
      raw[idx + 2] = b
      raw[idx + 3] = a
    }
  }
  const compressed = deflateSync(raw)
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const { name, size } of SIZES) {
  const buf = makePng(size)
  writeFileSync(`public/${name}`, buf)
  console.log(`Wrote public/${name} (${size}x${size}, ${buf.length} bytes)`)
}
