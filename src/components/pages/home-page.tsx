import { CtaSection } from '@/components/sections/cta-section'
import { FaqSection } from '@/components/sections/faq-section'
import { GalleryCarousel } from '@/components/sections/gallery-carousel'
import { HeroSection } from '@/components/sections/hero-section'
import { ServicesPreview } from '@/components/sections/services-preview'
import { StorySection } from '@/components/sections/story-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { ValuesMarquee } from '@/components/sections/values-marquee'
import type { homeDefaults, servicesDefaults, testimonialsDefaults } from '@/content/pages'

/**
 * Corps de la page d'accueil. Utilisé par la route « / » ET par l'aperçu de
 * l'admin (/apercu/home) : l'aperçu montre exactement le rendu du site.
 */
export function HomePage({
  home,
  services,
  testimonials,
}: {
  home: typeof homeDefaults
  services: typeof servicesDefaults
  testimonials: typeof testimonialsDefaults
}) {
  return (
    <>
      <HeroSection hero={home.hero} />
      <ServicesPreview intro={home.servicesIntro} services={services.services} />
      <StorySection story={home.story} />
      <TestimonialsSection content={testimonials} />
      {home.gallery.images.length > 0 && (
        <GalleryCarousel eyebrow={home.gallery.eyebrow} title={home.gallery.title} images={home.gallery.images} />
      )}
      <FaqSection faq={home.faq} />
      <CtaSection cta={home.cta} />
      <ValuesMarquee />
    </>
  )
}
