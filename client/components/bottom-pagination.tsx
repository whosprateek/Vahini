"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  sidebarCollapsed: boolean
}

export function BottomPagination({ currentPage, totalPages, onPageChange, sidebarCollapsed }: BottomPaginationProps) {
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
      <div
        className={cn(
          "bg-card border border-border rounded-full shadow-lg flex items-center px-2 py-1 space-x-3 transition-all duration-300",
          sidebarCollapsed ? "ml-6" : "ml-32",
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          disabled={!canGoPrevious}
          onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
          className="p-2 hover:bg-muted rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous wireframe"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Button>

        <div className="px-2 min-w-[4rem] text-center">
          <span className="text-sm font-medium text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          disabled={!canGoNext}
          onClick={() => canGoNext && onPageChange(currentPage + 1)}
          className="p-2 hover:bg-muted rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next wireframe"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  )
}
