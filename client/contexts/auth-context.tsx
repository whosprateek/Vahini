"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { API_BASE_URL, fetchJson } from '@/lib/api'
import { setToken, clearToken, getToken } from '@/lib/auth-token'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isDemo: boolean
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>
  loginDemo: () => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemo, setIsDemo] = useState<boolean>(false)

  // Check for existing session on mount via backend (using JWT header)
  useEffect(() => {
    let cancelled = false
    async function loadSession() {
      try {
        // Only try if we have a token stored
        const token = typeof window !== 'undefined' ? getToken() : null
        if (!token) {
          if (!cancelled) setUser(null)
        } else {
          const data = await fetchJson<{ user: User }>(`${API_BASE_URL}/auth/me`, { method: 'GET' })
          if (!cancelled) setUser(data.user)
        }
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) {
          const flag = typeof window !== 'undefined' ? window.localStorage.getItem('VAHINI_DEMO') === '1' : false
          setIsDemo(flag || (user?.email === 'guest@vahini.local'))
          setIsLoading(false)
        }
      }
    }
    loadSession()
    return () => { cancelled = true }
  }, [user?.email])

  const login = async (email: string, password: string, rememberMe: boolean): Promise<boolean> => {
    setIsLoading(true)
    try {
      const data = await fetchJson<{ user: User, token: string }>(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe }),
      })
      setToken(data.token, rememberMe)
      setUser(data.user)
      if (typeof window !== 'undefined') {
        const demo = data.user.email === 'guest@vahini.local'
        window.localStorage.setItem('VAHINI_DEMO', demo ? '1' : '0')
        setIsDemo(demo)
      }
      return true
    } catch (e) {
      setUser(null)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const loginDemo = async (): Promise<boolean> => {
    const email = 'guest@vahini.local'
    const password = 'guest-demo-123'
    // Try login first
    let ok = await login(email, password, false)
    if (ok) return true
    // Attempt register then login
    try {
      await fetchJson(`${API_BASE_URL}/auth/register`, { method: 'POST', body: JSON.stringify({ email, password, firstName: 'Guest', lastName: 'User', role: 'user' }) })
    } catch {}
    ok = await login(email, password, false)
    return ok
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await fetchJson(`${API_BASE_URL}/auth/logout`, { method: 'POST' })
    } finally {
      clearToken()
      if (typeof window !== 'undefined') window.localStorage.setItem('VAHINI_DEMO','0')
      setIsDemo(false)
      setUser(null)
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isDemo,
    login,
    loginDemo,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
