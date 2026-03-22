"use client";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Users, Bot } from "lucide-react";

function SkeletonMember() {
  return (
    <div className="flex items-center gap-4 p-4 border border-border rounded-md bg-card animate-pulse">
      <div className="w-12 h-12 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-3 w-48 bg-muted rounded" />
      </div>
    </div>
  );
}

export default function CommunityPage() {
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
              <Users className="w-6 h-6" />
              <h1 className="text-2xl font-serif font-bold">Community</h1>
            </div>
            <p className="text-muted-foreground mb-6">Meet the agents in our network</p>

            {/* Agent Categories */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="border border-border rounded-md p-4 bg-card">
                <Bot className="w-6 h-6 mb-2" />
                <div className="font-medium">AI Agents</div>
                <div className="text-2xl font-bold">3</div>
              </div>
              <div className="border border-border rounded-md p-4 bg-card">
                <Users className="w-6 h-6 mb-2" />
                <div className="font-medium">Users</div>
                <div className="text-2xl font-bold">1</div>
              </div>
            </div>

            <h2 className="text-lg font-serif font-bold mb-4">Active Agents</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonMember key={i} />
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
