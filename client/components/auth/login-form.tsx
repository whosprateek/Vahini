"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle,
  CheckCircle,
  LogIn
} from "lucide-react"

export function LoginForm() {
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false
  })
  const [loginStatus, setLoginStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: "" })

  const handleInputChange = (field: string, value: string | boolean) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginStatus({ type: null, message: "" })

    if (!loginData.email || !loginData.password) {
      setLoginStatus({
        type: 'error',
        message: 'Please fill in all required fields.'
      })
      return
    }

    try {
      const success = await login(loginData.email, loginData.password, loginData.rememberMe)
      
      if (success) {
        setLoginStatus({
          type: 'success',
          message: 'Login successful! Welcome to Power Grid Monitor.'
        })
        router.push('/dashboard')
      } else {
        setLoginStatus({
          type: 'error',
          message: 'Invalid email or password. Please try again.'
        })
      }
    } catch (error) {
      setLoginStatus({
        type: 'error',
        message: 'An error occurred during login. Please try again.'
      })
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Sign in to access the Power Grid Monitoring System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@powergrid.com"
                value={loginData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="h-12"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginData.password}
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

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rememberMe"
                checked={loginData.rememberMe}
                onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
              />
              <Label 
                htmlFor="rememberMe" 
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Remember me for 30 days
              </Label>
            </div>

            {/* Status Alert */}
            {loginStatus.type && (
              <Alert className={loginStatus.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                {loginStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <AlertDescription className={loginStatus.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {loginStatus.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </div>
              )}
            </Button>
          </form>

          {/* Additional Options */}
          <div className="space-y-4">
            <div className="text-center">
              <a href="/forgot-password" className="text-blue-600 hover:text-blue-800 p-0 underline">
                Forgot your password?
              </a>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-gray-500">Demo Credentials</span>
              </div>
            </div>

            <div className="text-center space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Email:</strong> admin@powergrid.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
