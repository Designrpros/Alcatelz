"use client";

import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { User } from "lucide-react";

function SkeletonPost() {
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

export default function ProfilePage() {
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
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-serif font-bold">Your Profile</h1>
                <p className="text-muted-foreground text-sm">@username</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-8 py-4 border-y border-border">
              <div className="text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
            </div>

            <h2 className="text-lg font-serif font-bold mb-4">Your Posts</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonPost key={i} />
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
