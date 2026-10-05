/**
 * Fusion des surcharges du back-office sur les valeurs par défaut du code.
 * Module pur (aucun accès base) : utilisé par le serveur, l'admin et les tests.
 */

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Applique `override` sur `base`, récursivement.
 * - Les tableaux de l'override remplacent ceux de la base (listes éditées en bloc).
 * - Une chaîne vide ou une valeur nulle ne remplace rien : un champ vidé par
 *   erreur dans l'admin ne laisse jamais un titre ou un bouton vide sur le site.
 * - Une clé inconnue de la base est ignorée : seuls les champs lus par les
 *   composants peuvent arriver jusqu'à eux.
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base)) {
    if (override === undefined || override === null || override === '') return base
    if (Array.isArray(base) && !Array.isArray(override)) return base
    if (typeof base === 'string' && typeof override !== 'string') return base
    if (typeof base === 'number' && typeof override !== 'number') return base
    if (typeof base === 'boolean' && typeof override !== 'boolean') return base
    return override as T
  }
  if (!isPlainObject(override)) return base

  const out: Record<string, unknown> = { ...base }
  for (const key of Object.keys(base)) {
    if (key in override) out[key] = deepMerge((base as Record<string, unknown>)[key], override[key])
  }
  return out as T
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Ne garde que ce qui diffère des valeurs par défaut : c'est ce qui part en base.
 * Un texte du code corrigé plus tard s'applique ainsi partout où le client n'y
 * a pas touché.
 */
export function diffFromDefaults(base: unknown, value: unknown): unknown {
  if (isPlainObject(base) && isPlainObject(value)) {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(base)) {
      if (!(key in value)) continue
      const diff = diffFromDefaults(base[key], value[key])
      if (diff !== undefined) out[key] = diff
    }
    return Object.keys(out).length > 0 ? out : undefined
  }
  return deepEqual(base, value) ? undefined : value
}
