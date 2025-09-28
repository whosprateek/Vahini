"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, LayoutDashboard, Activity, TriangleAlert as AlertTriangle, Calendar, Map, ChartBar as BarChart3, Settings, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "line-status", label: "Line Status", icon: Activity },
    { id: "fault-detection", label: "Fault Detection", icon: AlertTriangle },
    { id: "maintenance", label: "Maintenance", icon: Calendar },
    { id: "grid-map", label: "Grid Map", icon: Map },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "scada-simulator", label: "SCADA Simulator", icon: Zap },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div
      className={cn(
        "bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800 border-r border-gray-200 dark:border-slate-700/50 overflow-y-auto h-full transition-all duration-300 shadow-lg dark:shadow-2xl",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700/50 bg-gradient-to-r from-transparent to-blue-50/50 dark:to-slate-800/50">
        {!collapsed && <span className="text-sm font-medium text-gray-900 dark:text-white">Navigation</span>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </Button>
      </div>

      <div className="p-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full justify-start mb-1 h-10 transition-all duration-200",
                collapsed ? "px-2" : "px-3",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("w-4 h-4", !collapsed && "mr-3")} />
              {!collapsed && <span className="text-gray-900 dark:text-white">{item.label}</span>}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
