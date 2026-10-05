'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AdminProviders } from '@/components/admin/admin-providers'
import { AdminSidebar, MobileMenuButton } from '@/components/admin/sidebar'
import { SidebarProvider, useSidebar } from '@/components/admin/sidebar-context'
import { clearSession, endSession, getToken, hasValidSession } from '@/lib/admin-session'
import { cn } from '@/lib/utils'

const PUBLIC_PATHS = ['/admin/login']

function AdminMain({ children }: { children: React.ReactNode }) {
  const { collapsed, isMobile } = useSidebar()
  return (
    <main
      className={cn(
        'min-h-screen flex-1 bg-muted/30 transition-all duration-200',
        isMobile ? 'ml-0' : collapsed ? 'ml-[60px]' : 'ml-[220px]'
      )}
    >
      {children}
    </main>
  )
}

/**
 * Garde de l'espace admin.
 *
 * Une session n'est reconnue que si le jeton est présent ET non expiré
 * (src/lib/admin-session.ts). Un jeton périmé est purgé avant la moindre
 * redirection : c'est ce qui casse la boucle connexion / tableau de bord.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isPublicPage = PUBLIC_PATHS.includes(pathname)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const valid = hasValidSession()

    if (isPublicPage) {
      if (valid) {
        router.replace('/admin/dashboard')
        return
      }
      // Jeton éventuellement présent mais mort : on le retire pour repartir propre.
      clearSession()
      setReady(true)
      return
    }

    if (!valid) {
      endSession(getToken() ? 'expired' : 'logout')
      return
    }
    setReady(true)
  }, [isPublicPage, router])

  if (!ready) return null
  if (isPublicPage) return children

  return (
    <AdminProviders>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <MobileMenuButton />
          <AdminMain>{children}</AdminMain>
        </div>
      </SidebarProvider>
    </AdminProviders>
  )
}
