"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { API_BASE_URL, fetchJson } from "@/lib/api"
import { setToken, clearToken, getToken } from "@/lib/auth-token"

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
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemo, setIsDemo] = useState<boolean>(false)

  // Load session once on mount
  useEffect(() => {
    let cancelled = false

    async function loadSession() {
      try {
        const token = typeof window !== "undefined" ? getToken() : null
        if (!token) {
          if (!cancelled) setUser(null)
        } else {
          const data = await fetchJson<{ user: User }>(`${API_BASE_URL}/auth/me`, {
            method: "GET"
          })
          if (!cancelled) setUser(data.user)
        }
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) {
          setIsDemo(false)
          setIsLoading(false)
        }
      }
    }

    loadSession()
    return () => {
      cancelled = true
    }
  }, [])

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean
  ): Promise<boolean> => {
    setIsLoading(true)
    try {
      const data = await fetchJson<{ user: User; token: string }>(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",
          body: JSON.stringify({ email, password, rememberMe })
        }
      )

      setToken(data.token, rememberMe)
      setUser(data.user)
      setIsDemo(false)
      return true
    } catch {
      setUser(null)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const loginDemo = async (): Promise<boolean> => {
    if (typeof window !== "undefined") {
      localStorage.setItem("VAHINI_DEMO", "1")
    }
    setIsDemo(true)
    return true
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await fetchJson(`${API_BASE_URL}/auth/logout`, { method: "POST" })
    } finally {
      clearToken()
      if (typeof window !== "undefined") {
        localStorage.setItem("VAHINI_DEMO", "0")
      }
      setIsDemo(false)
      setUser(null)
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isDemo,
    login,
    loginDemo,
    logout,
    isLoading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
