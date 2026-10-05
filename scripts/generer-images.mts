/**
 * Génère les icônes du site et l'image de partage par défaut à partir de
 * src/config/site.ts (nom, description, couleur de marque).
 *
 *   npm run images
 *
 * Fichiers produits :
 * - src/app/icon.png          512 x 512, carré (favicon moderne, Google)
 * - src/app/apple-icon.png    180 x 180 (écran d'accueil iOS)
 * - src/app/favicon.ico       16, 32 et 48 px, PNG en RGBA (exigé par Next 16)
 * - public/og-default.png     1200 x 630, image de partage par défaut
 *
 * Pour un client qui a un vrai logo : remplacer les trois icônes par son logo
 * (carré, fond plein) et public/og-default.png par une image 1200 x 630 à ses
 * couleurs. Ce script ne sert qu'à partir d'un état propre et cohérent.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

import { siteConfig } from '../src/config/site.ts'

const root = path.resolve(import.meta.dirname, '..')
const brand = siteConfig.theme.themeColor

// Icône « globe » de lucide (la même que le logo du site), en blanc.
const globe = `
  <circle cx="12" cy="12" r="10"/>
  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
  <path d="M2 12h20"/>`

function iconSvg(size: number): string {
  const radius = Math.round(size * 0.22)
  const glyph = size * 0.58
  const offset = (size - glyph) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${brand}"/>
  <svg x="${offset}" y="${offset}" width="${glyph}" height="${glyph}" viewBox="0 0 24 24" fill="none"
       stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${globe}</svg>
</svg>`
}

async function png(size: number): Promise<Buffer> {
  return sharp(Buffer.from(iconSvg(size))).ensureAlpha().png().toBuffer()
}

/** Fichier ICO contenant des images PNG (format accepté par tous les navigateurs). */
function ico(images: Array<{ size: number; data: Buffer }>): Buffer {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)

  const entries: Buffer[] = []
  let offset = 6 + 16 * images.length
  for (const { size, data } of images) {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2)
    e.writeUInt8(0, 3)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += data.length
    entries.push(e)
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)])
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Découpe un texte en lignes d'environ `max` caractères. */
function wrap(text: string, max: number, maxLines: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > max) {
      lines.push(line.trim())
      line = word
    } else {
      line += ' ' + word
    }
  }
  if (line.trim()) lines.push(line.trim())
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = kept[maxLines - 1].replace(/[\s,.;:]*\S*$/, '') + '…'
    return kept
  }
  return lines
}

function ogSvg(): string {
  const lines = wrap(siteConfig.description, 36, 3)
  const tspans = lines
    .map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 66}">${escapeXml(l)}</tspan>`)
    .join('')
  // Domaine affiché en bas, sauf en local (lancer avec NEXT_PUBLIC_SITE_URL renseigné).
  const domain = siteConfig.url.includes('localhost') ? '' : siteConfig.url.replace(/^https?:\/\//, '')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f0f14"/>
      <stop offset="0.6" stop-color="#1b1830"/>
      <stop offset="1" stop-color="${brand}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g transform="translate(80 88)">
    <rect width="64" height="64" rx="14" fill="${brand}"/>
    <svg x="13" y="13" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">${globe}</svg>
    <text x="88" y="44" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="34" font-weight="700"
          fill="#ffffff">${escapeXml(siteConfig.name)}</text>
  </g>
  <text x="80" y="300" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="52" font-weight="700"
        fill="#ffffff">${tspans}</text>
  <text x="80" y="560" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="26"
        fill="rgba(255,255,255,0.6)">${escapeXml(domain)}</text>
</svg>`
}

async function main() {
  await mkdir(path.join(root, 'public'), { recursive: true })
  await writeFile(path.join(root, 'src/app/icon.png'), await png(512))
  await writeFile(path.join(root, 'src/app/apple-icon.png'), await png(180))
  const sizes = [16, 32, 48]
  await writeFile(
    path.join(root, 'src/app/favicon.ico'),
    ico(await Promise.all(sizes.map(async (size) => ({ size, data: await png(size) }))))
  )
  await writeFile(
    path.join(root, 'public/og-default.png'),
    await sharp(Buffer.from(ogSvg())).png({ compressionLevel: 9 }).toBuffer()
  )
  console.log('Icônes et image de partage générées pour', siteConfig.name)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
