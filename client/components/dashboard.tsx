"use client"

import { cn } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Activity,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  ArrowUp,
  ArrowDown,
  BarChart3,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useLines } from "@/contexts/lines-context"
import { useNotifications } from "@/contexts/notifications-context"
import { useAuth } from "@/contexts/auth-context"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { API_BASE_URL, fetchJson } from "@/lib/api"

interface DashboardProps {
  selectedRegion: string
  activeView: string
}

const getRegionData = (region: string) => {
  const regionData = {
    all: {
      totalLines: "127",
      activeLines: "124",
      faultedLines: "3",
      powerLoad: "85.2%",
      uptime: "97.6%",
      systemHealth: [
        { name: "Transformer Health", value: 94, status: "good" },
        { name: "Line Integrity", value: 87, status: "warning" },
        { name: "Protection Systems", value: 98, status: "good" },
        { name: "Communication", value: 96, status: "good" },
      ],
      lineStatusData: [
        { id: "LT-001", voltage: "230V", current: "45A", status: "active", load: "78%" },
        { id: "LT-002", voltage: "230V", current: "52A", status: "active", load: "85%" },
        { id: "LT-003", voltage: "0V", current: "0A", status: "fault", load: "0%" },
        { id: "LT-004", voltage: "230V", current: "38A", status: "active", load: "65%" },
        { id: "LT-005", voltage: "230V", current: "42A", status: "active", load: "72%" },
        { id: "LT-006", voltage: "0V", current: "0A", status: "maintenance", load: "0%" },
        { id: "LT-007", voltage: "0V", current: "0A", status: "fault", load: "0%" },
        { id: "LT-008", voltage: "230V", current: "48A", status: "active", load: "82%" },
      ],
    },
    north: {
      totalLines: "32",
      activeLines: "31",
      faultedLines: "1",
      powerLoad: "78.4%",
      uptime: "96.9%",
      systemHealth: [
        { name: "Transformer Health", value: 96, status: "good" },
        { name: "Line Integrity", value: 92, status: "good" },
        { name: "Protection Systems", value: 99, status: "good" },
        { name: "Communication", value: 94, status: "good" },
      ],
      lineStatusData: [
        { id: "NT-001", voltage: "230V", current: "42A", status: "active", load: "75%" },
        { id: "NT-002", voltage: "230V", current: "38A", status: "active", load: "68%" },
        { id: "NT-003", voltage: "0V", current: "0A", status: "fault", load: "0%" },
        { id: "NT-004", voltage: "230V", current: "45A", status: "active", load: "80%" },
        { id: "NT-005", voltage: "230V", current: "40A", status: "active", load: "72%" },
        { id: "NT-006", voltage: "230V", current: "44A", status: "active", load: "78%" },
        { id: "NT-007", voltage: "230V", current: "39A", status: "active", load: "70%" },
        { id: "NT-008", voltage: "230V", current: "46A", status: "active", load: "82%" },
      ],
    },
    east: {
      totalLines: "28",
      activeLines: "27",
      faultedLines: "1",
      powerLoad: "82.1%",
      uptime: "96.4%",
      systemHealth: [
        { name: "Transformer Health", value: 91, status: "warning" },
        { name: "Line Integrity", value: 88, status: "warning" },
        { name: "Protection Systems", value: 97, status: "good" },
        { name: "Communication", value: 95, status: "good" },
      ],
      lineStatusData: [
        { id: "ET-001", voltage: "230V", current: "48A", status: "active", load: "85%" },
        { id: "ET-002", voltage: "230V", current: "52A", status: "active", load: "92%" },
        { id: "ET-003", voltage: "230V", current: "44A", status: "active", load: "78%" },
        { id: "ET-004", voltage: "230V", current: "46A", status: "active", load: "82%" },
        { id: "ET-005", voltage: "230V", current: "50A", status: "active", load: "88%" },
        { id: "ET-006", voltage: "230V", current: "46A", status: "active", load: "82%" },
        { id: "ET-007", voltage: "230V", current: "49A", status: "active", load: "87%" },
        { id: "ET-008", voltage: "230V", current: "47A", status: "active", load: "84%" },
      ],
    },
    south: {
      totalLines: "35",
      activeLines: "34",
      faultedLines: "1",
      powerLoad: "89.7%",
      uptime: "97.1%",
      systemHealth: [
        { name: "Transformer Health", value: 93, status: "good" },
        { name: "Line Integrity", value: 85, status: "warning" },
        { name: "Protection Systems", value: 98, status: "good" },
        { name: "Communication", value: 97, status: "good" },
      ],
      lineStatusData: [
        { id: "ST-001", voltage: "230V", current: "55A", status: "active", load: "95%" },
        { id: "ST-002", voltage: "230V", current: "53A", status: "active", load: "92%" },
        { id: "ST-003", voltage: "230V", current: "51A", status: "active", load: "89%" },
        { id: "ST-004", voltage: "230V", current: "49A", status: "active", load: "86%" },
        { id: "ST-005", voltage: "0V", current: "0A", status: "fault", load: "0%" },
        { id: "ST-006", voltage: "230V", current: "52A", status: "active", load: "91%" },
        { id: "ST-007", voltage: "230V", current: "54A", status: "active", load: "94%" },
        { id: "ST-008", voltage: "230V", current: "50A", status: "active", load: "88%" },
      ],
    },
    west: {
      totalLines: "32",
      activeLines: "32",
      faultedLines: "0",
      powerLoad: "76.8%",
      uptime: "100%",
      systemHealth: [
        { name: "Transformer Health", value: 98, status: "good" },
        { name: "Line Integrity", value: 95, status: "good" },
        { name: "Protection Systems", value: 99, status: "good" },
        { name: "Communication", value: 98, status: "good" },
      ],
      lineStatusData: [
        { id: "WT-001", voltage: "230V", current: "35A", status: "active", load: "62%" },
        { id: "WT-002", voltage: "230V", current: "38A", status: "active", load: "68%" },
        { id: "WT-003", voltage: "230V", current: "42A", status: "active", load: "75%" },
        { id: "WT-004", voltage: "230V", current: "40A", status: "active", load: "71%" },
        { id: "WT-005", voltage: "230V", current: "36A", status: "active", load: "64%" },
        { id: "WT-006", voltage: "230V", current: "44A", status: "active", load: "78%" },
        { id: "WT-007", voltage: "230V", current: "41A", status: "active", load: "73%" },
        { id: "WT-008", voltage: "230V", current: "39A", status: "active", load: "69%" },
      ],
    },
  }

  return regionData[region as keyof typeof regionData] || regionData.all
}

