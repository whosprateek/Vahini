"use client"

import React from "react"
import { Wrapper, Status } from "@googlemaps/react-wrapper"
import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

interface GoogleMapWrapperProps {
  center: google.maps.LatLngLiteral
  zoom: number
  children?: React.ReactNode
  onMapLoad?: (map: google.maps.Map) => void
  className?: string
}

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-gray-600 dark:text-gray-400">Loading Google Maps...</span>
          </div>
        </div>
      )
    case Status.FAILURE:
      return (
        <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 font-semibold mb-2">Failed to load Google Maps</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Please check your API key configuration
            </p>
          </div>
        </div>
      )
    default:
      return <></>
  }
}

interface MapComponentProps {
  center: google.maps.LatLngLiteral
  zoom: number
  onMapLoad?: (map: google.maps.Map) => void
  className?: string
  children?: React.ReactNode
}

function MapComponent({ center, zoom, onMapLoad, className, children }: MapComponentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map>()

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      })
      setMap(newMap)
      if (onMapLoad) {
        onMapLoad(newMap)
      }
    }
  }, [ref, map, center, zoom, onMapLoad])

  return (
    <>
      <div ref={ref} className={className || "w-full h-96"} />
      {children && map &&
        React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { map } as any)
          }
        })
      }
    </>
  )
}

export function GoogleMapWrapper({ center, zoom, children, onMapLoad, className }: GoogleMapWrapperProps) {
  // Demo API key for testing - replace with your own for production
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBFw0Qbyq9zTFTd-tUY6dpoWWdekhVKX3o"
  
  return (
    <Wrapper apiKey={apiKey} render={render}>
      <MapComponent 
        center={center} 
        zoom={zoom} 
        onMapLoad={onMapLoad}
        className={className}
      >
        {children}
      </MapComponent>
    </Wrapper>
  )
}
