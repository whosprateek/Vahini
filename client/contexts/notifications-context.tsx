"use client"

import React, { createContext, useCallback, useContext, useMemo, useState } from "react"

export type NotificationType = "alert" | "info" | "success" | "warning"

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message?: string
  region?: string
  lineId?: string
  createdAt: number
  read?: boolean
}

interface NotificationsContextType {
  notifications: AppNotification[]
  addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void
  markAllRead: () => void
  clear: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const addNotification = useCallback((n: Omit<AppNotification, "id" | "createdAt" | "read">) => {
    setNotifications((prev) => [
      { id: crypto.randomUUID(), createdAt: Date.now(), read: false, ...n },
      ...prev,
    ])
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clear = useCallback(() => setNotifications([]), [])

  const value = useMemo(() => ({ notifications, addNotification, markAllRead, clear }), [notifications, addNotification, markAllRead, clear])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider")
  return ctx
}