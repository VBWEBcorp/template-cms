'use client'

import { CheckCircle2, Send } from 'lucide-react'
import Link from 'next/link'
import { type FormEvent, useState } from 'react'


type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'message', string>>

// Classes écrites en clair (sans tailwind-merge) : ce composant client reste léger.
const fieldClass =
  'h-11 w-full min-w-0 rounded-xl border border-input bg-background/70 px-2.5 py-1 text-base text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:shadow-[0_0_0_4px_oklch(0.55_0.2_var(--brand-hue)/0.1)] aria-invalid:border-destructive md:text-sm'
const labelClass = 'flex items-center gap-2 text-sm leading-none font-medium select-none'
const submitClass =
  "group relative isolate inline-flex h-9 w-full items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-brand-gradient px-2.5 text-sm font-medium whitespace-nowrap text-primary-foreground shadow-[var(--shadow-primary)] transition-all outline-none hover:shadow-[var(--shadow-primary-hover)] focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:transition-transform before:duration-700 before:content-[''] hover:before:translate-x-full"

/**
 * Formulaire de contact : envoi à /api/contact (Resend). Pas de service tiers, pas
 * de mailto. Le champ `company` est un pot de miel invisible pour les robots.
 */
export function ContactForm({ successMessage }: { successMessage: string }) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    setError('')
    setFieldErrors({})
    const data = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      })
      const body = (await res.json().catch(() => ({}))) as { error?: string; errors?: FieldErrors }
      if (res.ok) {
        setSent(true)
        return
      }
      setFieldErrors(body.errors ?? {})
      setError(body.error || 'Le message n’a pas pu être envoyé. Réessayez dans un instant.')
    } catch {
      setError('Connexion impossible. Vérifiez votre connexion et réessayez.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div role="status" className="animate-fade-in mt-7 flex items-start gap-3 rounded-2xl bg-emerald-500/10 p-5 text-sm text-emerald-800 dark:text-emerald-200">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p>{successMessage}</p>
      </div>
    )
  }

  const describedBy = (field: keyof FieldErrors) => (fieldErrors[field] ? `${field}-erreur` : undefined)

  return (
    <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
      {/* Pot de miel : invisible pour les humains, rempli par les robots. */}
      <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="company">Société</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="firstname">Prénom</label>
          <input id="firstname" name="firstname" placeholder="Camille" autoComplete="given-name" required className={fieldClass} />
        </div>
        <div className="space-y-2">
          <label className={labelClass} htmlFor="lastname">Nom</label>
          <input
            id="lastname"
            name="lastname"
            placeholder="Martin"
            autoComplete="family-name"
            required
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={describedBy('name')}
            className={fieldClass}
          />
        </div>
      </div>
      {fieldErrors.name && (
        <p id="name-erreur" className="-mt-3 text-xs text-destructive">
          {fieldErrors.name}
        </p>
      )}

      <div className="space-y-2">
        <label className={labelClass} htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="camille@entreprise.fr"
          autoComplete="email"
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={describedBy('email')}
          className={fieldClass}
        />
        {fieldErrors.email && (
          <p id="email-erreur" className="text-xs text-destructive">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="phone">
          Téléphone <span className="font-normal text-muted-foreground">(optionnel)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="06 12 34 56 78"
          autoComplete="tel"
          aria-invalid={Boolean(fieldErrors.phone)}
          aria-describedby={describedBy('phone')}
          className={fieldClass}
        />
        {fieldErrors.phone && (
          <p id="phone-erreur" className="text-xs text-destructive">
            {fieldErrors.phone}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="message">Votre message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={10}
          placeholder="Décrivez votre projet en quelques mots..."
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={describedBy('message')}
          className="w-full rounded-xl border border-input bg-background/70 px-3.5 py-3 text-sm leading-relaxed text-foreground transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:shadow-[0_0_0_4px_oklch(0.55_0.2_var(--brand-hue)/0.1)] focus-visible:outline-none"
        />
        {fieldErrors.message && (
          <p id="message-erreur" className="text-xs text-destructive">
            {fieldErrors.message}
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      <button type="submit" disabled={sending} className={submitClass}>
        {sending ? 'Envoi en cours...' : 'Envoyer le message'}
        <Send className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
      </button>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Vos coordonnées servent uniquement à répondre à votre demande.{' '}
        <Link href="/politique-de-confidentialite" className="underline underline-offset-2 hover:text-foreground">
          Politique de confidentialité
        </Link>
      </p>
    </form>
  )
}
