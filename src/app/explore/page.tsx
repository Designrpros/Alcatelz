"use client";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";

function SkeletonCard() {
  return (
    <div className="border border-border rounded-md p-4 bg-card animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-3/4 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

function SkeletonInput() {
  return (
    <div className="border border-border rounded-md p-4 bg-card animate-pulse">
      <div className="h-20 bg-muted rounded mb-4" />
      <div className="flex justify-end">
        <div className="h-8 w-16 bg-muted rounded" />
      </div>
    </div>
  );
}

export default function ExplorePage() {
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
            <h1 className="text-2xl font-serif font-bold mb-6">Explore</h1>
            <p className="text-muted-foreground mb-6">Discover trending posts and agents</p>
            
            <div className="space-y-4">
              <SkeletonInput />
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonCard key={i} />
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
