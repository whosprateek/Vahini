"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User,
  Building,
  Phone,
  AlertCircle,
  CheckCircle,
  UserPlus
} from "lucide-react"
import { API_BASE_URL, fetchJson } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export function SignUpForm() {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    role: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    receiveUpdates: false
  })
  const [signupStatus, setSignupStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: "" })

  const handleInputChange = (field: string, value: string | boolean) => {
    setSignupData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSignupStatus({ type: null, message: "" })

    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      setSignupStatus({
        type: 'error',
        message: 'Passwords do not match.'
      })
      setIsLoading(false)
      return
    }

    if (!signupData.acceptTerms) {
      setSignupStatus({
        type: 'error',
        message: 'Please accept the Terms of Service to continue.'
      })
      setIsLoading(false)
      return
    }

    try {
      const payload: any = {
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: signupData.password,
      }
      if (signupData.role) payload.role = signupData.role
      // Optional extra fields could be saved later if the schema includes them
      await fetchJson(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setSignupStatus({ type: 'success', message: 'Account created successfully! You can now sign in.' })
      // Redirect to login instead of auto-login
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = '/login'
        }, 600)
      }
      setSignupData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        organization: "",
        role: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
        receiveUpdates: false
      })
    } catch (err: any) {
      setSignupStatus({ type: 'error', message: err?.message || 'Failed to create account.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Join the Power Grid Monitoring System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <User className="w-4 h-4" />
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={signupData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <User className="w-4 h-4" />
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={signupData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="h-12"
                  required
                />
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  value={signupData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={signupData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            {/* Organization and Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organization" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Building className="w-4 h-4" />
                  Organization
                </Label>
                <Input
                  id="organization"
                  type="text"
                  placeholder="Power Grid Corporation"
                  value={signupData.organization}
                  onChange={(e) => handleInputChange("organization", e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <User className="w-4 h-4" />
                  Role
                </Label>
                <Select onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid-operator">Grid Operator</SelectItem>
                    <SelectItem value="field-technician">Field Technician</SelectItem>
                    <SelectItem value="control-room">Control Room Operator</SelectItem>
                    <SelectItem value="maintenance">Maintenance Engineer</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="analyst">System Analyst</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Lock className="w-4 h-4" />
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={signupData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="h-12 pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Lock className="w-4 h-4" />
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="h-12 pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="acceptTerms"
                  checked={signupData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                />
                <Label 
                  htmlFor="acceptTerms" 
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  I agree to the <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">Terms of Service</Button> and <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">Privacy Policy</Button> *
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="receiveUpdates"
                  checked={signupData.receiveUpdates}
                  onCheckedChange={(checked) => handleInputChange("receiveUpdates", checked as boolean)}
                />
                <Label 
                  htmlFor="receiveUpdates" 
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Send me system updates and maintenance notifications
                </Label>
              </div>
            </div>

            {/* Status Alert */}
            {signupStatus.type && (
              <Alert className={signupStatus.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                {signupStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <AlertDescription className={signupStatus.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {signupStatus.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </div>
              )}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?
            <a href="/login" className="text-blue-600 hover:text-blue-800 p-0 ml-1 underline">
              Sign in here
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
