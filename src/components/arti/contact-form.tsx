'use client'

import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

/**
 * Petit formulaire de contact avec captcha mathématique (style screenshot ARTI : "5 + 14 = …").
 * Démo locale — l'envoi est simulé. Brancher sur un endpoint email côté admin plus tard.
 */
export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle'
  )
  const captcha = useMemo(() => {
    const a = 5
    const b = 14
    return { a, b, expected: a + b }
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (Number(data.get('captcha')) !== captcha.expected) {
      setStatus('error')
      return
    }
    setStatus('sending')
    await new Promise((r) => setTimeout(r, 700))
    setStatus('sent')
    e.currentTarget.reset()
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-2xl space-y-4 bg-beige-deep p-6 sm:p-10"
    >
      <h2 className="text-center font-display text-4xl font-medium text-foreground sm:text-5xl">
        Contactez nous
      </h2>

      <Field name="nom" placeholder="Nom" required />
      <Field name="prenom" placeholder="Prénom" required />
      <Field name="telephone" type="tel" placeholder="Téléphone" />
      <Field name="email" type="email" placeholder="E-mail" required />
      <Textarea name="message" placeholder="Message" required />

      <div className="flex items-center justify-end gap-3 text-sm text-foreground/80">
        <label htmlFor="captcha" className="font-medium">
          {captcha.a} + {captcha.b} =
        </label>
        <input
          id="captcha"
          name="captcha"
          inputMode="numeric"
          pattern="[0-9]*"
          required
          className="h-9 w-16 border border-foreground/20 bg-white px-2 text-center text-foreground focus:border-sauge focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex h-9 items-center justify-center bg-sauge px-5 text-sm font-light tracking-wide text-white transition-colors hover:bg-sauge-deep disabled:opacity-60"
        >
          {status === 'sending' ? 'Envoi…' : 'Envoi'}
        </button>
      </div>

      {status === 'error' && (
        <p className="text-right text-xs text-red-700">
          Captcha incorrect. Réessayez.
        </p>
      )}
      {status === 'sent' && (
        <p className="text-right text-xs text-sauge-deep">
          Merci, votre message a bien été envoyé !
        </p>
      )}
    </form>
  )
}

function Field({
  name,
  type = 'text',
  placeholder,
  required,
  className,
}: {
  name: string
  type?: string
  placeholder: string
  required?: boolean
  className?: string
}) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      className={cn(
        'block h-11 w-full border border-foreground/15 bg-white px-4 text-[14px] text-foreground placeholder:text-foreground/45 focus:border-sauge focus:outline-none',
        className
      )}
    />
  )
}

function Textarea({
  name,
  placeholder,
  required,
}: {
  name: string
  placeholder: string
  required?: boolean
}) {
  return (
    <textarea
      name={name}
      placeholder={placeholder}
      required={required}
      rows={5}
      className="block w-full border border-foreground/15 bg-white px-4 py-3 text-[14px] text-foreground placeholder:text-foreground/45 focus:border-sauge focus:outline-none"
    />
  )
}
