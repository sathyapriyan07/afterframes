// Simple script to generate PWA icon PNGs
// Run: node generate-icons.js
import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'

const sizes = [192, 512]

for (const size of sizes) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#0a84ff'
  const r = size * 0.2
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(size - r, 0)
  ctx.quadraticCurveTo(size, 0, size, r)
  ctx.lineTo(size, size - r)
  ctx.quadraticCurveTo(size, size, size - r, size)
  ctx.lineTo(r, size)
  ctx.quadraticCurveTo(0, size, 0, size - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
  ctx.fill()

  // Film icon (simplified)
  ctx.fillStyle = '#ffffff'
  const cx = size / 2
  const cy = size / 2
  const s = size * 0.35
  ctx.fillRect(cx - s, cy - s * 0.7, s * 2, s * 1.4)

  writeFileSync(`public/icon-${size}.png`, canvas.toBuffer('image/png'))
  console.log(`Generated icon-${size}.png`)
}
