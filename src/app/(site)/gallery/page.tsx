import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/seo/json-ld'
import { getGallerySettings, listGalleryImages } from '@/lib/blog'
import { absoluteUrl, buildMetadata } from '@/lib/seo'
import { breadcrumbNode, graph, webPageNode } from '@/lib/structured-data'

import { GalleryGrid } from './gallery-grid'

export const revalidate = 3600

const PATH = '/gallery'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, images] = await Promise.all([getGallerySettings(), listGalleryImages()])
  return buildMetadata({
    title: settings.title,
    description: settings.description,
    path: PATH,
    image: settings.heroImage ? { url: settings.heroImage } : images[0] ? { url: images[0].imageUrl } : null,
    noindex: !settings.enabled || images.length === 0,
  })
}

export default async function GalleryPage() {
  const [settings, images] = await Promise.all([getGallerySettings(), listGalleryImages()])
  if (!settings.enabled) notFound()

  const page = {
    ...webPageNode({ path: PATH, name: settings.title, description: settings.description, type: 'CollectionPage', hasBreadcrumb: true }),
    ...(images.length
      ? {
          primaryImageOfPage: { '@type': 'ImageObject', url: absoluteUrl(images[0].imageUrl) },
          image: images.slice(0, 20).map((img) => ({ '@type': 'ImageObject', url: absoluteUrl(img.imageUrl), name: img.title })),
        }
      : {}),
  }

  return (
    <div className="min-h-screen">
      <JsonLd data={graph(page, breadcrumbNode(PATH, [{ name: settings.eyebrow || 'Galerie', path: PATH }]))} />

      <section className="relative flex min-h-[340px] items-center overflow-hidden sm:min-h-[400px] lg:min-h-[440px]">
        <div className="absolute inset-0">
          {settings.heroImage ? (
            <Image src={settings.heroImage} alt="" fill sizes="100vw" preload className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
          )}
        </div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="animate-fade-up mx-auto max-w-3xl text-center">
            <p className="mb-4 font-display text-xs font-semibold tracking-[0.22em] text-white/70 uppercase">{settings.eyebrow}</p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">{settings.title}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">{settings.description}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16" aria-label="Photos">
        {images.length > 0 ? (
          <GalleryGrid images={images} />
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-muted-foreground">Aucune image dans la galerie.</p>
            <p className="mt-2 text-sm text-muted-foreground">Revenez bientôt !</p>
          </div>
        )}
      </section>
    </div>
  )
}
