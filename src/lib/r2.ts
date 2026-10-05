import 'server-only'

import { createHash, createHmac } from 'node:crypto'

/**
 * Envoi et suppression de fichiers sur Cloudflare R2 (API compatible S3).
 *
 * Signature AWS SigV4 écrite en quelques lignes avec node:crypto, à la place du
 * SDK AWS (près de 100 paquets pour deux requêtes). Signature vérifiée contre
 * l'exemple officiel d'AWS dans src/tests/r2.test.ts. Adressage « path style »
 * (https://<compte>.r2.cloudflarestorage.com/<bucket>/<clé>), le plus fiable sur R2.
 */

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID ?? ''
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? ''
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? ''
const BUCKET_NAME = process.env.R2_BUCKET_NAME ?? ''
const PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? '').replace(/\/+$/, '')

export const r2Enabled = Boolean(ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY && BUCKET_NAME && PUBLIC_URL)

const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex')
const hmac = (key: string | Buffer, data: string) => createHmac('sha256', key).update(data).digest()

/** Encodage d'un segment de chemin selon les règles S3 (RFC 3986). */
function encodeSegment(segment: string): string {
  return encodeURIComponent(segment).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
}

export type SignInput = {
  method: string
  host: string
  path: string
  headers: Record<string, string>
  payloadHash: string
  accessKeyId: string
  secretAccessKey: string
  region: string
  service?: string
  /** AAAAMMJJTHHMMSSZ */
  amzDate: string
}

/** En-tête Authorization AWS SigV4 (requête sans paramètres de requête). */
export function signV4(input: SignInput): string {
  const service = input.service ?? 's3'
  const date = input.amzDate.slice(0, 8)
  const headers: Record<string, string> = { host: input.host, ...lowerKeys(input.headers) }
  const names = Object.keys(headers).sort()
  const canonicalHeaders = names.map((n) => `${n}:${headers[n].trim().replace(/\s+/g, ' ')}\n`).join('')
  const signedHeaders = names.join(';')
  const canonicalRequest = [input.method, input.path, '', canonicalHeaders, signedHeaders, input.payloadHash].join('\n')
  const scope = `${date}/${input.region}/${service}/aws4_request`
  const stringToSign = ['AWS4-HMAC-SHA256', input.amzDate, scope, sha256(canonicalRequest)].join('\n')
  const kDate = hmac(`AWS4${input.secretAccessKey}`, date)
  const kSigning = hmac(hmac(hmac(kDate, input.region), service), 'aws4_request')
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex')
  return `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
}

function lowerKeys(h: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(h).map(([k, v]) => [k.toLowerCase(), v]))
}

async function r2Request(method: 'PUT' | 'DELETE', key: string, body?: Buffer, contentType?: string): Promise<void> {
  if (!r2Enabled) throw new Error('R2 non configuré (variables R2_* manquantes)')
  const host = `${ACCOUNT_ID}.r2.cloudflarestorage.com`
  const path = `/${encodeSegment(BUCKET_NAME)}/${key.split('/').map(encodeSegment).join('/')}`
  const payloadHash = sha256(body ?? '')
  const amzDate = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const headers: Record<string, string> = {
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
    ...(contentType ? { 'content-type': contentType } : {}),
  }
  const authorization = signV4({
    method,
    host,
    path,
    headers,
    payloadHash,
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: 'auto',
    amzDate,
  })

  const res = await fetch(`https://${host}${path}`, {
    method,
    headers: { ...headers, authorization },
    body: body ? new Uint8Array(body) : undefined,
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) {
    throw new Error(`R2 ${method} ${res.status} : ${(await res.text().catch(() => '')).slice(0, 300)}`)
  }
}

/** Envoie un fichier et renvoie son adresse publique. */
export async function uploadToR2(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  await r2Request('PUT', filename, buffer, contentType)
  return `${PUBLIC_URL}/${filename}`
}

export async function deleteFromR2(filename: string): Promise<void> {
  if (!r2Enabled) return
  await r2Request('DELETE', filename)
}