const getMaintenanceData = (region: string) => {
  const maintenanceData = {
    all: [
      { month: "Jan", scheduled: 12, completed: 11, emergency: 3 },
      { month: "Feb", scheduled: 15, completed: 14, emergency: 2 },
      { month: "Mar", scheduled: 18, completed: 17, emergency: 4 },
      { month: "Apr", scheduled: 14, completed: 13, emergency: 1 },
      { month: "May", scheduled: 16, completed: 15, emergency: 2 },
      { month: "Jun", scheduled: 20, completed: 19, emergency: 3 },
    ],
    north: [
      { month: "Jan", scheduled: 3, completed: 3, emergency: 1 },
      { month: "Feb", scheduled: 4, completed: 4, emergency: 0 },
      { month: "Mar", scheduled: 5, completed: 4, emergency: 1 },
      { month: "Apr", scheduled: 3, completed: 3, emergency: 0 },
      { month: "May", scheduled: 4, completed: 4, emergency: 1 },
      { month: "Jun", scheduled: 5, completed: 5, emergency: 0 },
    ],
    east: [
      { month: "Jan", scheduled: 3, completed: 2, emergency: 1 },
      { month: "Feb", scheduled: 4, completed: 3, emergency: 1 },
      { month: "Mar", scheduled: 4, completed: 4, emergency: 2 },
      { month: "Apr", scheduled: 3, completed: 3, emergency: 0 },
      { month: "May", scheduled: 4, completed: 3, emergency: 1 },
      { month: "Jun", scheduled: 5, completed: 5, emergency: 1 },
    ],
    south: [
      { month: "Jan", scheduled: 4, completed: 4, emergency: 1 },
      { month: "Feb", scheduled: 5, completed: 5, emergency: 1 },
      { month: "Mar", scheduled: 6, completed: 6, emergency: 1 },
      { month: "Apr", scheduled: 5, completed: 4, emergency: 1 },
      { month: "May", scheduled: 5, completed: 5, emergency: 0 },
      { month: "Jun", scheduled: 6, completed: 6, emergency: 1 },
    ],
    west: [
      { month: "Jan", scheduled: 2, completed: 2, emergency: 0 },
      { month: "Feb", scheduled: 2, completed: 2, emergency: 0 },
      { month: "Mar", scheduled: 3, completed: 3, emergency: 0 },
      { month: "Apr", scheduled: 3, completed: 3, emergency: 0 },
      { month: "May", scheduled: 3, completed: 3, emergency: 0 },
      { month: "Jun", scheduled: 4, completed: 3, emergency: 1 },
    ],
  }

  return maintenanceData[region as keyof typeof maintenanceData] || maintenanceData.all
}

