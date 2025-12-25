'use client'

import { useAuth } from '@/contexts/AuthContext'
import { ReactNode } from 'react'

interface CanProps {
  perform: string
  children: ReactNode
  fallback?: ReactNode
}

export default function Can({ perform, children, fallback = null }: CanProps) {
  const { hasPermission } = useAuth()

  if (hasPermission(perform)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
