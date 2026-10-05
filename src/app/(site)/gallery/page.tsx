import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'

import { JsonLd } from '@/components/seo/json-ld'
import { getGallerySettings, listGalleryImages } from '@/lib/blog'
import { absoluteUrl, buildMetadata } from '@/lib/seo'
import { breadcrumbNode, graph, webPageNode } from '@/lib/structured-data'

import { Lightbox } from './lightbox'

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
          <>
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {images.map((image, i) => (
                <li key={image.id} className="animate-fade-up" style={{ '--delay': `${Math.min(i, 8) * 60}ms` } as CSSProperties}>
                  <a
                    href={image.imageUrl}
                    data-lightbox-src={image.imageUrl}
                    data-lightbox-title={image.title}
                    data-lightbox-description={image.description}
                    className="group block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border/50 bg-card text-left transition-all hover:border-primary/20 hover:shadow-lg"
                  >
                    <span className="relative block aspect-[4/3] overflow-hidden bg-muted">
                      <Image
                        src={image.imageUrl}
                        alt={image.title}
                        fill
                        sizes="(min-width: 1152px) 360px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </span>
                    <span className="block space-y-2 p-5">
                      <span className="block font-display font-semibold text-foreground transition-colors group-hover:text-primary">
                        {image.title}
                      </span>
                      {image.description && (
                        <span className="line-clamp-2 block text-sm leading-relaxed text-muted-foreground">{image.description}</span>
                      )}
                      {image.category && (
                        <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          {image.category}
                        </span>
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <Lightbox />
          </>
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
