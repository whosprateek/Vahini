"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Lock, 
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  UserPlus,
  LogIn
} from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { SignUpForm } from "@/components/auth/signup-form"
import { ManageAccount } from "@/components/auth/manage-account"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { API_BASE_URL, fetchJson } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export function Settings() {
  const [activeAuthView, setActiveAuthView] = useState("login")
  const { toast } = useToast()
  const { isDemo } = useAuth()

  type SettingsState = { twoFactorEnabled: boolean; systemAlerts: boolean; maintenanceUpdates: boolean }
  const [settings, setSettings] = useState<SettingsState | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchJson<{ settings: SettingsState }>(`${API_BASE_URL}/settings/me`).then(d => {
      if (mounted) setSettings(d.settings)
    }).catch(() => setSettings({ twoFactorEnabled: false, systemAlerts: true, maintenanceUpdates: true })).finally(()=>setLoading(false))
    return () => { mounted = false }
  }, [])

  async function patchSettings(patch: Partial<SettingsState>) {
    const d = await fetchJson<{ settings: SettingsState }>(`${API_BASE_URL}/settings/me`, { method: 'PATCH', body: JSON.stringify(patch) })
    setSettings(d.settings)
    toast({ title: 'Settings updated' })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Settings Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Settings</h2>
            <p className="text-purple-100 dark:text-purple-200">
              Manage your account, preferences, and system configuration
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <SettingsIcon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {isDemo && (
        <div className="p-3 rounded-lg border bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200 border-amber-300 dark:border-amber-800">
          Demo mode: Some account and security settings are disabled.
        </div>
      )}
      <Tabs defaultValue="authentication" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="authentication" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Authentication Tab */}
        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChangePasswordDialog />
              <div className="flex gap-4 mb-6">
                <Button
                  variant={activeAuthView === "login" ? "default" : "outline"}
                  onClick={() => setActiveAuthView("login")}
                  className="flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
                <Button
                  variant={activeAuthView === "signup" ? "default" : "outline"}
                  onClick={() => setActiveAuthView("signup")}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Button>
                <Button
                  variant={activeAuthView === "manage" ? "default" : "outline"}
                  onClick={() => setActiveAuthView("manage")}
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Manage Account
                </Button>
              </div>

              {activeAuthView === "login" && <LoginForm />}
              {activeAuthView === "signup" && <SignUpForm />}
              {activeAuthView === "manage" && <ManageAccount />}
              {isDemo && <div className="text-xs text-muted-foreground mt-2">Note: In demo mode, password changes are disabled.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Off</span>
                    <Switch disabled={isDemo} checked={!!settings?.twoFactorEnabled} onCheckedChange={(v) => !isDemo && patchSettings({ twoFactorEnabled: !!v })} />
                    <span className="text-sm">On</span>
                  </div>
                </div>
                {!isDemo && <SessionDialog />}
                {!isDemo && <ApiKeysDialog />}
                {isDemo && <div className="text-xs text-muted-foreground">Session management and API keys are disabled in demo.</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-500" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">System Alerts</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications for system issues</p>
                  </div>
                  <Switch checked={!!settings?.systemAlerts} onCheckedChange={(v)=>patchSettings({ systemAlerts: !!v })} />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Maintenance Updates</h4>
                    <p className="text-sm text-muted-foreground">Get notified about scheduled maintenance</p>
                  </div>
                  <Switch checked={!!settings?.maintenanceUpdates} onCheckedChange={(v)=>patchSettings({ maintenanceUpdates: !!v })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-500" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Dark Mode</h4>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
                  </div>
                  <Button variant="outline">Toggle Theme</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Dashboard Layout</h4>
                    <p className="text-sm text-muted-foreground">Customize dashboard arrangement</p>
                  </div>
                  <Button variant="outline">Customize</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Regional Settings</h4>
                    <p className="text-sm text-muted-foreground">Configure timezone and regional preferences</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Data Export</h4>
                    <p className="text-sm text-muted-foreground">Export system data and reports</p>
                  </div>
                  <Button variant="outline">Export Data</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">System Health</h4>
                    <p className="text-sm text-muted-foreground">View system diagnostics and performance</p>
                  </div>
                  <Button variant="outline">View Health</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ChangePasswordDialog() {
  const [open, setOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { toast } = useToast()
  const { isDemo } = useAuth()
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return }
    try {
      await fetchJson(`${API_BASE_URL}/auth/change-password`, { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) })
      toast({ title: 'Password changed' })
      setOpen(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    } catch (err) {
      toast({ title: 'Failed to change password', description: (err as Error).message, variant: 'destructive' })
    }
  }
  return (
    <Dialog open={open} onOpenChange={(v)=>!isDemo && setOpen(v)}>
      <DialogTrigger asChild><Button variant="outline" disabled={isDemo} title={isDemo ? 'Disabled in demo' : undefined}>Change Password</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <Label>Current Password</Label>
            <Input type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} required />
          </div>
          <div>
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required />
          </div>
          <div className="pt-2 text-right"><Button type="submit">Save</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SessionDialog() {
  const [open, setOpen] = useState(false)
  const [info, setInfo] = useState<any | null>(null)
  const { toast } = useToast()
  async function load() {
    try {
      const d = await fetchJson<{ session: any }>(`${API_BASE_URL}/auth/session`)
      setInfo(d.session)
    } catch (e) {
      toast({ title: 'Failed to load session', description: (e as Error).message, variant: 'destructive' })
    }
  }
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <h4 className="font-medium">Session Management</h4>
        <p className="text-sm text-muted-foreground">Manage active sessions and devices</p>
      </div>
      <Dialog open={open} onOpenChange={(v)=>{setOpen(v); if (v) load()}}>
        <DialogTrigger asChild><Button variant="outline">View Sessions</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Current Session</DialogTitle></DialogHeader>
          <div className="text-sm space-y-1">
            {info ? (
              <>
                <div><span className="font-medium">Issued At:</span> {new Date(info.iat * 1000).toLocaleString()}</div>
                <div><span className="font-medium">Expires At:</span> {new Date(info.exp * 1000).toLocaleString()}</div>
                <div><span className="font-medium">Now:</span> {new Date().toLocaleString()}</div>
              </>
            ) : (
              <div>Loading…</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ApiKeysDialog() {
  const [open, setOpen] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [keys, setKeys] = useState<{ id: string; lastFour: string; createdAt: string; revokedAt?: string }[]>([])

  async function load() {
    try {
      const d = await fetchJson<{ keys: any[] }>(`${API_BASE_URL}/api-keys`)
      setKeys(d.keys)
    } catch {}
  }
  async function generate() {
    try {
      const d = await fetchJson<{ apiKey: any }>(`${API_BASE_URL}/api-keys`, { method: 'POST' })
      setNewKey(d.apiKey.key)
      await load()
    } catch {}
  }
  async function revoke(id: string) {
    try {
      await fetchJson(`${API_BASE_URL}/api-keys/revoke`, { method: 'POST', body: JSON.stringify({ id }) })
      await load()
    } catch {}
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <h4 className="font-medium">API Keys</h4>
        <p className="text-sm text-muted-foreground">Generate and manage API keys</p>
      </div>
      <Dialog open={open} onOpenChange={(v)=>{ setOpen(v); if (v) load() }}>
        <DialogTrigger asChild><Button variant="outline">Manage Keys</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>API Keys</DialogTitle></DialogHeader>
          <div className="text-sm space-y-3">
            <Button variant="outline" onClick={generate}>Generate New Key</Button>
            {newKey && <div className="mt-2"><span className="font-medium">New Key:</span> <code className="break-all">{newKey}</code></div>}
            <div className="border-t pt-2">
              <div className="text-xs text-muted-foreground mb-1">Your keys</div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {keys.map(k => (
                  <div key={k.id} className="flex items-center justify-between p-2 border rounded">
                    <div>…{k.lastFour} <span className="text-xs text-muted-foreground">({new Date(k.createdAt).toLocaleString()})</span> {k.revokedAt && <span className="text-xs text-red-600">revoked</span>}</div>
                    {!k.revokedAt && <Button variant="outline" size="sm" onClick={()=>revoke(k.id)}>Revoke</Button>}
                  </div>
                ))}
                {keys.length === 0 && <div className="text-xs text-muted-foreground">No keys</div>}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Note: Demo-only; store securely in your own secret manager.</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
