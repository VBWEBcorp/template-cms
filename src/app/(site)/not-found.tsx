import type { Metadata } from 'next'

import { NotFoundContent } from '@/components/not-found-content'

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: true },
}

/** 404 levée par une page du site (article supprimé, blog désactivé...). */
export default function NotFound() {
  return <NotFoundContent />
}
