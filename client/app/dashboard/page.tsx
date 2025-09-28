"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { LineStatusOverview } from "@/components/line-status-overview"
import { FaultDetection } from "@/components/fault-detection"
import { MaintenanceSchedule } from "@/components/maintenance-schedule"
import { GridMap } from "@/components/grid-map"
import { Settings } from "@/components/settings"
import { ScadaSimulator } from "@/components/scada-simulator"

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedRegion, setSelectedRegion] = useState("all")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background dark:bg-slate-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard selectedRegion={selectedRegion} activeView={activeView} />
      case "analytics":
        return <Dashboard selectedRegion={selectedRegion} activeView={activeView} />
      case "line-status":
        return <LineStatusOverview selectedRegion={selectedRegion} />
      case "fault-detection":
        return <FaultDetection />
      case "maintenance":
        return <MaintenanceSchedule />
      case "grid-map":
        return <GridMap />
      case "settings":
        return <Settings />
      case "scada-simulator":
        return <ScadaSimulator />
      default:
        return <Dashboard selectedRegion={selectedRegion} activeView={activeView} />
    }
  }

  return (
    <div className="w-full h-screen bg-background dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <Header selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}