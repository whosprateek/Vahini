"use client"

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"

export type Region = "all" | "north" | "east" | "south" | "west"

export type LineStatus = "active" | "fault" | "maintenance"

export interface Line {
  id: string
  voltage: string // e.g., "230V"
  current: string // e.g., "45A"
  status: LineStatus
  load: string // e.g., "78%"
}

export interface LinePoint {
  t: number // epoch ms
  power: number // kW (mock)
}

interface LinesContextType {
  linesByRegion: Record<Exclude<Region, "all">, Line[]>
  getLines: (region: Region) => Line[]
  getLineRegion: (lineId: string) => Exclude<Region, "all">
  startVoltage: (region: Exclude<Region, "all">, lineId: string) => void
  stopVoltage: (region: Exclude<Region, "all">, lineId: string) => void
  setFault: (region: Exclude<Region, "all">, lineId: string) => void
  getHistory: (region: Exclude<Region, "all">, lineId: string) => LinePoint[]
  appendHistory: (region: Exclude<Region, "all">, lineId: string, point: LinePoint) => void
}

const LinesContext = createContext<LinesContextType | undefined>(undefined)

// Seed data based on existing dashboard sample
const seedLines: Record<Exclude<Region, "all">, Line[]> = {
  north: [
    { id: "NT-001", voltage: "230V", current: "42A", status: "active", load: "75%" },
    { id: "NT-002", voltage: "230V", current: "38A", status: "active", load: "68%" },
    { id: "NT-003", voltage: "0V", current: "0A", status: "fault", load: "0%" },
    { id: "NT-004", voltage: "230V", current: "45A", status: "active", load: "80%" },
    { id: "NT-005", voltage: "230V", current: "40A", status: "active", load: "72%" },
    { id: "NT-006", voltage: "230V", current: "44A", status: "active", load: "78%" },
    { id: "NT-007", voltage: "230V", current: "39A", status: "active", load: "70%" },
    { id: "NT-008", voltage: "230V", current: "46A", status: "active", load: "82%" },
  ],
  east: [
    { id: "ET-001", voltage: "230V", current: "48A", status: "active", load: "85%" },
    { id: "ET-002", voltage: "230V", current: "52A", status: "active", load: "92%" },
    { id: "ET-003", voltage: "230V", current: "44A", status: "active", load: "78%" },
    { id: "ET-004", voltage: "230V", current: "46A", status: "active", load: "82%" },
    { id: "ET-005", voltage: "230V", current: "50A", status: "active", load: "88%" },
    { id: "ET-006", voltage: "230V", current: "46A", status: "active", load: "82%" },
    { id: "ET-007", voltage: "230V", current: "49A", status: "active", load: "87%" },
    { id: "ET-008", voltage: "230V", current: "47A", status: "active", load: "84%" },
  ],
  south: [
    { id: "ST-001", voltage: "230V", current: "55A", status: "active", load: "95%" },
    { id: "ST-002", voltage: "230V", current: "53A", status: "active", load: "92%" },
    { id: "ST-003", voltage: "230V", current: "51A", status: "active", load: "89%" },
    { id: "ST-004", voltage: "230V", current: "49A", status: "active", load: "86%" },
    { id: "ST-005", voltage: "0V", current: "0A", status: "fault", load: "0%" },
    { id: "ST-006", voltage: "230V", current: "52A", status: "active", load: "91%" },
    { id: "ST-007", voltage: "230V", current: "54A", status: "active", load: "94%" },
    { id: "ST-008", voltage: "230V", current: "50A", status: "active", load: "88%" },
  ],
  west: [
    { id: "WT-001", voltage: "230V", current: "35A", status: "active", load: "62%" },
    { id: "WT-002", voltage: "230V", current: "38A", status: "active", load: "68%" },
    { id: "WT-003", voltage: "230V", current: "42A", status: "active", load: "75%" },
    { id: "WT-004", voltage: "230V", current: "40A", status: "active", load: "71%" },
    { id: "WT-005", voltage: "230V", current: "36A", status: "active", load: "64%" },
    { id: "WT-006", voltage: "230V", current: "44A", status: "active", load: "78%" },
    { id: "WT-007", voltage: "230V", current: "41A", status: "active", load: "73%" },
    { id: "WT-008", voltage: "230V", current: "39A", status: "active", load: "69%" },
  ],
}

function parseNumber(valueWithUnit: string): number {
  const n = parseFloat(valueWithUnit)
  return Number.isFinite(n) ? n : 0
}

function formatVoltageCurrent(v: number, a: number): { voltage: string; current: string } {
  return { voltage: `${Math.max(0, Math.round(v))}V`, current: `${Math.max(0, Math.round(a))}A` }
}