function pickColor(i: number) {
  const palette = ["#3b82f6", "#22c55e", "#ef4444", "#a855f7", "#06b6d4", "#f59e0b", "#10b981", "#e11d48"]
  return palette[i % palette.length]
}

function buildMergedHistory(lines: { id: string }[], selectedRegion: string, getHistory: any, getLineRegion: (id: string) => string) {
  // Build a merged time axis (numeric timestamps) with per-line series keyed by line.id
  const map: Record<number, any> = {}
  lines.forEach(l => {
    const reg = selectedRegion === 'all' ? getLineRegion(l.id) : selectedRegion
    const hist = getHistory(reg, l.id) as { t: number; power: number }[]
    hist.forEach(p => {
      const key = p.t
      if (!map[key]) {
        map[key] = { ts: p.t }
      }
      map[key][l.id] = p.power
    })
  })
  return Object.keys(map)
    .map(Number)
    .sort((a, b) => a - b)
    .map((k) => map[k])
}

function toCSV(rows: string[][]) {
  return rows.map(r => r.map(v => /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v).join(',')).join('\n')
}

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function computeTimeTicks(data: { ts: number }[], count = 6) {
  if (!data?.length) return [] as number[]
  let min = data[0].ts
  let max = data[0].ts
  for (let i = 1; i < data.length; i++) {
    const v = data[i].ts
    if (v < min) min = v
    if (v > max) max = v
  }
  if (max <= min) return [min]
  const step = Math.max(1, Math.floor((max - min) / (count - 1)))
  return Array.from({ length: count }, (_, i) => min + i * step)
}

