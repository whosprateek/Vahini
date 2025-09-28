"use client"

import { Button } from "@/components/ui/button"
import { History, Expand, ChevronDown, ArrowLeftRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TopNavigationProps {
  zoomLevel: number
  onZoomChange: (zoom: number) => void
  currentPage: number
}

export function TopNavigation({ zoomLevel, onZoomChange, currentPage }: TopNavigationProps) {
  const zoomOptions = [50, 75, 100, 125, 150, 200]

  return (
    <nav className="w-full bg-card border-b border-border sticky top-0 right-0 items-center py-2 box-border z-10">
      <div className="w-full flex flex-col md:flex-row items-center justify-between xl:px-10 lg:px-8 px-6 md:space-x-4">
        <div className="flex items-center justify-start text-left w-full">
          <div className="flex items-center justify-between py-3 md:block z-[1000] mr-4 border-sidebar-border">
            <div className="flex items-center space-x-4 min-w-fit">
              <a className="z-[300] cursor-pointer" href="#">
                <div className="h-5 w-auto min-w-[80px] bg-primary text-primary-foreground px-3 py-1 rounded font-semibold text-sm">
                  UX Pilot
                </div>
              </a>
            </div>
          </div>

          <div className="flex items-left space-x-4">
            <div className="border-r border-border">
              <span className="text-sm text-muted-foreground mr-4">Page {currentPage}</span>
            </div>
            <div>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1 p-1 mb-1 cursor-pointer hover:bg-muted rounded !mb-0"
                >
                  <History className="w-4 h-4 text-muted-foreground" />
                  <span className="text-card-foreground text-xs">Prompt history</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="md:block hidden"></div>
        </div>

        <div className="flex items-center justify-between space-x-4 w-full md:w-auto">
          <div className="md:hidden block"></div>
          <div className="flex items-center justify-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center justify-between w-56 px-4 py-2 text-sm font-medium text-card-foreground bg-card border border-border rounded-md shadow-sm hover:bg-muted"
                >
                  <span className="flex items-center">
                    <ArrowLeftRight className="w-4 h-4 text-muted-foreground mr-2" />
                    <span>Actual Size ({zoomLevel}%)</span>
                  </span>
                  <ChevronDown className="w-5 h-5 ml-2 -mr-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {zoomOptions.map((zoom) => (
                  <DropdownMenuItem
                    key={zoom}
                    onClick={() => onZoomChange(zoom)}
                    className={zoom === zoomLevel ? "bg-accent" : ""}
                  >
                    {zoom}%
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center justify-center w-9 h-9 hover:bg-muted rounded"
            >
              <Expand className="w-5 h-5 text-card-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
