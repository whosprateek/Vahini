"use client"

import { Bell, Download, Sun, Moon, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import { useState, useMemo, useEffect } from "react"
import { getStations } from "@/lib/stations"
import { useLines } from "@/contexts/lines-context"
import { useNotifications } from "@/contexts/notifications-context"
import { toast } from "sonner"
import { API_BASE_URL, fetchJson } from "@/lib/api"

interface HeaderProps {
  selectedRegion: string
  onRegionChange: (region: string) => void
}

export function Header({ selectedRegion, onRegionChange }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { user, logout, isDemo } = useAuth()
  const { getLines } = useLines()
  const { notifications, markAllRead, clear } = useNotifications()

  const [stationId, setStationId] = useState<string>("")
  const [notifOpen, setNotifOpen] = useState(false)

  const stations = useMemo(() => getStations(selectedRegion), [selectedRegion])

  // Load unread notifications from backend when panel opens
  useEffect(() => {
    async function loadUnread() {
      try {
        const d = await fetchJson<{ notifications: any[] }>(`${API_BASE_URL}/notifications/unread`)
        clear()
        d.notifications.forEach(n => addNotification({ type: n.type, title: n.title, message: n.message, region: n.region, lineId: n.lineId }))
      } catch {}
    }
    if (notifOpen) loadUnread()
  }, [notifOpen])

  function downloadRegionReport() {
    const lines = getLines(selectedRegion as any)
    const headers = ["Line ID","Voltage","Current","Status","Load"]
    const rows = lines.map(l => [l.id, l.voltage, l.current, l.status, l.load])
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `region-${selectedRegion}-lines.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">⚡</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vahini</h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">LT Monitoring</span>
          {isDemo && <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-600 border border-amber-400/50">Demo</span>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Region Selector */}
        <Select value={selectedRegion} onValueChange={onRegionChange}>
          <SelectTrigger className="w-40 text-gray-900 dark:text-gray-100">
            <SelectValue className="text-gray-900 dark:text-gray-100" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Regions</SelectItem>
            <SelectItem value="north" className="text-gray-900 dark:text-gray-100">North Region</SelectItem>
            <SelectItem value="east" className="text-gray-900 dark:text-gray-100">East Region</SelectItem>
            <SelectItem value="south" className="text-gray-900 dark:text-gray-100">South Region</SelectItem>
            <SelectItem value="west" className="text-gray-900 dark:text-gray-100">West Region</SelectItem>
          </SelectContent>
        </Select>

        {/* Station dropdown for the selected region */}
        <Select value={stationId} onValueChange={(v) => {
          setStationId(v)
          const st = stations.find(s => s.id === v)
          if (st) toast.info(`${st.name} (${st.id}) — Zone ${st.zone}, ${st.voltage}`)
        }}>
          <SelectTrigger className="w-64 text-gray-900 dark:text-gray-100">
            <SelectValue placeholder="Select station in region" />
          </SelectTrigger>
          <SelectContent>
            {stations.map(s => (
              <SelectItem key={s.id} value={s.id} className="text-gray-900 dark:text-gray-100">
                {s.name} ({s.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" onClick={() => setNotifOpen(true)}>
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </Button>

        {/* Download report for current region */}
        <Button variant="ghost" size="icon" onClick={downloadRegionReport}>
          <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          )}
          <span className="sr-only text-gray-900 dark:text-gray-100">Toggle theme</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-white bg-blue-600">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm text-left hidden md:block">
                <div className="font-medium text-gray-900 dark:text-white">{user?.name || 'Admin User'}</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs capitalize">{user?.role || 'Administrator'}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isDemo ? 'Leave demo' : 'Sign out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Notifications Panel */}
      {notifOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setNotifOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute right-0 top-0 h-full w-96 bg-white dark:bg-slate-900 border-l border-slate-700 shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Notifications</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={async ()=>{ if (!isDemo) { try { await fetchJson(`${API_BASE_URL}/notifications/mark-all-read`, { method: 'POST' }) } catch {} } markAllRead() }} title={isDemo ? 'Disabled server call in demo' : undefined}>Mark all read</Button>
                <Button size="sm" variant="outline" onClick={clear}>Clear</Button>
              </div>
            </div>
            <div className="mb-3">
              <Button size="sm" className="w-full" onClick={downloadRegionReport}>Download current region report</Button>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[80vh] pr-2">
              {notifications.filter(n => !n.read).length === 0 && (
                <div className="text-sm text-muted-foreground">No unread notifications.</div>
              )}
              {notifications.filter(n => !n.read).map(n => (
                <div key={n.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{n.title}</div>
                    <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleTimeString()}</div>
                  </div>
                  {n.message && <div className="text-xs text-muted-foreground mt-1">{n.message}</div>}
                  {(n.region || n.lineId) && (
                    <div className="text-xs text-muted-foreground mt-1">{n.region ? `Region: ${n.region}` : ''} {n.lineId ? `• Line: ${n.lineId}` : ''}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
