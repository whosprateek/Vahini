"use client"

import { useState } from "react"

interface PowerHouse {
  id: string
  name: string
  type: "thermal" | "gas" | "solar" | "hydro"
  capacity: string
  status: "active" | "maintenance" | "offline"
  coordinates: { lat: number; lng: number }
}

interface Substation {
  id: string
  name: string
  type: "primary" | "secondary" | "distribution"
  voltage: string
  status: "active" | "maintenance" | "offline"
  coordinates: { lat: number; lng: number }
  connectedLines: string[]
}

interface TransmissionLine {
  id: string
  name: string
  from: string
  to: string
  voltage: "HT" | "MT" | "LT"
  status: "active" | "maintenance" | "fault"
  length: string
  capacity: string
}

interface SimpleGridMapProps {
  powerHouses: PowerHouse[]
  substations: Substation[]
  transmissionLines: TransmissionLine[]
  selectedPowerHouse: string | null
  selectedSubstation: string | null
  selectedLine: string | null
  showLTLines: boolean
  showMTLines: boolean
  showHTLines: boolean
  showSubstations: boolean
  showPowerHouses: boolean
  onPowerHouseClick: (id: string) => void
  onSubstationClick: (id: string) => void
  onLineClick: (id: string) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "#10b981" // green
    case "maintenance":
      return "#f59e0b" // amber
    case "offline":
      return "#ef4444" // red
    default:
      return "#6b7280" // gray
  }
}

const getSubstationColor = (type: string, status: string) => {
  if (status === "maintenance") return "#f59e0b"
  if (status === "offline") return "#ef4444"
  
  switch (type) {
    case "primary": return "#9333ea" // purple
    case "secondary": return "#2563eb" // blue
    case "distribution": return "#16a34a" // green
    default: return "#6b7280"
  }
}

const getLineColor = (voltage: string, status: string) => {
  if (status === "fault") return "#ef4444" // red
  if (status === "maintenance") return "#f59e0b" // amber
  
  switch (voltage) {
    case "HT": return "#dc2626" // red-600 for high tension
    case "MT": return "#2563eb" // blue-600 for medium tension  
    case "LT": return "#16a34a" // green-600 for low tension
    default: return "#6b7280" // gray-500
  }
}

const getLineWidth = (voltage: string) => {
  switch (voltage) {
    case "HT": return 4
    case "MT": return 3
    case "LT": return 2
    default: return 2
  }
}

