'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { hasValidSession } from '@/lib/admin-session'

export default function AdminPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace(hasValidSession() ? '/admin/dashboard' : '/admin/login')
  }, [router])
  return null
}
