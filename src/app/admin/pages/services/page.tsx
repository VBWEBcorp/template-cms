'use client'

import { BarChart3, Briefcase, Sparkles } from 'lucide-react'

import { FieldEditor, ImageField, SectionEditor } from '@/components/admin/field-editor'
import { IconSelect, ListEditor, SeoEditor } from '@/components/admin/list-editors'
import { PageEditor } from '@/components/admin/page-editor'
import type { ServiceItem } from '@/content/pages'

/** Page Services : champs identiques à servicesDefaults. Les 4 premiers services apparaissent aussi sur l'accueil. */
export default function AdminServicesPage() {
  return (
    <PageEditor pageId="services" title="Page Services">
      {(content, update) => (
        <>
          <SeoEditor seo={content.seo} path="/services" onChange={update} />

          <SectionEditor title="En-tête" icon={Sparkles} description="Bannière en haut de la page">
            <FieldEditor label="Accroche" value={content.hero.eyebrow} onChange={(v) => update('hero.eyebrow', v)} />
            <FieldEditor label="Titre (h1)" value={content.hero.title} onChange={(v) => update('hero.title', v)} />
            <FieldEditor label="Description" type="textarea" value={content.hero.description} onChange={(v) => update('hero.description', v)} />
            <ImageField label="Photo de fond" value={content.hero.image} onChange={(v) => update('hero.image', v)} />
          </SectionEditor>

          <SectionEditor title="Chiffres de l'en-tête" icon={BarChart3} description="Sous la description" cols={1}>
            <ListEditor<{ value: string; label: string }>
              items={content.kpis}
              onChange={(items) => update('kpis', items)}
              itemLabel="Chiffre"
              blank={{ value: '10', label: 'nouveau chiffre' }}
              max={4}
              renderItem={(item, set) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <FieldEditor label="Valeur" value={item.value} onChange={(v) => set({ value: v })} />
                  <FieldEditor label="Libellé" value={item.label} onChange={(v) => set({ label: v })} />
                </div>
              )}
            />
          </SectionEditor>

          <SectionEditor title="Liste des services" icon={Briefcase} description="Les prestations affichées sur le site" cols={1}>
            <ListEditor<ServiceItem>
              items={content.services}
              onChange={(items) => update('services', items)}
              itemLabel="Service"
              blank={{
                iconName: 'Sparkles',
                title: 'Nouveau service',
                description: 'Description du service à rédiger.',
                points: ['Premier point fort'],
                image: content.hero.image,
              }}
              renderItem={(item, set) => (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FieldEditor label="Titre" value={item.title} onChange={(v) => set({ title: v })} />
                    <IconSelect value={item.iconName} onChange={(v) => set({ iconName: v })} />
                  </div>
                  <FieldEditor label="Description" type="textarea" value={item.description} onChange={(v) => set({ description: v })} />
                  <FieldEditor
                    label="Points clés (un par ligne)"
                    type="textarea"
                    value={item.points.join('\n')}
                    onChange={(v) => set({ points: v.split('\n').map((p) => p.trim()).filter(Boolean) })}
                  />
                  <ImageField label="Photo" value={item.image} onChange={(v) => set({ image: v })} />
                </>
              )}
            />
          </SectionEditor>
        </>
      )}
    </PageEditor>
  )
}
