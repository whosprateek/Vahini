"use client"

import { SignUpForm } from "@/components/auth/signup-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create your account</h1>
          <p className="text-gray-600 dark:text-gray-400">Join Vahini Power Grid Monitoring System</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
