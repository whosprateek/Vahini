"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, Activity, Zap, Lock, Server, Gauge, ArrowRight, BarChart3, Bell, Wrench } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, Tooltip, LineChart, Line, XAxis, YAxis } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { API_BASE_URL } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { isAuthenticated, loginDemo } = useAuth()
  const router = useRouter()
  const [apiUp, setApiUp] = useState<boolean | null>(null)
  const [latencyMs, setLatencyMs] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    async function ping() {
      try {
        const t0 = performance.now()
        const res = await fetch(`${API_BASE_URL}/health`)
        const t1 = performance.now()
        if (!cancelled) {
          setApiUp(res.ok)
          setLatencyMs(Math.round(t1 - t0))
        }
      } catch {
        if (!cancelled) {
          setApiUp(false)
          setLatencyMs(null)
        }
      }
    }
    ping()
    const id = setInterval(ping, 15000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  const series = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      name: `${i}`,
      value: 60 + Math.round(Math.sin(i / 2) * 10) + Math.round(Math.random() * 6),
    }))
  }, [])

  // Build mini time vs power preview data
  const miniData = useMemo(() => {
    const n = 18
    const now = Date.now()
    const step = 5 * 60 * 1000
    const make = (seed: number) => Array.from({ length: n }, (_, i) => {
      const ts = now - (n - 1 - i) * step
      const base = 50 + Math.sin((i + seed) / 3) * 8 + (seed % 5)
      return { ts, value: Math.round(base + (Math.random() * 6 - 3)) }
    })
    const l1 = make(1)
    const l2 = make(2)
    const l3 = make(3)
    const l4 = make(4)
    // merge to rows with keys L1..L4
    return l1.map((p, idx) => ({ ts: p.ts, L1: p.value, L2: l2[idx].value, L3: l3[idx].value, L4: l4[idx].value }))
  }, [])

  const miniTicks = useMemo(() => {
    if (!miniData.length) return [] as number[]
    const min = miniData[0].ts
    const max = miniData[miniData.length - 1].ts
    const count = 4
    const step = Math.max(1, Math.floor((max - min) / (count - 1)))
    return Array.from({ length: count }, (_, i) => min + i * step)
  }, [miniData])

  function fmtTime(ts: number) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.12),transparent_40%),linear-gradient(to_bottom_right,rgba(2,6,23,0.9),rgba(2,6,23,0.6))] text-white">
      {/* Status strip */}
      <section className="w-full border-b border-white/30 bg-white/30 dark:bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-4 text-xs text-gray-700 dark:text-gray-300">
          <span className="inline-flex items-center gap-2">
            <Server className="w-3.5 h-3.5" /> API: {apiUp === null ? 'checking…' : apiUp ? <span className="inline-flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500" /> up</span> : <span className="inline-flex items-center gap-1 text-red-600"><span className="w-2 h-2 rounded-full bg-red-500" /> down</span>}
            {latencyMs !== null && <span className="ml-2 px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-white/30">{latencyMs}ms</span>}
          </span>
          <span className="hidden sm:inline">Theme optimized UI • LT lines focus • Realtime-ready</span>
        </div>
      </section>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-teal-300">Vahini</h1>
          <p className="text-lg text-slate-200/90">Intelligent LT grid operations: real-time monitoring, fault analytics, and maintenance orchestration — all in one place.</p>
          <div className="flex gap-3">
            <Button asChild className="bg-sky-500 hover:bg-sky-600">
              <Link href="/register" className="inline-flex items-center gap-1">Get started <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" onClick={async ()=>{ const ok = await loginDemo(); if (ok) router.push('/dashboard?demo=1') }}>Live demo</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-slate-200"><BarChart3 className="w-4 h-4 text-sky-300" /> Analytics</div>
              <div className="text-slate-400">Time vs Power, per-line overlays, CSV download</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-slate-200"><Bell className="w-4 h-4 text-teal-300" /> Alerts</div>
              <div className="text-slate-400">Voltage start/stop, unread filtering, summaries</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-slate-200"><Wrench className="w-4 h-4 text-emerald-300" /> Maintenance</div>
              <div className="text-slate-400">Schedule, assign technicians, date/time picker</div>
            </div>
          </div>
        </div>
        <Card className="border-white/10 bg-white/5 p-6 shadow-xl group overflow-hidden">
          <CardHeader className="p-0"><CardTitle className="sr-only">Preview</CardTitle><CardDescription className="sr-only">Dashboard preview</CardDescription></CardHeader>
          <CardContent className="p-0">
            <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-sky-900/30 to-teal-900/20 relative overflow-hidden p-3">
              <div className="pb-2 overflow-x-auto text-xs text-slate-300 pointer-events-none">
                <div className="flex flex-wrap gap-3 min-w-max">
                  {['L1','L2','L3','L4'].map((id, idx) => (
                    <div key={id} className="inline-flex items-center gap-1 whitespace-nowrap">
                      <span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: ['#3b82f6','#22c55e','#ef4444','#a855f7'][idx] }} />
                      {id}
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-3 top-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={miniData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <XAxis dataKey="ts" type="number" scale="time" domain={["dataMin","dataMax"]} ticks={miniTicks} tickFormatter={fmtTime} tick={{ fontSize: 10, fill: '#93c5fd' }} axisLine={{ stroke: '#334155' }} tickLine={{ stroke: '#334155' }} />
                    <YAxis hide />
                    <Tooltip wrapperStyle={{ outline: 'none' }} labelFormatter={(v)=>fmtTime(v as number)} />
                    <Line type="monotone" dataKey="L1" stroke="#3b82f6" dot={false} strokeWidth={2} isAnimationActive={false} />
                    <Line type="monotone" dataKey="L2" stroke="#22c55e" dot={false} strokeWidth={2} isAnimationActive={false} />
                    <Line type="monotone" dataKey="L3" stroke="#ef4444" dot={false} strokeWidth={2} isAnimationActive={false} />
                    <Line type="monotone" dataKey="L4" stroke="#a855f7" dot={false} strokeWidth={2} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-300">Preview of dashboard analytics and LT line overlays. Explore real-time status, alerts, and maintenance scheduling.</p>
          </CardContent>
        </Card>
      </section>

      {/* Feature pillars */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Why Vahini</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {icon: Zap, title:'Collect', desc:'Ingest line currents and voltages from field devices in real-time.'},
            {icon: Activity, title:'Analyze', desc:'Classify events (Healthy, Overload, Short Circuit, Break) and alert ops.'},
            {icon: ShieldCheck, title:'Act', desc:'Dispatch teams, plan maintenance, and restore power faster.'},
          ].map(({icon:Icon,title,desc})=> (
            <Card key={title} className="border-white/10 bg-white/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="pb-2 flex flex-row items-center gap-2"><Icon className="w-4 h-4 text-sky-300" /><CardTitle className="text-base text-slate-100">{title}</CardTitle></CardHeader>
              <CardContent className="pt-0 text-sm text-slate-300/90">{desc}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Live previews */}
      <section className="max-w-6xl mx-auto px-4 pb-12 grid md:grid-cols-2 gap-6">
        <Card className="bg-white/60 dark:bg-slate-900/60 border-white/30">
          <CardHeader className="pb-2"><div className="flex items-center gap-2"><Gauge className="w-4 h-4 text-blue-600" /><CardTitle className="text-base">Load Trend (synthetic)</CardTitle></div><CardDescription>Illustrative sparkline showing changing LT line load</CardDescription></CardHeader>
          <CardContent className="pt-0 h-40">
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={series} margin={{left:0,right:0,top:10,bottom:0}}><defs><linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/></linearGradient></defs><Tooltip contentStyle={{fontSize:12}} cursor={{stroke:'#94a3b8',strokeDasharray:4}}/><Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLoad)"/></AreaChart></ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-2"><div className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-300" /><CardTitle className="text-base text-slate-100">Stability Index (preview)</CardTitle></div><CardDescription className="text-slate-300/80">Demo line</CardDescription></CardHeader>
          <CardContent className="pt-0 h-40">
            <ResponsiveContainer width="100%" height="100%"><LineChart data={series} margin={{left:0,right:0,top:10,bottom:0}}><Tooltip contentStyle={{fontSize:12}} cursor={{stroke:'#64748b',strokeDasharray:4}}/><Line type="monotone" dataKey="value" stroke="#10b981" dot={false} strokeWidth={2}/></LineChart></ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Security */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Security</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {icon: Lock, title:'Session & JWT', desc:'Secure cookies optional, Authorization header by default.'},
            {icon: ShieldCheck, title:'Input Validation', desc:'Zod validation for APIs; strict schema checks.'},
            {icon: Server, title:'CORS & CSRF Aware', desc:'CORS configured for your origins; CSRF minimized with JWT.'},
          ].map(({icon:Icon,title,desc})=> (
            <Card key={title} className="border-white/10 bg-white/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="pb-2 flex flex-row items-center gap-2"><Icon className="w-4 h-4 text-sky-300" /><CardTitle className="text-base text-slate-100">{title}</CardTitle></CardHeader>
              <CardContent className="pt-0 text-sm text-slate-300/90">{desc}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/20"><div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-400">© {new Date().getFullYear()} Vahini. All rights reserved.</div></footer>
    </div>
  )
}
