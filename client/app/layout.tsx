import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Suspense } from "react"
import SiteNav from "@/components/site-nav"
import { Toaster } from "@/components/ui/sonner"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { LinesProvider } from "@/contexts/lines-context"

export const metadata: Metadata = {
  title: "Vahini — LT Grid Intelligence",
  description: "Vahini is an intelligent LT grid operations platform for real-time monitoring, analytics, and maintenance.",
  generator: "Vahini",
  keywords: ["Vahini", "LT lines", "power grid", "analytics", "maintenance", "SCADA"],
  applicationName: "Vahini",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased font-sans`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <NotificationsProvider>
              <LinesProvider>
                <AuthProvider>
                  <SiteNav />
                  {children}
                  <Toaster richColors />
                </AuthProvider>
              </LinesProvider>
            </NotificationsProvider>
          </ThemeProvider>
        </Suspense>
        {process.env.NODE_ENV === 'production' ? <Analytics /> : null}
      </body>
    </html>
  )
}
