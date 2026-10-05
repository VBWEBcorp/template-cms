'use client'

import { CalendarDays, MailCheck, Phone, Sparkles } from 'lucide-react'

import { FieldEditor, ImageField, SectionEditor } from '@/components/admin/field-editor'
import { SeoEditor } from '@/components/admin/list-editors'
import { PageEditor } from '@/components/admin/page-editor'

/**
 * Page Contact : champs identiques à contactDefaults. Les coordonnées servent
 * aussi au pied de page et aux données structurées de toutes les pages.
 */
export default function AdminContactPage() {
  return (
    <PageEditor pageId="contact" title="Page Contact">
      {(content, update) => (
        <>
          <SeoEditor seo={content.seo} path="/contact" onChange={update} />

          <SectionEditor title="En-tête" icon={Sparkles} description="Bannière en haut de la page">
            <FieldEditor label="Accroche" value={content.hero.eyebrow} onChange={(v) => update('hero.eyebrow', v)} />
            <FieldEditor label="Titre (h1)" value={content.hero.title} onChange={(v) => update('hero.title', v)} />
            <FieldEditor label="Description" type="textarea" value={content.hero.description} onChange={(v) => update('hero.description', v)} />
            <ImageField label="Photo de fond" value={content.hero.image} onChange={(v) => update('hero.image', v)} />
          </SectionEditor>

          <SectionEditor title="Formulaire" icon={MailCheck} description="Textes autour du formulaire de contact">
            <FieldEditor label="Titre" value={content.form.title} onChange={(v) => update('form.title', v)} />
            <FieldEditor label="Sous-titre" value={content.form.subtitle} onChange={(v) => update('form.subtitle', v)} />
            <FieldEditor
              label="Message affiché après l'envoi"
              type="textarea"
              value={content.form.successMessage}
              onChange={(v) => update('form.successMessage', v)}
            />
          </SectionEditor>

          <SectionEditor
            title="Prise de rendez-vous"
            icon={CalendarDays}
            description="Affichée seulement si un lien de rendez-vous est configuré (NEXT_PUBLIC_APPOINTMENT_URL)"
          >
            <FieldEditor label="Titre" value={content.appointment.title} onChange={(v) => update('appointment.title', v)} />
            <FieldEditor label="Bouton" value={content.appointment.button} onChange={(v) => update('appointment.button', v)} />
            <FieldEditor label="Texte" type="textarea" value={content.appointment.text} onChange={(v) => update('appointment.text', v)} />
          </SectionEditor>

          <SectionEditor title="Coordonnées" icon={Phone} description="Pied de page, page Contact et fiche entreprise pour Google">
            <FieldEditor label="Téléphone" value={content.info.phone} onChange={(v) => update('info.phone', v)} />
            <FieldEditor label="E-mail" value={content.info.email} onChange={(v) => update('info.email', v)} />
            <FieldEditor label="Adresse" value={content.info.street} onChange={(v) => update('info.street', v)} />
            <FieldEditor label="Code postal" value={content.info.postalCode} onChange={(v) => update('info.postalCode', v)} />
            <FieldEditor label="Ville" value={content.info.city} onChange={(v) => update('info.city', v)} />
            <FieldEditor label="Horaires" value={content.info.hours} onChange={(v) => update('info.hours', v)} />
          </SectionEditor>
        </>
      )}
    </PageEditor>
  )
}
