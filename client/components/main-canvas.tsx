"use client"

interface MainCanvasProps {
  zoomLevel: number
  sidebarCollapsed: boolean
}

export function MainCanvas({ zoomLevel, sidebarCollapsed }: MainCanvasProps) {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-70px)] overflow-y-auto">
      <div className="flex-1 p-6 flex flex-col overflow-auto relative">
        <div className="flex-1 flex items-center justify-center relative">
          <div className="flex items-center justify-center w-full h-full">
            {/* Main design canvas */}
            <div
              className="border-2 border-border rounded-lg bg-card w-full h-full relative overflow-hidden"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "center center",
                maxWidth: "1440px",
                maxHeight: "584px",
              }}
            >
              {/* Canvas content */}
              <div className="w-full h-full bg-gradient-to-br from-card to-muted/20 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-primary rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-card-foreground">Design Canvas</h2>
                    <p className="text-muted-foreground text-sm max-w-md">
                      Start creating your wireframes and UI designs here. Use the tools in the sidebar to add elements.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <div className="w-20 h-3 bg-muted rounded-full" />
                    <div className="w-16 h-3 bg-muted rounded-full" />
                    <div className="w-24 h-3 bg-muted rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
