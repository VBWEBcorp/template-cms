'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, Mail, Trash2, Download, Search, Users, CalendarDays, Inbox, Send, Megaphone,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/admin/toast'
import { useConfirm } from '@/components/admin/confirm-dialog'
import { AdminLoading } from '@/components/admin/admin-ui'
import { adminJson, errorMessage } from '@/lib/admin-session'
import { cn } from '@/lib/utils'

interface Subscriber {
  _id: string
  email: string
  source: string
  status: 'active' | 'unsubscribed'
  createdAt: string
}

type Tab = 'subscribers' | 'campaign'

export default function AdminNewsletterPage() {
  const { toast } = useToast()
  const confirm = useConfirm()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('subscribers')

  // Campagne
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminJson<Subscriber[]>('/api/newsletter')
        setSubscribers(Array.isArray(data) ? data : [])
      } catch (err) {
        const message = errorMessage(err)
        if (message) toast.error(`Chargement des abonnés impossible : ${message}`)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const handleDelete = async (sub: Subscriber) => {
    if (
      !(await confirm({
        title: 'Retirer cet abonné',
        message: `Supprimer ${sub.email} de la liste ? Cette action est irréversible.`,
        danger: true,
        confirmLabel: 'Supprimer',
      }))
    )
      return
    try {
      await adminJson(`/api/newsletter/${sub._id}`, { method: 'DELETE' })
      setSubscribers((list) => list.filter((s) => s._id !== sub._id))
      toast.success('Abonné supprimé')
    } catch (err) {
      const message = errorMessage(err)
      if (message) toast.error(message)
    }
  }

  const handleExport = () => {
    if (subscribers.length === 0) return
    const rows = [['Email', 'Source', 'Statut', 'Inscription']]
    for (const s of subscribers) {
      rows.push([
        s.email,
        s.source || '',
        s.status || 'active',
        new Date(s.createdAt).toLocaleDateString('fr-FR'),
      ])
    }
    const csv = rows
      .map((r) => r.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const bom = String.fromCharCode(0xfeff)
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `abonnes-newsletter-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export CSV téléchargé')
  }

  const activeCount = useMemo(
    () => subscribers.filter((s) => s.status !== 'unsubscribed').length,
    [subscribers]
  )

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Renseignez un objet et un message.')
      return
    }
    if (activeCount === 0) {
      toast.error('Aucun abonné actif.')
      return
    }
    if (
      !(await confirm({
        title: 'Envoyer la campagne',
        message: `Envoyer ce message à ${activeCount} abonné${activeCount > 1 ? 's' : ''} ? L'envoi est immédiat et irréversible.`,
        confirmLabel: 'Envoyer',
      }))
    )
      return

    setSending(true)
    try {
      const data = await adminJson<{ sent: number; total: number; failed: number }>('/api/newsletter/campaign', {
        method: 'POST',
        body: JSON.stringify({ subject, message }),
      })
      toast.success(`Campagne envoyée : ${data.sent}/${data.total} e-mail${data.total > 1 ? 's' : ''}`)
      if (data.failed > 0) toast.error(`${data.failed} envoi(s) en échec`)
      setSubject('')
      setMessage('')
    } catch (err) {
      const msg = errorMessage(err)
      if (msg) toast.error(msg)
    } finally {
      setSending(false)
    }
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return subscribers
    return subscribers.filter((s) => s.email.toLowerCase().includes(q))
  }, [subscribers, query])

  const thisMonth = subscribers.filter((s) => {
    const d = new Date(s.createdAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  if (loading) return <AdminLoading />

  const stats = [
    { label: 'Abonnés', value: subscribers.length, icon: Users, tint: 'bg-primary/10 text-primary' },
    { label: 'Actifs', value: activeCount, icon: Mail, tint: 'bg-emerald-500/10 text-emerald-600' },
    { label: 'Ce mois-ci', value: thisMonth, icon: CalendarDays, tint: 'bg-violet-500/10 text-violet-600' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-8 md:pt-0">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground">Newsletter</h1>
              <p className="text-xs text-muted-foreground">Abonnés et envoi de campagnes</p>
            </div>
          </div>
          {tab === 'subscribers' && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleExport}
              disabled={subscribers.length === 0}
            >
              <Download className="size-4" />
              Exporter en CSV
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-2xl font-bold leading-none text-foreground">{stat.value}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${stat.tint}`}>
                    <Icon className="size-[18px]" />
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="flex w-fit gap-1 rounded-lg bg-muted/50 p-1">
          <button
            onClick={() => setTab('subscribers')}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
              tab === 'subscribers' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Users className="size-4" />
            Abonnés
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{subscribers.length}</span>
          </button>
          <button
            onClick={() => setTab('campaign')}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
              tab === 'campaign' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Megaphone className="size-4" />
            Campagne
          </button>
        </div>

        {/* ======= TAB: ABONNÉS ======= */}
        {tab === 'subscribers' && (
          <div className="space-y-4">
            {subscribers.length > 0 && (
              <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un e-mail…"
                  className="h-9 pl-9"
                />
              </div>
            )}

            {filtered.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="hidden grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-border/60 bg-muted/30 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
                  <span>E-mail</span>
                  <span>Source</span>
                  <span>Inscription</span>
                  <span className="sr-only">Actions</span>
                </div>
                <ul className="divide-y divide-border/60">
                  {filtered.map((sub) => (
                    <li
                      key={sub._id} 
                      className="animate-fade-in group grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Mail className="size-4" />
                        </span>
                        <span className="truncate text-sm font-medium text-foreground">{sub.email}</span>
                        {sub.status === 'unsubscribed' && (
                          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            désinscrit
                          </span>
                        )}
                      </div>
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                          {sub.source || 'site'}
                        </span>
                      </span>
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {formatDate(sub.createdAt)}
                      </span>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleDelete(sub)}
                        title="Supprimer"
                        className="opacity-60 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : subscribers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 py-16 text-center">
                <Inbox className="mx-auto mb-3 size-10 text-muted-foreground/20" />
                <p className="font-medium text-muted-foreground">Aucun abonné pour le moment</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Les inscriptions via le formulaire du site apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 py-16 text-center">
                <Search className="mx-auto mb-3 size-10 text-muted-foreground/20" />
                <p className="font-medium text-muted-foreground">Aucun e-mail ne correspond</p>
              </div>
            )}
          </div>
        )}

        {/* ======= TAB: CAMPAGNE ======= */}
        {tab === 'campaign' && (
          <div 
            className="animate-fade-in max-w-2xl space-y-5">
            <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
              <Send className="size-4 shrink-0 text-primary" />
              <span className="text-foreground">
                Ce message sera envoyé à <strong>{activeCount}</strong> abonné{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}.
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-border/40 bg-card">
              <div className="border-b border-border/40 bg-muted/30 px-5 py-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                  Nouvelle campagne
                </h3>
              </div>
              <div className="space-y-4 p-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Objet</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex : Nos nouveautés du mois"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Message</Label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={10}
                    placeholder={'Bonjour,\n\nÉcrivez ici le contenu de votre message…\n\nLaissez une ligne vide entre deux paragraphes.'}
                    className="w-full min-w-0 resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                  <p className="text-[11px] text-muted-foreground/60">
                    Texte simple. Un lien de désinscription est ajouté automatiquement en bas de chaque e-mail.
                  </p>
                </div>

                <Button onClick={handleSend} disabled={sending || activeCount === 0} className="w-full gap-2">
                  <Send className="size-4" />
                  {sending ? 'Envoi en cours…' : `Envoyer à ${activeCount} abonné${activeCount > 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
