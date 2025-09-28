"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import VahiniLogo from "@/components/brand-logo"
export default function SiteNav() {
  const { isAuthenticated, user, logout, isDemo } = useAuth()

  const handleLogout = async () => {
    await logout()
    toast.success("Logged out")
  }

  return (
    <nav className="w-full border-b border-white/20 backdrop-blur bg-white/40 dark:bg-slate-900/40 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Vahini home">
          <VahiniLogo className="w-8 h-8" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Vahini — LT Grid Intelligence</span>
          {isDemo && <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] bg-amber-500/20 text-amber-700 border border-amber-400/50">Demo</span>}
        </Link>
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Button asChild size="sm"><Link href="/login">Login</Link></Button>
              <Button asChild size="sm" variant="outline" className="border-blue-600 text-blue-700 dark:text-blue-300"><Link href="/register">Register</Link></Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost"><Link href="/dashboard">Dashboard</Link></Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">{user?.name || user?.email || 'Account'}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
