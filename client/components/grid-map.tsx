"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Zap, Power, Eye, EyeOff } from "lucide-react"
import { GoogleMapWrapper } from "@/components/google-map-wrapper"
import { PowerHouseMarker, SubstationMarker, TransmissionLine } from "@/components/map-markers"
import { SimpleGridMap } from "@/components/simple-grid-map"

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
  voltage: "HT" | "MT" | "LT" // High Tension, Medium Tension, Low Tension
  status: "active" | "maintenance" | "fault"
  length: string
  capacity: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500"
    case "maintenance":
      return "bg-yellow-500"
    case "offline":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

export function GridMap() {
  const [selectedPowerHouse, setSelectedPowerHouse] = useState<string | null>(null)
  const [selectedSubstation, setSelectedSubstation] = useState<string | null>(null)
  const [selectedLine, setSelectedLine] = useState<string | null>(null)
  const [showLTLines, setShowLTLines] = useState(true)
  const [showMTLines, setShowMTLines] = useState(true)
  const [showHTLines, setShowHTLines] = useState(true)
  const [showSubstations, setShowSubstations] = useState(false)

  // Removed power plants view from map per requirements
  const powerHouses: PowerHouse[] = [
    {
      id: "1",
      name: "Rajghat Power Station",
      type: "thermal",
      capacity: "135 MW",
      status: "active",
      coordinates: { lat: 28.6562, lng: 77.241 },
    },
    {
      id: "2",
      name: "Indraprastha Power Station",
      type: "gas",
      capacity: "1500 MW",
      status: "active",
      coordinates: { lat: 28.6304, lng: 77.2177 },
    },
    {
      id: "3",
      name: "Pragati Power Station",
      type: "gas",
      capacity: "330 MW",
      status: "maintenance",
      coordinates: { lat: 28.6139, lng: 77.209 },
    },
    {
      id: "4",
      name: "Badarpur Thermal Power Station",
      type: "thermal",
      capacity: "705 MW",
      status: "offline",
      coordinates: { lat: 28.4817, lng: 77.3078 },
    },
    {
      id: "5",
      name: "NTPC Dadri",
      type: "thermal",
      capacity: "1820 MW",
      status: "active",
      coordinates: { lat: 28.5706, lng: 77.5272 },
    },
    {
      id: "6",
      name: "Ghaziabad Gas Power Plant",
      type: "gas",
      capacity: "419 MW",
      status: "active",
      coordinates: { lat: 28.6692, lng: 77.4538 },
    },
    {
      id: "7",
      name: "Faridabad Solar Park",
      type: "solar",
      capacity: "50 MW",
      status: "active",
      coordinates: { lat: 28.4089, lng: 77.3178 },
    },
    {
      id: "8",
      name: "Yamuna Hydro Station",
      type: "hydro",
      capacity: "25 MW",
      status: "maintenance",
      coordinates: { lat: 28.7041, lng: 77.1025 },
    },
  ]

  // Substations data
  // Removed substations view from map per requirements
  const substations: Substation[] = [
    {
      id: "sub1",
      name: "Central Delhi Primary",
      type: "primary",
      voltage: "400kV",
      status: "active",
      coordinates: { lat: 28.6448, lng: 77.2167 },
      connectedLines: ["line1", "line2", "line3"]
    },
    {
      id: "sub2",
      name: "East Delhi Secondary",
      type: "secondary",
      voltage: "132kV",
      status: "active",
      coordinates: { lat: 28.6500, lng: 77.2800 },
      connectedLines: ["line4", "line5"]
    },
    {
      id: "sub3",
      name: "South Delhi Distribution",
      type: "distribution",
      voltage: "33kV",
      status: "active",
      coordinates: { lat: 28.5200, lng: 77.2100 },
      connectedLines: ["line6", "line7", "line8"]
    },
    {
      id: "sub4",
      name: "North Delhi Primary",
      type: "primary",
      voltage: "400kV",
      status: "maintenance",
      coordinates: { lat: 28.7200, lng: 77.1500 },
      connectedLines: ["line9", "line10"]
    },
    {
      id: "sub5",
      name: "West Delhi Distribution",
      type: "distribution",
      voltage: "11kV",
      status: "active",
      coordinates: { lat: 28.6100, lng: 77.0500 },
      connectedLines: ["line11", "line12"]
    },
    {
      id: "sub6",
      name: "Gurgaon Distribution Hub",
      type: "distribution",
      voltage: "33kV",
      status: "active",
      coordinates: { lat: 28.4600, lng: 77.0300 },
      connectedLines: ["line13", "line14"]
    }
  ]

  // Transmission lines data
  const transmissionLines: TransmissionLine[] = [
    // HT Lines (High Tension)
    {
      id: "line1",
      name: "Rajghat-Central Primary",
      from: "1",
      to: "sub1",
      voltage: "HT",
      status: "active",
      length: "12km",
      capacity: "400kV"
    },
    {
      id: "line2",
      name: "Indraprastha-Central Primary",
      from: "2",
      to: "sub1",
      voltage: "HT",
      status: "active",
      length: "8km",
      capacity: "400kV"
    },
    {
      id: "line3",
      name: "NTPC Dadri-North Primary",
      from: "5",
      to: "sub4",
      voltage: "HT",
      status: "active",
      length: "45km",
      capacity: "400kV"
    },
    // MT Lines (Medium Tension)
    {
      id: "line4",
      name: "Central-East Secondary",
      from: "sub1",
      to: "sub2",
      voltage: "MT",
      status: "active",
      length: "15km",
      capacity: "132kV"
    },
    {
      id: "line5",
      name: "Ghaziabad-East Secondary",
      from: "6",
      to: "sub2",
      voltage: "MT",
      status: "active",
      length: "18km",
      capacity: "132kV"
    },
    {
      id: "line9",
      name: "Yamuna-North Primary",
      from: "8",
      to: "sub4",
      voltage: "MT",
      status: "maintenance",
      length: "8km",
      capacity: "132kV"
    },
    // LT Lines (Low Tension)
    {
      id: "line6",
      name: "Central-South Distribution",
      from: "sub1",
      to: "sub3",
      voltage: "LT",
      status: "active",
      length: "22km",
      capacity: "33kV"
    },
    {
      id: "line7",
      name: "South-Faridabad Solar",
      from: "sub3",
      to: "7",
      voltage: "LT",
      status: "active",
      length: "35km",
      capacity: "33kV"
    },
    {
      id: "line8",
      name: "South-Badarpur Thermal",
      from: "sub3",
      to: "4",
      voltage: "LT",
      status: "fault",
      length: "28km",
      capacity: "33kV"
    },
    {
      id: "line10",
      name: "North-West Distribution",
      from: "sub4",
      to: "sub5",
      voltage: "LT",
      status: "active",
      length: "25km",
      capacity: "11kV"
    },
    {
      id: "line11",
      name: "West Distribution Network A",
      from: "sub5",
      to: "sub6",
      voltage: "LT",
      status: "active",
      length: "18km",
      capacity: "11kV"
    },
    {
      id: "line12",
      name: "West Local Distribution",
      from: "sub5",
      to: "sub1",
      voltage: "LT",
      status: "active",
      length: "12km",
      capacity: "11kV"
    },
    {
      id: "line13",
      name: "Gurgaon Local Network",
      from: "sub6",
      to: "sub3",
      voltage: "LT",
      status: "active",
      length: "15km",
      capacity: "11kV"
    },
    {
      id: "line14",
      name: "East-West Cross Connect",
      from: "sub2",
      to: "sub5",
      voltage: "LT",
      status: "active",
      length: "32km",
      capacity: "11kV"
    }
  ]

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

  const getSubstationColor = (type: string, status: string) => {
    if (status === "maintenance") return "bg-yellow-500"
    if (status === "offline") return "bg-red-500"
    
    switch (type) {
      case "primary": return "bg-purple-600"
      case "secondary": return "bg-blue-600" 
      case "distribution": return "bg-green-600"
      default: return "bg-gray-500"
    }
  }

  // Helper function to get entity coordinates
  const getEntityCoordinates = (id: string) => {
    const powerHouse = powerHouses.find(p => p.id === id)
    if (powerHouse) return powerHouse.coordinates
    
    const substation = substations.find(s => s.id === id)
    if (substation) return substation.coordinates
    
    return null
  }

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    // Optional: Customize map behavior when it loads
  }, [])

  const DelhiPowerGridMap = () => {
    return (
      <SimpleGridMap
        powerHouses={powerHouses}
        substations={substations}
        transmissionLines={transmissionLines}
        selectedPowerHouse={selectedPowerHouse}
        selectedSubstation={selectedSubstation}
        selectedLine={selectedLine}
        showLTLines={showLTLines}
        showMTLines={showMTLines}
        showHTLines={showHTLines}
        showSubstations={showSubstations}
        showPowerHouses={false}
        onPowerHouseClick={(id) => setSelectedPowerHouse(selectedPowerHouse === id ? null : id)}
        onSubstationClick={(id) => setSelectedSubstation(selectedSubstation === id ? null : id)}
        onLineClick={(id) => setSelectedLine(selectedLine === id ? null : id)}
      />
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Delhi Power Grid - LT/MT/HT Lines</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Interactive visualization of transmission lines (powerplants and substations hidden)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Section */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Power className="w-5 h-5" />
                Delhi NCR Power Grid with LT Lines
              </div>
              {/* Map Controls */}
              <div className="flex items-center gap-2 text-sm">
                <Button
                  variant={showHTLines ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowHTLines(!showHTLines)}
                  className="h-8 px-3"
                >
                  {showHTLines ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                  HT
                </Button>
                <Button
                  variant={showMTLines ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowMTLines(!showMTLines)}
                  className="h-8 px-3"
                >
                  {showMTLines ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                  MT
                </Button>
                <Button
                  variant={showLTLines ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowLTLines(!showLTLines)}
                  className="h-8 px-3 bg-green-600 hover:bg-green-700"
                >
                  {showLTLines ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                  LT
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DelhiPowerGridMap />
          </CardContent>
        </Card>

        {/* Power Houses Info Panel removed per requirements */}
      </div>

      {/* Legend and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Transmission Lines</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-red-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  HT Lines (400kV) - {transmissionLines.filter((l) => l.voltage === "HT").length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-blue-600" style={{height: '3px'}} />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  MT Lines (132kV) - {transmissionLines.filter((l) => l.voltage === "MT").length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-green-600" style={{height: '2px'}} />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                  LT Lines (11-33kV) - {transmissionLines.filter((l) => l.voltage === "LT").length}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-0.5 bg-red-500" style={{borderStyle: 'dashed', borderWidth: '1px 0'}} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Fault</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-yellow-500" style={{borderStyle: 'dashed', borderWidth: '1px 0'}} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Maintenance</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  )
}
