'use client'

import { BarChart3, Gem, Sparkles } from 'lucide-react'

import { FieldEditor, ImageField, SectionEditor } from '@/components/admin/field-editor'
import { IconSelect, ListEditor, SeoEditor } from '@/components/admin/list-editors'
import { PageEditor } from '@/components/admin/page-editor'

/** Page À propos : champs identiques à aboutDefaults (src/content/pages.ts). */
export default function AdminAboutPage() {
  return (
    <PageEditor pageId="about" title="Page À propos">
      {(content, update) => (
        <>
          <SeoEditor seo={content.seo} path="/a-propos" onChange={update} />

          <SectionEditor title="En-tête" icon={Sparkles} description="Présentation en haut de la page">
            <FieldEditor label="Accroche" value={content.hero.eyebrow} onChange={(v) => update('hero.eyebrow', v)} />
            <FieldEditor label="Titre (h1)" value={content.hero.title} onChange={(v) => update('hero.title', v)} />
            <FieldEditor label="Description" type="textarea" value={content.hero.description} onChange={(v) => update('hero.description', v)} />
            <ImageField label="Photo" value={content.hero.image} onChange={(v) => update('hero.image', v)} />
            <FieldEditor label="Badge : titre" value={content.hero.badgeTitle} onChange={(v) => update('hero.badgeTitle', v)} />
            <FieldEditor label="Badge : texte" value={content.hero.badgeText} onChange={(v) => update('hero.badgeText', v)} />
          </SectionEditor>

          <SectionEditor title="Chiffres clés" icon={BarChart3} description="Sous la présentation" cols={1}>
            <ListEditor<{ value: string; label: string }>
              items={content.stats}
              onChange={(items) => update('stats', items)}
              itemLabel="Chiffre"
              blank={{ value: '10', label: 'Nouveau chiffre' }}
              max={4}
              renderItem={(item, set) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <FieldEditor label="Valeur" value={item.value} onChange={(v) => set({ value: v })} />
                  <FieldEditor label="Libellé" value={item.label} onChange={(v) => set({ label: v })} />
                </div>
              )}
            />
          </SectionEditor>

          <SectionEditor title="Valeurs" icon={Gem} description="Vos engagements et points forts" cols={1}>
            <FieldEditor label="Accroche" value={content.valuesIntro.eyebrow} onChange={(v) => update('valuesIntro.eyebrow', v)} />
            <FieldEditor label="Titre" value={content.valuesIntro.title} onChange={(v) => update('valuesIntro.title', v)} />
            <ListEditor<{ iconName: string; title: string; description: string }>
              items={content.values}
              onChange={(items) => update('values', items)}
              itemLabel="Valeur"
              blank={{ iconName: 'Heart', title: 'Nouvelle valeur', description: 'Description à rédiger.' }}
              renderItem={(item, set) => (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FieldEditor label="Titre" value={item.title} onChange={(v) => set({ title: v })} />
                    <IconSelect value={item.iconName} onChange={(v) => set({ iconName: v })} />
                  </div>
                  <FieldEditor label="Description" type="textarea" value={item.description} onChange={(v) => set({ description: v })} />
                </>
              )}
            />
          </SectionEditor>
        </>
      )}
    </PageEditor>
  )
}
