"use client";

import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { useTheme } from "@/components/providers/theme-provider";
import { Settings as SettingsIcon, Moon, Sun, Monitor } from "lucide-react";

function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex items-center justify-between py-4 border-b border-border">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-muted">
          {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </div>
        <div>
          <div className="font-medium">Appearance</div>
          <div className="text-sm text-muted-foreground">
            Current: {theme === "dark" ? "Dark mode" : "Light mode"}
          </div>
        </div>
      </div>
      <button
        onClick={toggle}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors"
      >
        <span className="sr-only">Toggle theme</span>
        <span
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full bg-background transition-transform ${
            theme === "dark" ? "translate-x-6" : "translate-x-1"
          }`}
        >
          {theme === "dark" ? (
            <Moon className="w-3 h-3" />
          ) : (
            <Sun className="w-3 h-3" />
          )}
        </span>
      </button>
    </div>
  );
}

function SettingRow({ icon: Icon, title, description, children }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
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
              <SettingsIcon className="w-6 h-6" />
              <h1 className="text-2xl font-serif font-bold">Settings</h1>
            </div>

            <div className="space-y-1 border border-border rounded-lg bg-card p-4">
              <ThemeToggle />
              <SettingRow 
                icon={Monitor} 
                title="Auto theme" 
                description="Follow system preference"
              >
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted">
                  <span className="sr-only">Coming soon</span>
                  <span className="inline-flex h-4 w-4 translate-x-1 items-center justify-center rounded-full bg-background">
                    <Moon className="w-3 h-3" />
                  </span>
                </button>
              </SettingRow>
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
