'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<{ toast: ToastApi } | null>(null)

const VARIANTS: Record<ToastType, { icon: typeof CheckCircle2; cls: string; iconCls: string }> = {
  success: { icon: CheckCircle2, cls: 'border-emerald-500/30 bg-emerald-50 text-emerald-800', iconCls: 'text-emerald-600' },
  error: { icon: AlertCircle, cls: 'border-red-500/30 bg-red-50 text-red-800', iconCls: 'text-red-600' },
  info: { icon: Info, cls: 'border-blue-500/30 bg-blue-50 text-blue-800', iconCls: 'text-blue-600' },
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const { icon: Icon, cls, iconCls } = VARIANTS[item.type]
  return (
    <div
      className={cn(
        'animate-fade-in pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg shadow-black/5',
        cls
      )}
      role="status">
      <Icon className={cn('mt-0.5 size-[18px] shrink-0', iconCls)} />
      <p className="flex-1 text-sm font-medium leading-snug">{item.message}</p>
      <button
        onClick={onClose}
        className="shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100"
        aria-label="Fermer"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = ++idRef.current
      setToasts((list) => [...list, { id, type, message }])
      setTimeout(() => remove(id), 4500)
    },
    [remove]
  )

  const toast = useMemo<ToastApi>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
            <ToastCard key={t.id} item={t} onClose={() => remove(t.id)} />
          ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast doit être utilisé dans un ToastProvider')
  return ctx
}
