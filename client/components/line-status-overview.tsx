"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLines } from "@/contexts/lines-context"

interface LineStatusOverviewProps {
  selectedRegion: string
}

export function LineStatusOverview({ selectedRegion }: LineStatusOverviewProps) {
  const { getLines } = useLines()
  const lines = getLines(selectedRegion as any)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "maintenance":
        return "bg-yellow-500"
      case "fault":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 text-white">Active</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-500 text-white">Maintenance</Badge>
      case "fault":
        return <Badge className="bg-red-500 text-white">Fault</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Real-time Line Status</h1>
        <p className="text-muted-foreground">Voltage, current and load for each LT line in the selected region</p>
      </div>

      <Card>
        <CardHeader>
<CardTitle className="text-lg">{selectedRegion === 'all' ? 'All Regions' : selectedRegion.toUpperCase()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {lines.map((line) => (
              <Card key={line.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", getStatusColor(line.status))} />
                      <span className="font-bold text-lg">{line.id}</span>
                    </div>
                    {getStatusBadge(line.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Voltage:</span>
                      <span className="font-medium">{line.voltage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current:</span>
                      <span className="font-medium">{line.current}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Load:</span>
                      <span className="font-medium">{line.load}</span>
                    </div>

                    {line.status === "active" && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Load Capacity</span>
                          <span>{line.load}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={cn(
                              "h-2 rounded-full transition-all",
                              parseFloat(line.load) > 80 ? "bg-red-500" : parseFloat(line.load) > 60 ? "bg-yellow-500" : "bg-green-500",
                            )}
                            style={{ width: `${parseFloat(line.load)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {line.status === "fault" && (
                      <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-700">
                        Fault Detected - Requires immediate attention
                      </div>
                    )}

                    {line.status === "maintenance" && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
                        Scheduled maintenance in progress
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
