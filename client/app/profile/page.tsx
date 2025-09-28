"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { API_BASE_URL, fetchJson } from "@/lib/api"
import { useNotifications } from "@/contexts/notifications-context"

interface Attendance { id: string; type: 'in'|'out'; timestamp: string }

export default function ProfilePage() {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const router = useRouter()
  const { addNotification } = useNotifications()

  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login')
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    let mounted = true
    if (isAuthenticated) {
      fetchJson<{ attendance: Attendance[] }>(`${API_BASE_URL}/attendance/me`).then((d) => {
        if (mounted) setAttendance(d.attendance)
      }).catch(() => {})
    }
    return () => { mounted = false }
  }, [isAuthenticated])

  async function punch(type: 'in'|'out') {
    setBusy(true)
    try {
      const d = await fetchJson<{ attendance: Attendance }>(`${API_BASE_URL}/attendance/punch`, { method: 'POST', body: JSON.stringify({ type }) })
      setAttendance((prev) => [d.attendance, ...prev])
      addNotification({ type: 'info', title: `Attendance ${type === 'in' ? 'Punch In' : 'Punch Out'}`, message: new Date(d.attendance.timestamp).toLocaleString() })
    } catch (e) {
      addNotification({ type: 'warning', title: 'Attendance failed', message: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  if (isLoading) return (
    <div className="min-h-screen grid place-items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
    </div>
  )

  if (!isAuthenticated) return null

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-500">Name</div>
            <div className="font-medium">{user?.name || '—'}</div>
            <div className="text-gray-500">Email</div>
            <div className="font-medium">{user?.email}</div>
            <div className="text-gray-500">Role</div>
            <div className="font-medium">{user?.role}</div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
            <Button variant="destructive" onClick={logout}>Logout</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
          <CardDescription>Punch in/out and view recent logs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button onClick={() => punch('in')} disabled={busy}>Punch In</Button>
            <Button variant="outline" onClick={() => punch('out')} disabled={busy}>Punch Out</Button>
          </div>
          <div className="text-sm text-muted-foreground">Recent</div>
          <ul className="space-y-1 text-sm">
            {attendance.map(a => (
              <li key={a.id} className="flex justify-between">
                <span className="capitalize">{a.type}</span>
                <span>{new Date(a.timestamp).toLocaleString()}</span>
              </li>
            ))}
            {attendance.length === 0 && (
              <li className="text-muted-foreground">No attendance logs yet.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
