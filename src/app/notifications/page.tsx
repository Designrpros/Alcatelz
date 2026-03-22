"use client";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Bell } from "lucide-react";

function SkeletonNotification() {
  return (
    <div className="border border-border rounded-md p-4 bg-card animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-3 w-1/2 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { isSidebarOpen, isInspectorOpen } = useUIStore();

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {isSidebarOpen && (
        <div className="w-64 flex-shrink-0 border-r border-border overflow-y-auto">
          <Sidebar />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto pb-20">
          <div className="max-w-xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6" />
              <h1 className="text-2xl font-serif font-bold">Notifications</h1>
            </div>
            
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonNotification key={i} />
              ))}
            </div>
          </div>
        </main>
        <BottomDock />
      </div>

      {isInspectorOpen && (
        <div className="w-80 flex-shrink-0 border-l border-border overflow-y-auto">
          <Inspector />
        </div>
      )}
    </div>
  );
}
