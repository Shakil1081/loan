'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import axiosInstance from '@/lib/axios'

interface User {
  id: number
  name: string
  email: string
  roles: Array<{ id: number; name: string }>
  permissions: Array<{ id: number; name: string }>
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, passwordConfirmation: string, role?: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get('auth_token')
      if (token) {
        try {
          const response = await axiosInstance.get('/me')
          setUser(response.data)
        } catch (error) {
          console.error('Failed to fetch user:', error)
          Cookies.remove('auth_token')
        }
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await axiosInstance.post('/login', { email, password })
    const { access_token, user } = response.data
    
    Cookies.set('auth_token', access_token, { expires: 7 })
    setUser(user)
    
    // Redirect based on role
    if (user.roles.some((role: any) => role.name === 'Super Admin')) {
      router.push('/admin/loans')
    } else {
      router.push('/dashboard')
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    role: string = 'Applicant'
  ) => {
    const response = await axiosInstance.post('/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      role
    })
    const { access_token, user } = response.data
    
    Cookies.set('auth_token', access_token, { expires: 7 })
    setUser(user)
    
    if (user.roles.some((role: any) => role.name === 'Super Admin')) {
      router.push('/admin/loans')
    } else {
      router.push('/dashboard')
    }
  }

  const logout = async () => {
    try {
      await axiosInstance.post('/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      Cookies.remove('auth_token')
      setUser(null)
      router.push('/login')
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.roles.some(role => role.name === 'Super Admin')) return true
    return user.permissions.some(perm => perm.name === permission)
  }

  const hasRole = (role: string): boolean => {
    if (!user) return false
    return user.roles.some(r => r.name === role)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
