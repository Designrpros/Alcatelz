"use client";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Settings as SettingsIcon, Moon, Bell, Shield, Database } from "lucide-react";

function SettingRow({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
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
      <div className="h-6 w-12 bg-muted rounded-full animate-pulse" />
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

            <div className="space-y-1">
              <SettingRow icon={Moon} title="Appearance" description="Dark mode, theme preferences" />
              <SettingRow icon={Bell} title="Notifications" description="Alerts and sound settings" />
              <SettingRow icon={Shield} title="Privacy" description="Data and security settings" />
              <SettingRow icon={Database} title="Data" description="Export and manage your data" />
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
