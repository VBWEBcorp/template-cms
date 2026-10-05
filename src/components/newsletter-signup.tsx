'use client'

import { useState } from 'react'
import { Send, Check, Loader2 } from 'lucide-react'
import { cx as cn } from '@/lib/cx'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface Props {
  /** Identifie l'origine de l'inscription côté admin (footer, popup…) */
  source?: string
  className?: string
}

export function NewsletterSignup({ source = 'footer', className }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setStatus('success')
        setMessage(
          data.alreadySubscribed
            ? 'Vous êtes déjà inscrit. Merci !'
            : 'Merci ! Votre inscription est confirmée.'
        )
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || "L'inscription a échoué, veuillez réessayer.")
      }
    } catch {
      setStatus('error')
      setMessage('Erreur réseau, veuillez réessayer.')
    }
  }

  if (status === 'success') {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-emerald-400', className)}>
        <Check className="size-4 shrink-0" />
        <span>{message}</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-2', className)} noValidate>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === 'error') setStatus('idle')
          }}
          placeholder="Votre adresse e-mail"
          aria-label="Votre adresse e-mail"
          className="h-10 w-full min-w-0 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-white/40"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          aria-label="S'inscrire à la newsletter"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-white px-4 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === 'loading' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          <span className="hidden sm:inline">S&apos;inscrire</span>
        </button>
      </div>
      {status === 'error' && <p className="text-xs text-red-400">{message}</p>}
    </form>
  )
}
