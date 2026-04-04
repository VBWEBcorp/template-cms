'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Images,
  LogOut,
  Home,
  Users,
  Briefcase,
  Phone,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/admin/sidebar-context'

const navItems = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
]

const pageItems = [
  { href: '/admin/pages/accueil', label: 'Accueil', icon: Home },
  { href: '/admin/pages/a-propos', label: 'À propos', icon: Users },
  { href: '/admin/pages/services', label: 'Services', icon: Briefcase },
  { href: '/admin/pages/contact', label: 'Contact', icon: Phone },
  { href: '/admin/pages/temoignages', label: 'Témoignages', icon: MessageSquare },
  { href: '/admin/gallery', label: 'Galerie', icon: Images },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
]

function NavLink({
  href, label, icon: Icon, pathname, collapsed,
}: {
  href: string; label: string; icon: any; pathname: string; collapsed: boolean
}) {
  const isActive = pathname === href
  return (
    <Link href={href} title={collapsed ? label : undefined}>
      <div
        className={cn(
          'relative flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all',
          collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
          isActive
            ? 'bg-primary text-white shadow-sm'
            : 'text-zinc-400 hover:bg-white/10 hover:text-white'
        )}
      >
        <Icon className="size-[18px] shrink-0" />
        {!collapsed && <span>{label}</span>}
      </div>
    </Link>
  )
}

export function AdminSidebar() {
  const { collapsed, toggle } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    router.push('/admin/login')
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-zinc-900 border-r border-white/10 flex flex-col z-50 transition-all duration-200',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'h-[60px] flex items-center border-b border-white/10',
        collapsed ? 'justify-center px-2' : 'justify-between px-4'
      )}>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-white leading-tight">Admin</p>
            <p className="text-[10px] text-zinc-400">Gestion du site</p>
          </div>
        )}
        <button
          onClick={toggle}
          className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          title={collapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn(
        'flex-1 py-5 space-y-5 overflow-y-auto',
        collapsed ? 'px-2' : 'px-3'
      )}>
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} collapsed={collapsed} />
          ))}
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 pb-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Pages
            </p>
          )}
          {collapsed && <div className="border-t border-white/10 mb-1" />}
          {pageItems.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className={cn(
        'border-t border-white/10 space-y-0.5',
        collapsed ? 'p-2' : 'p-3'
      )}>
        <Link href="/" target="_blank" title={collapsed ? 'Voir le site' : undefined}>
          <div className={cn(
            'flex items-center gap-3 rounded-lg text-[13px] font-medium text-zinc-400 hover:bg-white/10 hover:text-white transition-colors',
            collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
          )}>
            <ExternalLink className="size-[18px]" />
            {!collapsed && 'Voir le site'}
          </div>
        </Link>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Déconnexion' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg text-[13px] font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors',
            collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
          )}
        >
          <LogOut className="size-[18px]" />
          {!collapsed && 'Déconnexion'}
        </button>
      </div>
    </aside>
  )
}
