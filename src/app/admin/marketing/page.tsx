'use client'

import { AlignCenter, ArrowLeft, Check, ExternalLink, Eye, Megaphone } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { AdminLoading } from '@/components/admin/admin-ui'
import { ImageField } from '@/components/admin/field-editor'
import { useToast } from '@/components/admin/toast'
import { MarketingBannerBar } from '@/components/marketing/banner-bar'
import { MarketingPopupCard } from '@/components/marketing/popup-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminJson, errorMessage } from '@/lib/admin-session'
import {
  DEFAULT_MARKETING,
  type MarketingBannerSettings,
  type MarketingSettings,
  normalizeMarketing,
} from '@/lib/marketing'
import { cn } from '@/lib/utils'

type Tab = 'popup' | 'banner'

const labelClass = 'text-xs font-medium tracking-wide text-muted-foreground uppercase'

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onToggle} className="flex cursor-pointer items-center gap-2">
      <span className={cn('relative h-5 w-9 rounded-full transition-colors', on ? 'bg-primary' : 'bg-muted-foreground/30')}>
        <span className={cn('absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform', on && 'translate-x-4')} />
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </button>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className={labelClass}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 cursor-pointer rounded-lg border border-input bg-transparent"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs" />
      </div>
    </div>
  )
}

/**
 * Popup et bandeau marketing. Les aperçus utilisent les VRAIS composants du
 * site (MarketingPopupCard, MarketingBannerBar) : ils ne peuvent pas mentir.
 */
export default function AdminMarketingPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<MarketingSettings>(DEFAULT_MARKETING)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [tab, setTab] = useState<Tab>('popup')

  useEffect(() => {
    adminJson<unknown>('/api/marketing')
      .then((data) => setSettings(normalizeMarketing(data)))
      .catch((err) => {
        const message = errorMessage(err)
        if (message) toast.error(`Réglages illisibles : ${message}`)
      })
      .finally(() => setLoading(false))
  }, [toast])

  const update = (patch: Partial<MarketingSettings>) => setSettings((s) => ({ ...s, ...patch }))
  const updateBanner = (patch: Partial<MarketingBannerSettings>) => setSettings((s) => ({ ...s, banner: { ...s.banner, ...patch } }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const saved = await adminJson<unknown>('/api/marketing', { method: 'PUT', body: JSON.stringify(settings) })
      setSettings(normalizeMarketing(saved))
      toast.success('Réglages enregistrés et publiés')
    } catch (err) {
      const message = errorMessage(err)
      if (message) toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <AdminLoading />

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between pt-8 md:pt-0">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            aria-label="Retour au tableau de bord"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground">Marketing</h1>
            <p className="text-xs text-muted-foreground">
              {tab === 'popup' ? 'Popup affichée aux visiteurs' : 'Bandeau affiché au-dessus du menu'}
            </p>
          </div>
        </div>
        {tab === 'popup' && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowPreview(true)}>
              <Eye className="size-4" />
              Aperçu
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href="/?apercu-popup=1" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                Tester sur le site
              </a>
            </Button>
          </div>
        )}
      </div>

      <div className="inline-flex items-center gap-1 rounded-lg bg-muted/60 p-1" role="tablist">
        {(
          [
            ['popup', 'Popup', Megaphone],
            ['banner', 'Bandeau', AlignCenter],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              tab === id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'popup' && (
        <div className="max-w-2xl overflow-hidden rounded-xl border border-border/40 bg-card">
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-5 py-3">
            <h2 className="text-xs font-bold tracking-widest text-muted-foreground/60 uppercase">Popup</h2>
            <Toggle on={settings.enabled} onToggle={() => update({ enabled: !settings.enabled })} label={settings.enabled ? 'Activée' : 'Désactivée'} />
          </div>

          <div className="space-y-5 p-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="mk-title" className={labelClass}>
                  Titre
                </Label>
                <Input id="mk-title" value={settings.title} onChange={(e) => update({ title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mk-desc" className={labelClass}>
                  Description
                </Label>
                <textarea
                  id="mk-desc"
                  value={settings.description}
                  onChange={(e) => update({ description: e.target.value })}
                  rows={3}
                  className="w-full min-w-0 resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mk-btn" className={labelClass}>
                    Texte du bouton
                  </Label>
                  <Input id="mk-btn" value={settings.buttonText} onChange={(e) => update({ buttonText: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mk-link" className={labelClass}>
                    Lien du bouton
                  </Label>
                  <Input id="mk-link" value={settings.buttonLink} onChange={(e) => update({ buttonLink: e.target.value })} placeholder="/contact ou https://..." />
                </div>
              </div>
              <ImageField label="Image (facultative)" value={settings.imageUrl} onChange={(v) => update({ imageUrl: v })} />
            </div>

            <div className="space-y-4 border-t border-border/40 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <ColorField label="Fond" value={settings.bgColor} onChange={(v) => update({ bgColor: v })} />
                <ColorField label="Texte" value={settings.textColor} onChange={(v) => update({ textColor: v })} />
                <ColorField label="Bouton" value={settings.buttonColor} onChange={(v) => update({ buttonColor: v })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mk-delay" className={labelClass}>
                  Délai d&apos;apparition (secondes)
                </Label>
                <Input
                  id="mk-delay"
                  type="number"
                  min={0}
                  max={120}
                  value={settings.delay}
                  onChange={(e) => update({ delay: Number(e.target.value) || 0 })}
                />
                <p className="text-[11px] text-muted-foreground">Une fois fermée, la popup ne revient pas avant la visite suivante.</p>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              <Check className="size-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      )}

      {tab === 'banner' && (
        <div className="max-w-2xl overflow-hidden rounded-xl border border-border/40 bg-card">
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-5 py-3">
            <h2 className="text-xs font-bold tracking-widest text-muted-foreground/60 uppercase">Bandeau au-dessus du menu</h2>
            <Toggle
              on={settings.banner.enabled}
              onToggle={() => updateBanner({ enabled: !settings.banner.enabled })}
              label={settings.banner.enabled ? 'Activé' : 'Désactivé'}
            />
          </div>

          <div className="space-y-5 p-5">
            <div className="overflow-hidden rounded-lg border border-border/40">
              <div className="border-b border-border/40 bg-muted/40 px-3 py-1.5 text-[10px] font-bold tracking-widest text-muted-foreground/70 uppercase">
                Aperçu (rendu réel du site)
              </div>
              <MarketingBannerBar settings={settings} preview />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bn-text" className={labelClass}>
                Texte
              </Label>
              <Input id="bn-text" value={settings.banner.text} onChange={(e) => updateBanner({ text: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bn-link" className={labelClass}>
                Lien (facultatif)
              </Label>
              <Input id="bn-link" value={settings.banner.link} onChange={(e) => updateBanner({ link: e.target.value })} placeholder="/contact ou https://..." />
              <p className="text-[11px] text-muted-foreground">Laissez vide pour un bandeau non cliquable.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ColorField label="Fond" value={settings.banner.bgColor} onChange={(v) => updateBanner({ bgColor: v })} />
              <ColorField label="Texte" value={settings.banner.textColor} onChange={(v) => updateBanner({ textColor: v })} />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              <Check className="size-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md" onClick={() => setShowPreview(false)}>
          <div className="animate-scale-in w-full max-w-[420px]" onClick={(e) => e.stopPropagation()}>
            <MarketingPopupCard settings={settings} onClose={() => setShowPreview(false)} preview />
          </div>
        </div>
      )}
    </div>
  )
}
