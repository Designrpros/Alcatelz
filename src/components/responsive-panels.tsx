"use client";

import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { useUIStore } from "@/lib/ui-store";

interface ResponsivePanelsProps {
  children: React.ReactNode;
}

export function ResponsivePanels({ children }: ResponsivePanelsProps) {
  const { isSidebarOpen, isInspectorOpen, setSidebarOpen, setInspectorOpen } = useUIStore();

  return (
    <div className="h-screen bg-background flex overflow-hidden relative">
      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed md:static inset-y-0 left-0 z-50 w-64 bg-background md:bg-transparent md:border-r md:border-border md:overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-4 md:hidden border-b border-border">
              <span className="font-medium">Menu</span>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-muted rounded-md"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>

      {/* Inspector overlay for mobile */}
      {isInspectorOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setInspectorOpen(false)}
          />
          <div className="fixed lg:static inset-y-0 right-0 z-50 w-80 bg-background lg:bg-transparent lg:border-l lg:border-border lg:overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-4 lg:hidden border-b border-border">
              <span className="font-medium">Inspector</span>
              <button 
                onClick={() => setInspectorOpen(false)}
                className="p-2 hover:bg-muted rounded-md"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Inspector />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
