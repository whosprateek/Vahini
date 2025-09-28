"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin,
  Calendar,
  Shield,
  Key,
  Bell,
  Camera,
  Save,
  AlertCircle,
  CheckCircle,
  Trash2,
  RefreshCw
} from "lucide-react"

export function ManageAccount() {
  const [isLoading, setIsLoading] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: "" })

  // Mock user data
  const [userData, setUserData] = useState({
    firstName: "John",
    lastName: "Doe", 
    email: "john.doe@powergrid.com",
    phone: "+1 (555) 123-4567",
    organization: "Power Grid Corporation",
    role: "Grid Operator",
    department: "Operations",
    location: "New York, NY",
    joinDate: "January 15, 2023",
    employeeId: "PGC-2023-001",
    profileImage: ""
  })

  const [notifications, setNotifications] = useState({
    systemAlerts: true,
    maintenanceNotifications: true,
    emailDigest: false,
    smsAlerts: true,
    emergencyNotifications: true
  })

  const [sessions] = useState([
    { id: 1, device: "Chrome on Windows", location: "New York, NY", lastActive: "5 minutes ago", current: true },
    { id: 2, device: "Mobile App - iOS", location: "New York, NY", lastActive: "2 hours ago", current: false },
    { id: 3, device: "Chrome on MacOS", location: "Remote Office", lastActive: "1 day ago", current: false }
  ])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setUpdateStatus({ type: null, message: "" })

    // Simulate API call
    setTimeout(() => {
      setUpdateStatus({
        type: 'success',
        message: 'Profile updated successfully!'
      })
      setIsLoading(false)
    }, 1500)
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleUserDataChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userData.profileImage} alt={`${userData.firstName} ${userData.lastName}`} />
                <AvatarFallback className="text-xl font-semibold">
                  {userData.firstName[0]}{userData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {userData.firstName} {userData.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{userData.role} • {userData.organization}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {userData.joinDate}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  ID: {userData.employeeId}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={userData.firstName}
                      onChange={(e) => handleUserDataChange("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={userData.lastName}
                      onChange={(e) => handleUserDataChange("lastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      onChange={(e) => handleUserDataChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={userData.phone}
                      onChange={(e) => handleUserDataChange("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization" className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Organization
                    </Label>
                    <Input
                      id="organization"
                      value={userData.organization}
                      onChange={(e) => handleUserDataChange("organization", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={userData.role} onValueChange={(value) => handleUserDataChange("role", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grid Operator">Grid Operator</SelectItem>
                        <SelectItem value="Field Technician">Field Technician</SelectItem>
                        <SelectItem value="Control Room Operator">Control Room Operator</SelectItem>
                        <SelectItem value="Maintenance Engineer">Maintenance Engineer</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="System Analyst">System Analyst</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={userData.department}
                      onChange={(e) => handleUserDataChange("department", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={userData.location}
                      onChange={(e) => handleUserDataChange("location", e.target.value)}
                    />
                  </div>
                </div>

                {updateStatus.type && (
                  <Alert className={updateStatus.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                    {updateStatus.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <AlertDescription className={updateStatus.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                      {updateStatus.message}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Password & Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                  </div>
                  <Button variant="outline">
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Disabled</Badge>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Account Recovery</h4>
                    <p className="text-sm text-muted-foreground">Set up recovery options</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
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
              <CardDescription>
                Choose how you want to be notified about system events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: 'systemAlerts', label: 'System Alerts', description: 'Critical system failures and outages' },
                  { key: 'maintenanceNotifications', label: 'Maintenance Notifications', description: 'Scheduled maintenance and updates' },
                  { key: 'emailDigest', label: 'Daily Email Digest', description: 'Summary of daily activities and reports' },
                  { key: 'smsAlerts', label: 'SMS Alerts', description: 'Emergency notifications via text message' },
                  { key: 'emergencyNotifications', label: 'Emergency Notifications', description: 'Immediate alerts for critical situations' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.label}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(value) => handleNotificationChange(item.key, value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage your active sessions and devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${session.current ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <h4 className="font-medium">{session.device}</h4>
                        <p className="text-sm text-muted-foreground">
                          {session.location} • {session.lastActive}
                          {session.current && <Badge variant="secondary" className="ml-2">Current</Badge>}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                        Terminate
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
