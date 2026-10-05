'use client'

import { MessageSquareQuote, Type } from 'lucide-react'

import { FieldEditor, SectionEditor } from '@/components/admin/field-editor'
import { ListEditor } from '@/components/admin/list-editors'
import { PageEditor } from '@/components/admin/page-editor'
import type { Testimonial } from '@/content/pages'

/** Avis clients affichés sur l'accueil : champs identiques à testimonialsDefaults. */
export default function AdminTestimonialsPage() {
  return (
    <PageEditor pageId="testimonials" title="Témoignages">
      {(content, update) => (
        <>
          <SectionEditor title="En-tête" icon={Type} description="Titre de la section des avis">
            <FieldEditor label="Accroche" value={content.eyebrow} onChange={(v) => update('eyebrow', v)} />
            <FieldEditor label="Titre" value={content.title} onChange={(v) => update('title', v)} />
            <FieldEditor label="Description" type="textarea" value={content.description} onChange={(v) => update('description', v)} />
          </SectionEditor>

          <SectionEditor title="Avis" icon={MessageSquareQuote} description="Recopiez de vrais avis clients (fiche Google par exemple)" cols={1}>
            <ListEditor<Testimonial>
              items={content.testimonials}
              onChange={(items) => update('testimonials', items)}
              itemLabel="Avis"
              blank={{ name: 'Prénom N.', company: 'Entreprise', text: 'Texte de l’avis.', stars: 5 }}
              renderItem={(item, set) => (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <FieldEditor label="Nom" value={item.name} onChange={(v) => set({ name: v })} />
                    <FieldEditor label="Entreprise" value={item.company} onChange={(v) => set({ company: v })} />
                    <FieldEditor
                      label="Étoiles (1 à 5)"
                      value={String(item.stars)}
                      onChange={(v) => set({ stars: Math.min(5, Math.max(1, parseInt(v, 10) || 5)) })}
                    />
                  </div>
                  <FieldEditor label="Avis" type="textarea" value={item.text} onChange={(v) => set({ text: v })} />
                </>
              )}
            />
          </SectionEditor>
        </>
      )}
    </PageEditor>
  )
}
