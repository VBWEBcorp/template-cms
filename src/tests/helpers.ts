import fs from 'node:fs'
import path from 'node:path'

export const ROOT = path.resolve(import.meta.dirname, '../..')
export const SRC = path.join(ROOT, 'src')

export function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8')
}

/** Code sans commentaires (pour ne pas valider un montage resté en commentaire). */
export function code(rel: string): string {
  return read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

export function listFiles(dir: string, filter: (file: string) => boolean): string[] {
  const out: string[] = []
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (['node_modules', '.next', '.git'].includes(entry.name)) continue
      const p = path.join(d, entry.name)
      if (entry.isDirectory()) walk(p)
      else if (filter(p)) out.push(p)
    }
  }
  walk(dir)
  return out
}

export const rel = (abs: string) => path.relative(ROOT, abs).split(path.sep).join('/')
