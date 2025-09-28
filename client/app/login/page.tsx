"use client"

import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const { isAuthenticated, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Vahini Power Grid
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Advanced Monitoring & Management System
          </p>
          <div className="mt-4">
            <Link href="/" className="text-sm text-blue-600 hover:underline">Back to Home</Link>
          </div>
        </div>
        {isAuthenticated ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300">You are already signed in.</p>
            <div className="flex items-center justify-center gap-3">
              <Link className="text-blue-600 hover:underline" href="/dashboard">Go to Dashboard</Link>
              <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
            </div>
          </div>
        ) : (
          <>
            <LoginForm />
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Don9t have an account? <Link href="/register" className="text-blue-600 hover:underline">Create one</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
