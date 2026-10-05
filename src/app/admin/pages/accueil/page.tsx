'use client'

import { BookOpen, HelpCircle, Images, LayoutGrid, Megaphone, Sparkles } from 'lucide-react'

import { FieldEditor, ImageField, SectionEditor } from '@/components/admin/field-editor'
import { ImageListEditor, ListEditor, SeoEditor } from '@/components/admin/list-editors'
import { PageEditor } from '@/components/admin/page-editor'
import type { FaqItem } from '@/content/pages'

/**
 * Page d'accueil. Chaque champ porte EXACTEMENT le nom lu par les composants
 * du site (src/content/pages.ts, homeDefaults). Les services affichés sur
 * l'accueil se modifient dans la page Services, les avis dans Témoignages.
 */
export default function AdminHomePage() {
  return (
    <PageEditor pageId="home" title="Page d'accueil">
      {(content, update) => (
        <>
          <SeoEditor seo={content.seo} path="/" onChange={update} />

          <SectionEditor title="En-tête (hero)" icon={Sparkles} description="Grande bannière en haut de la page">
            <FieldEditor label="Accroche" value={content.hero.eyebrow} onChange={(v) => update('hero.eyebrow', v)} />
            <FieldEditor label="Titre principal (h1)" value={content.hero.title} onChange={(v) => update('hero.title', v)} />
            <FieldEditor label="Description" type="textarea" value={content.hero.description} onChange={(v) => update('hero.description', v)} />
            <FieldEditor label="Bouton principal (vers Contact)" value={content.hero.button1} onChange={(v) => update('hero.button1', v)} />
            <FieldEditor label="Bouton secondaire (vers Services)" value={content.hero.button2} onChange={(v) => update('hero.button2', v)} />
            <ImageListEditor label="Photos du diaporama" images={content.hero.images} onChange={(v) => update('hero.images', v)} />
          </SectionEditor>

          <SectionEditor title="Introduction des services" icon={LayoutGrid} description="Titre au-dessus des 4 premiers services">
            <FieldEditor label="Accroche" value={content.servicesIntro.eyebrow} onChange={(v) => update('servicesIntro.eyebrow', v)} />
            <FieldEditor label="Titre" value={content.servicesIntro.title} onChange={(v) => update('servicesIntro.title', v)} />
            <FieldEditor
              label="Description"
              type="textarea"
              value={content.servicesIntro.description}
              onChange={(v) => update('servicesIntro.description', v)}
            />
          </SectionEditor>

          <SectionEditor title="Notre histoire" icon={BookOpen} description="Texte de présentation et photo">
            <FieldEditor label="Accroche" value={content.story.eyebrow} onChange={(v) => update('story.eyebrow', v)} />
            <FieldEditor label="Titre" value={content.story.title} onChange={(v) => update('story.title', v)} />
            <FieldEditor label="Paragraphe 1" type="textarea" value={content.story.paragraph1} onChange={(v) => update('story.paragraph1', v)} />
            <FieldEditor label="Paragraphe 2" type="textarea" value={content.story.paragraph2} onChange={(v) => update('story.paragraph2', v)} />
            <ImageField label="Photo" value={content.story.image} onChange={(v) => update('story.image', v)} />
          </SectionEditor>

          <SectionEditor title="Galerie de l'accueil" icon={Images} description="Carrousel de photos">
            <FieldEditor label="Accroche" value={content.gallery.eyebrow} onChange={(v) => update('gallery.eyebrow', v)} />
            <FieldEditor label="Titre" value={content.gallery.title} onChange={(v) => update('gallery.title', v)} />
            <ImageListEditor label="Photos" images={content.gallery.images} onChange={(v) => update('gallery.images', v)} />
          </SectionEditor>

          <SectionEditor title="Questions fréquentes" icon={HelpCircle} description="Affichées sur l'accueil et lues par Google (FAQ)" cols={1}>
            <FieldEditor label="Accroche" value={content.faq.eyebrow} onChange={(v) => update('faq.eyebrow', v)} />
            <FieldEditor label="Titre" value={content.faq.title} onChange={(v) => update('faq.title', v)} />
            <FieldEditor label="Description" type="textarea" value={content.faq.description} onChange={(v) => update('faq.description', v)} />
            <ListEditor<FaqItem>
              items={content.faq.items}
              onChange={(items) => update('faq.items', items)}
              itemLabel="Question"
              blank={{ question: 'Nouvelle question ?', answer: 'Réponse à rédiger.' }}
              renderItem={(item, set) => (
                <>
                  <FieldEditor label="Question" value={item.question} onChange={(v) => set({ question: v })} />
                  <FieldEditor label="Réponse" type="textarea" value={item.answer} onChange={(v) => set({ answer: v })} />
                </>
              )}
            />
          </SectionEditor>

          <SectionEditor title="Appel à l'action" icon={Megaphone} description="Bloc de conversion (aussi sur À propos et Services)">
            <FieldEditor label="Accroche" value={content.cta.eyebrow} onChange={(v) => update('cta.eyebrow', v)} />
            <FieldEditor label="Titre" value={content.cta.title} onChange={(v) => update('cta.title', v)} />
            <FieldEditor label="Description" type="textarea" value={content.cta.description} onChange={(v) => update('cta.description', v)} />
            <FieldEditor label="Bouton du formulaire" value={content.cta.button} onChange={(v) => update('cta.button', v)} />
            <FieldEditor
              label="Bouton de rendez-vous (si un lien est configuré)"
              value={content.cta.appointmentButton}
              onChange={(v) => update('cta.appointmentButton', v)}
            />
            <ImageListEditor label="Photos qui défilent" images={content.cta.images} onChange={(v) => update('cta.images', v)} />
          </SectionEditor>
        </>
      )}
    </PageEditor>
  )
}
