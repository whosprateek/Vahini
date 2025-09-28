"use client"

import { useEffect, useState } from "react"

interface PowerHouseMarkerProps {
  map: google.maps.Map
  powerHouse: {
    id: string
    name: string
    type: "thermal" | "gas" | "solar" | "hydro"
    capacity: string
    status: "active" | "maintenance" | "offline"
    coordinates: { lat: number; lng: number }
  }
  isSelected: boolean
  onClick: () => void
}

interface SubstationMarkerProps {
  map: google.maps.Map
  substation: {
    id: string
    name: string
    type: "primary" | "secondary" | "distribution"
    voltage: string
    status: "active" | "maintenance" | "offline"
    coordinates: { lat: number; lng: number }
    connectedLines: string[]
  }
  isSelected: boolean
  onClick: () => void
}

interface TransmissionLineProps {
  map: google.maps.Map
  line: {
    id: string
    name: string
    from: string
    to: string
    voltage: "HT" | "MT" | "LT"
    status: "active" | "maintenance" | "fault"
    length: string
    capacity: string
  }
  fromCoords: { lat: number; lng: number }
  toCoords: { lat: number; lng: number }
  isVisible: boolean
  isSelected: boolean
  onClick: () => void
}

const getPowerHouseIcon = (type: string, status: string): string => {
  const baseColor = status === "active" ? "green" : status === "maintenance" ? "yellow" : "red"
  const icons = {
    thermal: "🔥",
    gas: "⚡",
    solar: "☀️",
    hydro: "💧"
  }
  return icons[type as keyof typeof icons] || "⚡"
}

const getSubstationIcon = (type: string, status: string): string => {
  if (status === "maintenance") return "🟡"
  if (status === "offline") return "🔴"
  
  switch (type) {
    case "primary": return "🟣"
    case "secondary": return "🔵"
    case "distribution": return "🟢"
    default: return "⚪"
  }
}

const getLineColor = (voltage: string, status: string): string => {
  if (status === "fault") return "#ef4444" // red
  if (status === "maintenance") return "#f59e0b" // amber
  
  switch (voltage) {
    case "HT": return "#dc2626" // red-600 for high tension
    case "MT": return "#2563eb" // blue-600 for medium tension  
    case "LT": return "#16a34a" // green-600 for low tension
    default: return "#6b7280" // gray-500
  }
}

const getLineWeight = (voltage: string): number => {
  switch (voltage) {
    case "HT": return 6
    case "MT": return 4
    case "LT": return 3
    default: return 2
  }
}

export function PowerHouseMarker({ map, powerHouse, isSelected, onClick }: PowerHouseMarkerProps) {
  const [marker, setMarker] = useState<google.maps.Marker>()
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow>()

  useEffect(() => {
    if (!map || !window.google) return

    const newMarker = new google.maps.Marker({
      position: powerHouse.coordinates,
      map: map,
      title: powerHouse.name,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="${
              powerHouse.status === "active" ? "#10b981" : 
              powerHouse.status === "maintenance" ? "#f59e0b" : "#ef4444"
            }" stroke="white" stroke-width="2"/>
            <text x="16" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">
              ${getPowerHouseIcon(powerHouse.type, powerHouse.status)}
            </text>
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16)
      },
      zIndex: isSelected ? 1000 : 100
    })

    const newInfoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-3">
          <h3 class="font-semibold text-gray-900 mb-2">${powerHouse.name}</h3>
          <p class="text-sm text-gray-600 mb-1">Type: ${powerHouse.type}</p>
          <p class="text-sm text-gray-600 mb-1">Capacity: ${powerHouse.capacity}</p>
          <div class="flex items-center gap-1 mt-2">
            <div class="w-2 h-2 rounded-full bg-${
              powerHouse.status === "active" ? "green" : 
              powerHouse.status === "maintenance" ? "yellow" : "red"
            }-500"></div>
            <span class="text-xs text-gray-600 capitalize">${powerHouse.status}</span>
          </div>
        </div>
      `
    })

    newMarker.addListener("click", () => {
      onClick()
      if (isSelected) {
        newInfoWindow.open(map, newMarker)
      } else {
        newInfoWindow.close()
      }
    })

    setMarker(newMarker)
    setInfoWindow(newInfoWindow)

    return () => {
      newMarker.setMap(null)
    }
  }, [map, powerHouse, onClick])

  useEffect(() => {
    if (marker && infoWindow) {
      if (isSelected) {
        infoWindow.open(map, marker)
        marker.setZIndex(1000)
      } else {
        infoWindow.close()
        marker.setZIndex(100)
      }
    }
  }, [isSelected, marker, infoWindow, map])

  return null
}

export function SubstationMarker({ map, substation, isSelected, onClick }: SubstationMarkerProps) {
  const [marker, setMarker] = useState<google.maps.Marker>()
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow>()

  useEffect(() => {
    if (!map || !window.google) return

    const getColor = () => {
      if (substation.status === "maintenance") return "#f59e0b"
      if (substation.status === "offline") return "#ef4444"
      
      switch (substation.type) {
        case "primary": return "#9333ea"
        case "secondary": return "#2563eb"
        case "distribution": return "#16a34a"
        default: return "#6b7280"
      }
    }

    const getShape = () => {
      switch (substation.type) {
        case "primary": return "rect(0,24,24,0)" // square
        case "secondary": return "rect(0,20,20,0)" // smaller square
        case "distribution": return "" // circle (default)
        default: return ""
      }
    }

    const newMarker = new google.maps.Marker({
      position: substation.coordinates,
      map: map,
      title: substation.name,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            ${substation.type === "distribution" ? 
              `<circle cx="12" cy="12" r="10" fill="${getColor()}" stroke="white" stroke-width="2"/>` :
              `<rect x="2" y="2" width="${substation.type === "primary" ? "20" : "16"}" height="${substation.type === "primary" ? "20" : "16"}" fill="${getColor()}" stroke="white" stroke-width="2" ${substation.type === "primary" ? 'x="2" y="2"' : 'x="4" y="4"'}/>`
            }
          </svg>
        `)}`,
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 12)
      },
      zIndex: isSelected ? 900 : 200
    })

    const newInfoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-3">
          <h3 class="font-semibold text-gray-900 mb-2">${substation.name}</h3>
          <p class="text-sm text-gray-600 mb-1">Type: ${substation.type}</p>
          <p class="text-sm text-gray-600 mb-1">Voltage: ${substation.voltage}</p>
          <p class="text-sm text-gray-600 mb-1">Connected Lines: ${substation.connectedLines.length}</p>
          <div class="flex items-center gap-1 mt-2">
            <div class="w-2 h-2 ${substation.type === "distribution" ? "rounded-full" : ""} bg-${
              substation.status === "active" ? "green" : 
              substation.status === "maintenance" ? "yellow" : "red"
            }-500"></div>
            <span class="text-xs text-gray-600 capitalize">${substation.status}</span>
          </div>
        </div>
      `
    })

    newMarker.addListener("click", () => {
      onClick()
    })

    setMarker(newMarker)
    setInfoWindow(newInfoWindow)

    return () => {
      newMarker.setMap(null)
    }
  }, [map, substation, onClick])

  useEffect(() => {
    if (marker && infoWindow) {
      if (isSelected) {
        infoWindow.open(map, marker)
        marker.setZIndex(900)
      } else {
        infoWindow.close()
        marker.setZIndex(200)
      }
    }
  }, [isSelected, marker, infoWindow, map])

  return null
}

