import { serializeJsonLd } from '@/lib/structured-data'

/** Balise <script type="application/ld+json">, rendue côté serveur. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
}