function randomHistory(seed: number, points = 24): LinePoint[] {
  const out: LinePoint[] = []
  const now = Date.now()
  let base = 50 + (seed % 40)
  for (let i = points - 1; i >= 0; i--) {
    base += (Math.sin((seed + i) / 3) * 5) + (Math.random() * 4 - 2)
    out.push({ t: now - i * 5 * 60 * 1000, power: Math.max(0, Math.round(base)) })
  }
  return out
}

export function LinesProvider({ children }: { children: React.ReactNode }) {
  const [linesByRegion, setLinesByRegion] = useState<Record<Exclude<Region, "all">, Line[]>>(() => ({
    north: seedLines.north.map(l => ({ ...l })),
    east: seedLines.east.map(l => ({ ...l })),
    south: seedLines.south.map(l => ({ ...l })),
    west: seedLines.west.map(l => ({ ...l })),
  }))

  type RegionKey = Exclude<Region, "all">
  const historyInitial = useMemo<Record<RegionKey, Record<string, LinePoint[]>>>(() => {
    const obj: Record<any, Record<string, LinePoint[]>> = { north: {}, east: {}, south: {}, west: {} }
    ;(["north","east","south","west"] as const).forEach((r, ri) => {
      seedLines[r].forEach((l, li) => { obj[r][l.id] = randomHistory(ri * 100 + li) })
    })
    return obj as Record<RegionKey, Record<string, LinePoint[]>>
  }, [])
  const historyRef = useRef(historyInitial)

  const getLines = useCallback((region: Region): Line[] => {
    if (region === "all") {
      return [
        ...linesByRegion.north,
        ...linesByRegion.east,
        ...linesByRegion.south,
        ...linesByRegion.west,
      ]
    }
    return linesByRegion[region]
  }, [linesByRegion])

  const getLineRegion = useCallback((lineId: string): Exclude<Region, "all"> => {
    // Determine region by line ID prefix
    if (lineId.startsWith("NT-")) return "north"
    if (lineId.startsWith("ET-")) return "east"
    if (lineId.startsWith("ST-")) return "south"
    if (lineId.startsWith("WT-")) return "west"
    // fallback: search data
    const found = (Object.keys(linesByRegion) as Array<Exclude<Region, 'all'>>).find(r =>
      linesByRegion[r].some(l => l.id === lineId)
    )
    return found || "north"
  }, [linesByRegion])

  const mutateLine = useCallback((region: Exclude<Region, "all">, lineId: string, updater: (l: Line) => Line) => {
    setLinesByRegion(prev => ({
      ...prev,
      [region]: prev[region].map(l => l.id === lineId ? updater(l) : l),
    }))
  }, [])

  const startVoltage = useCallback((region: Exclude<Region, "all">, lineId: string) => {
    mutateLine(region, lineId, (l) => {
      const v = parseNumber(l.voltage) || 230
      const a = parseNumber(l.current) || 40
      const next = formatVoltageCurrent(v || 230, a || 40)
      return { ...l, ...next, status: "active", load: l.load === "0%" ? "65%" : l.load }
    })
  }, [mutateLine])

  const stopVoltage = useCallback((region: Exclude<Region, "all">, lineId: string) => {
    mutateLine(region, lineId, (l) => ({ ...l, voltage: "0V", current: "0A", load: "0%", status: "maintenance" }))
  }, [mutateLine])

  const setFault = useCallback((region: Exclude<Region, "all">, lineId: string) => {
    mutateLine(region, lineId, (l) => ({ ...l, status: "fault" }))
  }, [mutateLine])

  const getHistory = useCallback((region: Exclude<Region, "all">, lineId: string) => {
    return historyRef.current[region][lineId] || []
  }, [])

  const appendHistory = useCallback((region: Exclude<Region, "all">, lineId: string, point: LinePoint) => {
    const arr = historyRef.current[region][lineId] || (historyRef.current[region][lineId] = [])
    arr.push(point)
    // keep last 200 points
    if (arr.length > 200) arr.shift()
  }, [])

  const value = useMemo(() => ({
    linesByRegion,
    getLines,
    getLineRegion,
    startVoltage,
    stopVoltage,
    setFault,
    getHistory,
    appendHistory,
  }), [linesByRegion, getLines, getLineRegion, startVoltage, stopVoltage, setFault, getHistory, appendHistory])

  return (
    <LinesContext.Provider value={value}>
      {children}
    </LinesContext.Provider>
  )
}

export function useLines() {
  const ctx = useContext(LinesContext)
  if (!ctx) throw new Error("useLines must be used within LinesProvider")
  return ctx
}