export function TransmissionLine({ 
  map, 
  line, 
  fromCoords, 
  toCoords, 
  isVisible, 
  isSelected, 
  onClick 
}: TransmissionLineProps) {
  const [polyline, setPolyline] = useState<google.maps.Polyline>()
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow>()

  useEffect(() => {
    if (!map || !window.google) return

    const path = [fromCoords, toCoords]
    
    const newPolyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: getLineColor(line.voltage, line.status),
      strokeOpacity: isSelected ? 1.0 : 0.8,
      strokeWeight: getLineWeight(line.voltage),
      clickable: true,
      zIndex: isSelected ? 800 : 300
    })

    // Add dashed pattern for maintenance/fault lines
    if (line.status === "maintenance" || line.status === "fault") {
      newPolyline.setOptions({
        strokeOpacity: 0.6,
        icons: [{
          icon: {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 2
          },
          offset: '0',
          repeat: '10px'
        }]
      })
    }

    if (isVisible) {
      newPolyline.setMap(map)
    }

    const midPoint = {
      lat: (fromCoords.lat + toCoords.lat) / 2,
      lng: (fromCoords.lng + toCoords.lng) / 2
    }

    const newInfoWindow = new google.maps.InfoWindow({
      position: midPoint,
      content: `
        <div class="p-3">
          <h3 class="font-semibold text-gray-900 mb-2">${line.name}</h3>
          <p class="text-sm text-gray-600 mb-1">${line.voltage} Line</p>
          <p class="text-sm text-gray-600 mb-1">Capacity: ${line.capacity}</p>
          <p class="text-sm text-gray-600 mb-1">Length: ${line.length}</p>
          <div class="flex items-center gap-1 mt-2">
            <div class="w-2 h-2 rounded-sm" style="background-color: ${getLineColor(line.voltage, line.status)}"></div>
            <span class="text-xs text-gray-600 capitalize">${line.status}</span>
          </div>
        </div>
      `
    })

    newPolyline.addListener("click", () => {
      onClick()
    })

    setPolyline(newPolyline)
    setInfoWindow(newInfoWindow)

    return () => {
      newPolyline.setMap(null)
    }
  }, [map, line, fromCoords, toCoords, isVisible, onClick])

  useEffect(() => {
    if (polyline) {
      if (isVisible) {
        polyline.setMap(map)
        polyline.setOptions({
          strokeOpacity: isSelected ? 1.0 : 0.8,
          zIndex: isSelected ? 800 : 300,
          strokeWeight: isSelected ? getLineWeight(line.voltage) + 1 : getLineWeight(line.voltage)
        })
      } else {
        polyline.setMap(null)
      }
    }
  }, [isVisible, isSelected, polyline, map, line.voltage])

  useEffect(() => {
    if (infoWindow) {
      if (isSelected && isVisible) {
        infoWindow.open(map)
      } else {
        infoWindow.close()
      }
    }
  }, [isSelected, isVisible, infoWindow, map])

  return null
}
