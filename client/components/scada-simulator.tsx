"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Zap, Play, RotateCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useLines } from "@/contexts/lines-context"
import { useNotifications } from "@/contexts/notifications-context"
import { API_BASE_URL, fetchJson } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"

export function ScadaSimulator() {
  const { getLines, startVoltage, stopVoltage } = useLines()
  const { addNotification } = useNotifications()
  const { isDemo } = useAuth()

  type HistEntry = { t: number; score: number; label: string; source: 'current' | 'voltage' }

  const [region, setRegion] = useState<string>('north')
  const lines = useMemo(() => getLines(region as any), [getLines, region])
  const [lineId, setLineId] = useState<string>('')
  const [mode, setMode] = useState<'current' | 'voltage'>('current')
  const [autoSim, setAutoSim] = useState(false)
  const [history, setHistory] = useState<HistEntry[]>([])
  const [lastLabel, setLastLabel] = useState<string>('—')

  useEffect(() => {
    if (lines.length && !lineId) setLineId(lines[0].id)
  }, [lines, lineId])

  // Current-based (Transformer A/B)
  const [currentA, setCurrentA] = useState("")
  const [currentB, setCurrentB] = useState("")
  const [currentResult, setCurrentResult] = useState<string>("")
  const [isPredicting, setIsPredicting] = useState(false)

  // Voltage-based (start/end of LT line)
  const [voltageStart, setVoltageStart] = useState("")
  const [voltageEnd, setVoltageEnd] = useState("")
  const [voltageResult, setVoltageResult] = useState<string>("")

  function rand(min: number, max: number) { return Math.round(min + Math.random() * (max - min)) }

  function simulateCurrent() {
    setCurrentA(String(rand(30, 70)))
    setCurrentB(String(rand(25, 65)))
  }
  function simulateVoltage() {
    setVoltageStart(String(rand(180, 260)))
    setVoltageEnd(String(rand(0, 260)))
  }

  async function runCurrentClassification() {
    if (!currentA || !currentB) {
      setCurrentResult("Enter both currents for Transformer A and B.")
      return
    }
    setIsPredicting(true)
    setCurrentResult("")
    try {
      const data = await fetchJson<{ result: { label: string; reason: string } }>(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: JSON.stringify({ current_start: Number(currentA), current_end: Number(currentB) })
      })
      const label = data.result.label
      setCurrentResult(`${label} — ${data.result.reason}`)
      pushHistory(label, 'current')
    } catch (e) {
      setCurrentResult(`Error: ${(e as Error).message}`)
    } finally {
      setIsPredicting(false)
    }
  }

  function runVoltageClassification() {
    if (!voltageStart || !voltageEnd) {
      setVoltageResult("Enter both voltages.")
      return
    }
    const vs = Number(voltageStart)
    const ve = Number(voltageEnd)
    if (!Number.isFinite(vs) || !Number.isFinite(ve)) {
      setVoltageResult("Invalid voltage values.")
      return
    }
    let label = "Healthy"
    // Simple rules to mirror ML intent
    if (vs >= 100 && Math.abs(ve) <= 1) {
      label = "Break"
      setVoltageResult("Break — Start normal, end ≈ 0V")
    } else if (vs >= 230 && ve >= 230) {
      label = "Overloaded"
      setVoltageResult("Overloaded — Both ends high")
    } else if (vs >= 400 || ve >= 400) {
      label = "Short Circuit"
      setVoltageResult("Short Circuited — Abnormal surge detected")
    } else {
      label = "Healthy"
      setVoltageResult("Healthy")
    }
    pushHistory(label, 'voltage')
  }

  function handleStop() {
    if (!lineId) return
    stopVoltage(region as any, lineId)
    addNotification({ type: 'alert', title: 'Line Stopped from SCADA', region, lineId })
  }
  function handleStart() {
    if (!lineId) return
    startVoltage(region as any, lineId)
    addNotification({ type: 'success', title: 'Line Started from SCADA', region, lineId })
  }

  function resetAll() {
    setCurrentA(""); setCurrentB(""); setCurrentResult("")
    setVoltageStart(""); setVoltageEnd(""); setVoltageResult("")
    setHistory([]); setLastLabel('—')
  }

  function labelToScore(label: string): number {
    const L = label.toLowerCase()
    if (L.includes('short')) return 20
    if (L.includes('break')) return 10
    if (L.includes('overload')) return 60
    return 90 // healthy-ish
  }

  function pushHistory(label: string, source: 'current'|'voltage') {
    setHistory(prev => [...prev.slice(-39), { t: Date.now(), score: labelToScore(label), label, source }])
    setLastLabel(label)
  }

  // Auto simulate (voltage mode)
  useEffect(() => {
    if (!autoSim || mode !== 'voltage') return
    const id = setInterval(() => {
      simulateVoltage()
      runVoltageClassification()
    }, 2500)
    return () => clearInterval(id)
  }, [autoSim, mode, voltageStart, voltageEnd])

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SCADA Line Breaker Simulator</h1>
        <p className="text-gray-600 dark:text-gray-400">Control LT lines and classify faults using current (Transformer A/B) or voltages (start/end)</p>
      </div>

      <Card className="max-w-6xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><Zap className="w-5 h-5 text-blue-500" />SCADA Control Console</span>
            {isDemo && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 border border-amber-400/40">Demo mode: simulated locally</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Controls */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1 block">Region</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north">North</SelectItem>
                      <SelectItem value="east">East</SelectItem>
                      <SelectItem value="south">South</SelectItem>
                      <SelectItem value="west">West</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1 block">LT Line</Label>
                  <Select value={lineId} onValueChange={setLineId}>
                    <SelectTrigger><SelectValue placeholder="Select line" /></SelectTrigger>
                    <SelectContent>
                      {lines.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.id} — {l.voltage} • {l.current} • {l.load}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" onClick={handleStart}>Start Voltage</Button>
                <Button variant="outline" onClick={handleStop} className="border-red-500 text-red-600">Stop Voltage</Button>
                <div className="text-xs text-muted-foreground ml-auto">{lineId ? `Selected: ${lineId} in ${region}` : 'Select a line'}</div>
              </div>

              {/* Mode toggle */}
              <div className="flex items-center gap-2">
                <Label className="text-sm">Mode</Label>
                <div className="inline-flex rounded-md border overflow-hidden">
                  <button className={`px-3 py-1.5 text-sm ${mode==='current' ? 'bg-primary text-primary-foreground' : 'bg-background'}`} onClick={()=>setMode('current')} type="button">Current (A/B)</button>
                  <button className={`px-3 py-1.5 text-sm ${mode==='voltage' ? 'bg-primary text-primary-foreground' : 'bg-background'}`} onClick={()=>setMode('voltage')} type="button">Voltage (start/end)</button>
                </div>
              </div>

              {/* Dynamic controls */}
              {mode === 'current' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Current A (A)</Label>
                      <Input type="number" placeholder="e.g. 42" value={currentA} onChange={(e)=>setCurrentA(e.target.value)} />
                    </div>
                    <div>
                      <Label>Current B (A)</Label>
                      <Input type="number" placeholder="e.g. 38" value={currentB} onChange={(e)=>setCurrentB(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={runCurrentClassification} disabled={isPredicting}>{isPredicting ? 'Classifying…' : 'Predict via Model'}</Button>
                    <Button variant="outline" onClick={simulateCurrent}>Simulate values</Button>
                    <Button variant="outline" onClick={resetAll}><RotateCcw className="w-4 h-4 mr-1" />Reset</Button>
                  </div>
                  {currentResult && (
                    <Alert><AlertDescription className="whitespace-pre-wrap font-mono text-sm">{currentResult}</AlertDescription></Alert>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Voltage at Start (V)</Label>
                      <Input type="number" placeholder="e.g. 230" value={voltageStart} onChange={(e)=>setVoltageStart(e.target.value)} />
                    </div>
                    <div>
                      <Label>Voltage at End (V)</Label>
                      <Input type="number" placeholder="e.g. 0" value={voltageEnd} onChange={(e)=>setVoltageEnd(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                      <Switch id="autosim" checked={autoSim} onCheckedChange={setAutoSim} />
                      <label htmlFor="autosim" className="text-sm">Auto-simulate</label>
                    </div>
                    <Button onClick={runVoltageClassification}><Play className="w-4 h-4 mr-1" />Classify</Button>
                    <Button variant="outline" onClick={simulateVoltage}>Simulate values</Button>
                    <Button variant="outline" onClick={resetAll}><RotateCcw className="w-4 h-4 mr-1" />Reset</Button>
                    <div className="text-xs text-muted-foreground ml-auto">Quick presets:</div>
                    <Button variant="outline" size="sm" onClick={()=>{setVoltageStart('220'); setVoltageEnd('215')}}>Healthy</Button>
                    <Button variant="outline" size="sm" onClick={()=>{setVoltageStart('230'); setVoltageEnd('230')}}>Overload</Button>
                    <Button variant="outline" size="sm" onClick={()=>{setVoltageStart('220'); setVoltageEnd('0')}}>Break</Button>
                    <Button variant="outline" size="sm" onClick={()=>{setVoltageStart('420'); setVoltageEnd('420')}}>Short</Button>
                  </div>
                  {voltageResult && (
                    <Alert><AlertDescription className="whitespace-pre-wrap font-mono text-sm">{voltageResult}</AlertDescription></Alert>
                  )}
                </div>
              )}
            </div>

            {/* Right: Live status */}
            <div className="space-y-6">
              <div className="rounded-lg border dark:border-slate-700 p-4">
                <div className="text-sm text-muted-foreground">Latest verdict</div>
                <div className="mt-1 text-3xl font-bold">{lastLabel}</div>
              </div>
              <div className="h-44 rounded-lg border dark:border-slate-700 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history.map(h => ({ t: h.t, score: h.score }))} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                    <XAxis hide dataKey="t" type="number" domain={["dataMin","dataMax"]} />
                    <YAxis hide domain={[0,100]} />
                    <Tooltip wrapperStyle={{ outline: 'none', pointerEvents: 'none' }} labelFormatter={(v)=>new Date(v as number).toLocaleTimeString()} />
                    <Line type="monotone" dataKey="score" stroke="#38bdf8" dot={false} strokeWidth={2} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground">Trend is a qualitative score derived from the last few classifications (higher = healthier).</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
