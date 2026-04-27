'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, Mail, Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ease = [0.22, 1, 0.36, 1] as const

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Identifiants invalides')
      }

      const data = await response.json()
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('authUser', JSON.stringify(data.user))

      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=75"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-primary/30" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* Decorative ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 size-[480px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute -bottom-40 -right-20 size-[420px] rounded-full bg-sky-400/15 blur-[140px]" />
      </div>

      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-6 sm:px-10 sm:py-8">
          <Link
            href="/"
            className="font-display text-sm font-semibold tracking-wide text-white/90 transition-colors hover:text-white"
          >
            ← Retour au site
          </Link>
          <div className="hidden items-center gap-2 text-xs text-white/70 sm:flex">
            <Shield className="size-3.5" />
            <span>Connexion sécurisée</span>
          </div>
        </header>

        {/* Centered content */}
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="w-full max-w-md"
          >
            {/* Title outside card */}
            <div className="mb-8 text-center sm:mb-10">
              <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
                <Lock className="size-5 text-white" />
              </div>
              <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
                Espace admin
              </h1>
              <p className="mt-2 text-sm text-white/70">
                Connectez-vous pour gérer le contenu du site
              </p>
            </div>

            {/* Glassmorphism card */}
            <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-white/70">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="h-11 rounded-xl border-white/15 bg-white/10 pl-10 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-white/70">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-11 rounded-xl border-white/15 bg-white/10 pl-10 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-100"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="group h-11 w-full rounded-xl bg-white text-black transition-all hover:bg-white/90 hover:shadow-lg"
                >
                  {loading ? (
                    'Connexion en cours...'
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>

                <div className="relative flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-white/15" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">ou</span>
                  <span className="h-px flex-1 bg-white/15" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('authToken', 'demo-token')
                    localStorage.setItem(
                      'authUser',
                      JSON.stringify({ email: 'demo@template.com', name: 'Demo', role: 'admin' })
                    )
                    router.push('/admin/dashboard')
                  }}
                  className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-white transition-all hover:border-white/25 hover:bg-white/10"
                >
                  Accès démo
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-6 text-center sm:px-10 sm:py-8">
          <Link
            href="/politique-de-confidentialite"
            className="text-[11px] text-white/50 transition-colors hover:text-white/80"
          >
            Politique de confidentialité
          </Link>
        </footer>
      </div>
    </div>
  )
}
