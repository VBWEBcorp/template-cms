'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AlertTriangle, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmOptions {
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

type ConfirmFn = (opts?: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((v: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((options) => {
    setOpts(options ?? {})
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const close = useCallback((value: boolean) => {
    resolver.current?.(value)
    resolver.current = null
    setOpts(null)
  }, [])

  const danger = opts?.danger
  const Icon = danger ? AlertTriangle : HelpCircle

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
              {opts && (
          <div
            className="animate-fade-in fixed inset-0 z-[210] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => close(false)} />
            <div 
              className="animate-fade-in relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full',
                    danger ? 'bg-red-500/10 text-red-600' : 'bg-primary/10 text-primary'
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-foreground">
                    {opts.title ?? 'Confirmer'}
                  </h2>
                  {opts.message && (
                    <p className="mt-1 text-sm text-muted-foreground">{opts.message}</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => close(false)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {opts.cancelLabel ?? 'Annuler'}
                </button>
                <button
                  onClick={() => close(true)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors',
                    danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'
                  )}
                >
                  {opts.confirmLabel ?? 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        )}
          </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm doit être utilisé dans un ConfirmProvider')
  return ctx
}