function DownloadLineButton({ region, lineId }: { region: string; lineId: string }) {
  const { getHistory } = useLines()
  const onDownload = () => {
    const hist = getHistory(region as any, lineId)
    const rows = [["time","power(kW)"]].concat(
      hist.map(p => [new Date(p.t).toISOString(), String(p.power)])
    )
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${lineId}-history.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  return <Button size="sm" variant="outline" onClick={onDownload}>Download</Button>
}

function AnalysisButton({ region, lineId }: { region: string; lineId: string }) {
  const [open, setOpen] = useState(false)
  const { getHistory } = useLines()
const data = useMemo(() => {
    return getHistory(region as any, lineId).map(p => ({ ts: p.t, power: p.power }))
  }, [getHistory, region, lineId])
  const analysisTicks = useMemo(() => computeTimeTicks(data, 6), [data])
  const analysisData = useMemo(() => withSMA(data), [data])
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Analysis</Button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-semibold mb-2">History for {lineId}</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
<LineChart data={analysisData} margin={{ top: 10, right: 10, bottom: 16, left: 10 }}>
                  <XAxis dataKey="ts" type="number" scale="time" domain={["dataMin", "dataMax"]} ticks={analysisTicks} tickFormatter={formatTime} tick={{ fontSize: 11 }} tickMargin={8} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip wrapperStyle={{ outline: 'none', maxHeight: 240, overflowY: 'auto', pointerEvents: 'auto' }} cursor={{ stroke: '#64748b', strokeDasharray: 3 }} />
                  <Line type="monotone" name="Power" dataKey="power" stroke="#3b82f6" dot={false} strokeWidth={2} isAnimationActive={false} />
                  <Line type="monotone" name="SMA(5)" dataKey="sma" stroke="#10b981" dot={false} strokeWidth={2} strokeDasharray="4 4" isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <DownloadLineButton region={region} lineId={lineId} />
              <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function withSMA(data: { ts: number; power: number }[]) {
  const windowSize = 5
  const out = data.map((d, idx) => {
    const start = Math.max(0, idx - windowSize + 1)
    const slice = data.slice(start, idx + 1)
    const avg = slice.reduce((a, b) => a + (b.power || 0), 0) / slice.length
    return { ...d, sma: Math.round(avg) }
  })
  return out
}

export function Dashboard({ selectedRegion, activeView }: DashboardProps) {
  const { getLines, getLineRegion, startVoltage, stopVoltage, getHistory } = useLines()
  const { addNotification } = useNotifications()
  const { isDemo } = useAuth()
  const regionData = getRegionData(selectedRegion)
  const maintenanceData = getMaintenanceData(selectedRegion)

  const lines = useMemo(() => getLines(selectedRegion as any), [getLines, selectedRegion])

  // Memoize merged data used by charts to reduce rerenders lag
  const mergedAllData = useMemo(() => buildMergedHistory(lines, (selectedRegion as any), getHistory, getLineRegion), [lines, selectedRegion, getHistory, getLineRegion])
  const mergedRegionData = mergedAllData // same in this setup
  const mergedAllTicks = useMemo(() => computeTimeTicks(mergedAllData, 6), [mergedAllData])
  const mergedRegionTicks = useMemo(() => computeTimeTicks(mergedRegionData, 6), [mergedRegionData])
  
  const totals = useMemo(() => {
    const total = lines.length
    const active = lines.filter(l => l.status === 'active').length
    const faulted = lines.filter(l => l.status === 'fault').length
    const avgLoad = (() => {
      const nums = lines.map(l => parseFloat(l.load)).filter(n => Number.isFinite(n))
      if (!nums.length) return 0
      return Math.round(nums.reduce((a,b)=>a+b,0)/nums.length)
    })()
    return { total, active, faulted, powerLoad: `${avgLoad}%` }
  }, [lines])

  const teamMembers = [
    { name: "Prateek Sharma", role: "Grid Operator", status: "online", avatar: "PS" },
    { name: "Aditya Raj Singh", role: "Field Technician", status: "online", avatar: "AS" },
    { name: "Kartik", role: "Control Room", status: "online", avatar: "KT" },
    { name: "Himanshi", role: "Maintenance", status: "busy", avatar: "HM" },
    { name: "Daksh", role: "Engineer", status: "online", avatar: "DK" },
    { name: "Harshika", role: "Field Technician", status: "online", avatar: "HK" },
  ]

  const scheduledTasks = [
    { task: "Morning system check", status: "completed", time: "08:30" },
    { task: "LT-006 maintenance", status: "pending", time: "14:00 today" },
    { task: "Weekly load analysis", status: "pending", time: "Tomorrow" },
    { task: "Equipment calibration", status: "pending", time: "Friday" },
  ]

const topStats = [
    {
      label: "Total Lines",
      value: String(totals.total),
      change: "+2.5% from last month",
      trend: "up",
      icon: BarChart3,
    },
{
      label: "Active Lines",
      value: String(totals.active),
      change: `${regionData.uptime} operational`,
      trend: "up",
      icon: CheckCircle,
    },
{
      label: "Faulted Lines",
      value: String(totals.faulted),
      change: "Needs attention",
      trend: "down",
      icon: AlertTriangle,
    },
{ label: "Power Load", value: totals.powerLoad, change: "High demand", trend: "up", icon: Zap },
  ]

  const criticalAlerts = [
    {
      title: "Line LT-003 Power Outage",
      description: "Complete power failure detected on residential line serving 450 customers",
      priority: "HIGH PRIORITY",
      time: "2 minutes ago",
      zone: "Zone: Residential-A",
      actions: ["Dispatch Team", "View Details"],
      type: "power",
    },
    {
      title: "Line LT-007 Voltage Fluctuation",
      description: "Unstable voltage detected, ranging between 180V-250V",
      priority: "MEDIUM PRIORITY",
      time: "8 minutes ago",
      zone: "Zone: Commercial-B",
      actions: ["Investigate", "Monitor"],
      type: "voltage",
    },
    {
      title: "High Load Warning - Multiple Lines",
      description: "15 lines operating above 85% capacity during peak hours",
      priority: "LOW PRIORITY",
      time: "12 minutes ago",
      zone: "Zone: Mixed",
      actions: ["Load Balance", "Schedule"],
      type: "load",
    },
  ]

  if (activeView === "analytics") {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Load Distribution</h2>
              <p className="text-blue-100 dark:text-blue-200">
                Time vs Power across {selectedRegion === "all" ? "All Regions" : selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}
              </p>
            </div>
          </div>
        </div>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Time vs Power (All LT lines in region)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="pb-2 overflow-x-auto text-xs text-slate-300">
              <div className="inline-flex gap-4 whitespace-nowrap min-w-max pr-2">
                {lines.map((l, idx) => (
                  <div key={l.id} className="inline-flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: pickColor(idx) }} />
                    {l.id}
                  </div>
                ))}
              </div>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergedAllData} margin={{ top: 8, right: 16, bottom: 16, left: 10 }}>
                  <XAxis dataKey="ts" type="number" scale="time" domain={["dataMin", "dataMax"]} ticks={mergedAllTicks} tickFormatter={formatTime} tick={{ fontSize: 11, fill: '#94a3b8' }} tickMargin={8} interval="preserveStartEnd" minTickGap={20} axisLine={{ stroke: '#475569' }} tickLine={{ stroke: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#475569' }} tickLine={{ stroke: '#475569' }} />
<Tooltip wrapperStyle={{ outline: 'none', maxHeight: 240, overflowY: 'auto', pointerEvents: 'auto' }} cursor={{ stroke: '#64748b', strokeDasharray: 3 }} />
                  {lines.map((l, idx) => (
                    <Line key={l.id} type="monotone" dataKey={l.id} stroke={pickColor(idx)} dot={false} strokeWidth={2} isAnimationActive={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {topStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                      {stat.trend === "up" ? (
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>


      {/* Top Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {regionData.systemHealth.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="font-medium">{item.value}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      item.status === "good" && "bg-green-500",
                      item.status === "warning" && "bg-yellow-500",
                      item.status === "critical" && "bg-red-500",
                    )}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Team Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.role}</div>
                </div>
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    member.status === "online" && "bg-green-500",
                    member.status === "busy" && "bg-yellow-500",
                    member.status === "offline" && "bg-gray-400",
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Scheduled Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              Scheduled Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheduledTasks.map((task, index) => (
              <div key={index} className="flex items-center gap-3">
                {task.status === "completed" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Clock className="w-4 h-4 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{task.task}</div>
                  <div className="text-xs text-muted-foreground">Due: {task.time}</div>
                </div>
                <Badge variant={task.status === "completed" ? "default" : "secondary"}>{task.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Real-time Line Status
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Fault</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Maintenance</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {lines.map((line) => (
              <div
                key={line.id}
                className={`p-4 rounded-lg border-2 ${
                  line.status === "active"
                    ? "border-green-500 bg-green-500/10"
                    : line.status === "fault"
                      ? "border-red-500 bg-red-500/10"
                      : "border-yellow-500 bg-yellow-500/10"
                }`}
              >
                <div className="text-sm font-medium mb-2">{line.id}</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    {line.voltage} • {line.current}
                  </div>
                  <div>Load: {line.load}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-500/50">
        <CardHeader className="bg-red-500/10">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Critical Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {criticalAlerts.map((alert, index) => (
            <div key={index} className="p-4 border-b last:border-b-0 border-red-500/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {alert.type === "power" && <Zap className="w-4 h-4 text-red-500" />}
                    {alert.type === "voltage" && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                    {alert.type === "load" && <BarChart3 className="w-4 h-4 text-orange-500" />}
                    <h4 className="font-medium">{alert.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <Badge
                      variant={
                        alert.priority === "HIGH PRIORITY"
                          ? "destructive"
                          : alert.priority === "MEDIUM PRIORITY"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {alert.priority}
                    </Badge>
                    <span>{alert.time}</span>
                    <span>{alert.zone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>



      {/* LT Line Controls per selected region */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            LT Line Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lines.map((line) => (
              <Card key={line.id} className="bg-muted/10">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{line.id}</div>
                    <Badge variant={line.status === 'active' ? 'default' : line.status === 'fault' ? 'destructive' : 'secondary'} className="capitalize">{line.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{line.voltage} • {line.current} • Load {line.load}</div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={async () => {
                      const region = (selectedRegion as any) === 'all' ? getLineRegion(line.id) : (selectedRegion as any)
                      startVoltage(region, line.id)
                      addNotification({ type: 'success', title: 'Voltage Started', region, lineId: line.id })
                      if (!isDemo) { try { await fetchJson(`${API_BASE_URL}/notifications`, { method: 'POST', body: JSON.stringify({ type: 'success', title: 'Voltage Started', region, lineId: line.id }) }) } catch {} }
                    }}>Start Voltage</Button>
                    <Button size="sm" variant="outline" onClick={async () => {
                      const region = (selectedRegion as any) === 'all' ? getLineRegion(line.id) : (selectedRegion as any)
                      stopVoltage(region, line.id)
                      addNotification({ type: 'alert', title: 'Voltage Stopped', region, lineId: line.id })
                      if (!isDemo) { try { await fetchJson(`${API_BASE_URL}/notifications`, { method: 'POST', body: JSON.stringify({ type: 'alert', title: 'Voltage Stopped', region, lineId: line.id }) }) } catch {} }
                    }} className="border-red-500 text-red-600">Stop Voltage</Button>
                    <AnalysisButton region={(selectedRegion as any) === 'all' ? getLineRegion(line.id) : (selectedRegion as any)} lineId={line.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Load Distribution: Time vs Power for each LT line (single chart) */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Load Distribution (Time vs Power)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="pb-2 overflow-x-auto text-xs text-slate-600 dark:text-slate-300">
              <div className="inline-flex gap-4 whitespace-nowrap min-w-max pr-2">
                {lines.map((l, idx) => (
                  <div key={l.id} className="inline-flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: pickColor(idx) }} />
                    {l.id}
                  </div>
                ))}
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergedRegionData} margin={{ top: 8, right: 16, bottom: 16, left: 10 }}>
                  <XAxis dataKey="ts" type="number" scale="time" domain={["dataMin", "dataMax"]} ticks={mergedRegionTicks} tickFormatter={formatTime} tick={{ fontSize: 11, fill: '#94a3b8' }} tickMargin={8} interval="preserveStartEnd" minTickGap={20} axisLine={{ stroke: '#475569' }} tickLine={{ stroke: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#475569' }} tickLine={{ stroke: '#475569' }} />
<Tooltip wrapperStyle={{ outline: 'none', maxHeight: 240, overflowY: 'auto', pointerEvents: 'auto' }} cursor={{ stroke: '#64748b', strokeDasharray: 3 }} />
                  {lines.map((l, idx) => (
                    <Line key={l.id} type="monotone" dataKey={l.id} stroke={pickColor(idx)} dot={false} strokeWidth={2} isAnimationActive={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