export function SimpleGridMap({
  powerHouses,
  substations,
  transmissionLines,
  selectedPowerHouse,
  selectedSubstation,
  selectedLine,
  showLTLines,
  showMTLines,
  showHTLines,
  showSubstations,
  showPowerHouses,
  onPowerHouseClick,
  onSubstationClick,
  onLineClick
}: SimpleGridMapProps) {
  // Delhi boundaries (approximate)
  const delhiBounds = {
    north: 28.88,
    south: 28.4,
    east: 77.35,
    west: 76.84,
  }

  // Convert lat/lng to pixel positions
  const getPosition = (lat: number, lng: number) => {
    const x = ((lng - delhiBounds.west) / (delhiBounds.east - delhiBounds.west)) * 100
    const y = ((delhiBounds.north - lat) / (delhiBounds.north - delhiBounds.south)) * 100
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
  }

  // Find positions for all entities
  const allEntities = [...powerHouses, ...substations]
  const getEntity = (id: string) => allEntities.find(e => e.id === id)

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-green-100 via-blue-50 to-green-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-slate-600">
      {/* Delhi outline */}
      <div className="absolute inset-4 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg opacity-50" />

      {/* Delhi label */}
      <div className="absolute top-6 left-6 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-md">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Delhi NCR Power Grid</span>
      </div>

      {/* Yamuna River representation */}
      <div className="absolute top-8 left-1/3 w-1 h-80 bg-blue-300 dark:bg-blue-600 opacity-60 transform rotate-12 rounded-full" />

      {/* Transmission Lines SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" opacity="0.6" />
          </marker>
        </defs>
        
        {transmissionLines.map((line) => {
          const fromEntity = getEntity(line.from)
          const toEntity = getEntity(line.to)
          if (!fromEntity || !toEntity) return null

          const fromPos = getPosition(fromEntity.coordinates.lat, fromEntity.coordinates.lng)
          const toPos = getPosition(toEntity.coordinates.lat, toEntity.coordinates.lng)

          const shouldShow = 
            (line.voltage === "LT" && showLTLines) ||
            (line.voltage === "MT" && showMTLines) ||
            (line.voltage === "HT" && showHTLines)

          if (!shouldShow) return null

          return (
            <g key={line.id}>
              <line
                x1={`${fromPos.x}%`}
                y1={`${fromPos.y}%`}
                x2={`${toPos.x}%`}
                y2={`${toPos.y}%`}
                stroke={getLineColor(line.voltage, line.status)}
                strokeWidth={getLineWidth(line.voltage)}
                strokeDasharray={line.status === "maintenance" ? "5,5" : line.status === "fault" ? "3,3" : "none"}
                opacity={selectedLine === line.id ? 1 : 0.7}
                markerEnd="url(#arrowhead)"
                className={`cursor-pointer transition-opacity ${
                  selectedLine === line.id ? "" : "hover:opacity-90"
                }`}
                style={{ pointerEvents: "stroke" }}
                onClick={(e) => {
                  e.stopPropagation()
                  onLineClick(line.id)
                }}
              />
              {/* Line label */}
              {selectedLine === line.id && (
                <text
                  x={`${(fromPos.x + toPos.x) / 2}%`}
                  y={`${(fromPos.y + toPos.y) / 2}%`}
                  fill="currentColor"
                  fontSize="10"
                  textAnchor="middle"
                  className="pointer-events-none bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-xs"
                >
                  {line.voltage} {line.capacity}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Substations */}
      {showSubstations && substations.map((substation) => {
        const position = getPosition(substation.coordinates.lat, substation.coordinates.lng)
        return (
          <div
            key={substation.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-15 ${
              selectedSubstation === substation.id ? "scale-125" : "hover:scale-110"
            }`}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            onClick={() => onSubstationClick(substation.id)}
          >
            <div
              className={`w-3 h-3 border-2 border-white shadow-lg ${
                substation.type === "primary" ? "" : substation.type === "secondary" ? "rounded-sm" : "rounded-full"
              }`}
              style={{ backgroundColor: getSubstationColor(substation.type, substation.status) }}
            />
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-md text-xs font-medium whitespace-nowrap">
              {substation.name.split(" ")[0]}
            </div>
            {selectedSubstation === substation.id && (
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border text-xs w-48 z-30">
                <div className="font-semibold text-gray-900 dark:text-white">{substation.name}</div>
                <div className="text-gray-600 dark:text-gray-400 mt-1">
                  Type: {substation.type} | {substation.voltage}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <div 
                    className="w-2 h-2" 
                    style={{ 
                      backgroundColor: getSubstationColor(substation.type, substation.status),
                      borderRadius: substation.type === "distribution" ? "50%" : substation.type === "secondary" ? "2px" : "0"
                    }} 
                  />
                  <span className="text-gray-600 dark:text-gray-400 capitalize">{substation.status}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Connected lines: {substation.connectedLines.length}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Power house markers */}
      {showPowerHouses && powerHouses.map((powerHouse) => {
        const position = getPosition(powerHouse.coordinates.lat, powerHouse.coordinates.lng)
        return (
          <div
            key={powerHouse.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-10 ${
              selectedPowerHouse === powerHouse.id ? "scale-125" : "hover:scale-110"
            }`}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            onClick={() => onPowerHouseClick(powerHouse.id)}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: getStatusColor(powerHouse.status) }}
            />
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap">
              {powerHouse.name.split(" ")[0]}
            </div>
            {selectedPowerHouse === powerHouse.id && (
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border text-xs w-48 z-30">
                <div className="font-semibold text-gray-900 dark:text-white">{powerHouse.name}</div>
                <div className="text-gray-600 dark:text-gray-400 mt-1">
                  Type: {powerHouse.type} | {powerHouse.capacity}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: getStatusColor(powerHouse.status) }} 
                  />
                  <span className="text-gray-600 dark:text-gray-400 capitalize">{powerHouse.status}</span>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Selected line info */}
      {selectedLine && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border text-xs w-64 z-30">
          {(() => {
            const line = transmissionLines.find(l => l.id === selectedLine)
            return line ? (
              <>
                <div className="font-semibold text-gray-900 dark:text-white">{line.name}</div>
                <div className="text-gray-600 dark:text-gray-400 mt-1">
                  {line.voltage} Line | {line.capacity} | {line.length}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: getLineColor(line.voltage, line.status) }}
                  />
                  <span className="text-gray-600 dark:text-gray-400 capitalize">{line.status}</span>
                </div>
              </>
            ) : null
          })()}
        </div>
      )}

      {/* Grid lines overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10 z-0">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}
