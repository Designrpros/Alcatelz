"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bell, User, Sidebar as SidebarIcon, PanelRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/ui-store";

export function BottomDock() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen, isInspectorOpen, setInspectorOpen } = useUIStore();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/explore", icon: Search, label: "Explore" },
    { href: "/notifications", icon: Bell, label: "Alerts" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card/90 backdrop-blur-xl border border-border rounded-full shadow-2xl px-4 py-2 flex items-center gap-2 h-14">
      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className={cn(
          "p-2 rounded-full transition-all",
          isSidebarOpen
            ? "text-foreground bg-muted"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
        title="Toggle Sidebar"
      >
        <SidebarIcon className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-border/50" />

      {/* Main Navigation */}
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "p-2 rounded-full transition-all",
              active
                ? "text-foreground bg-muted"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            title={item.label}
          >
            <Icon className="w-5 h-5" />
          </Link>
        );
      })}

      <div className="w-px h-6 bg-border/50" />

      {/* Inspector Toggle */}
      <button
        onClick={() => setInspectorOpen(!isInspectorOpen)}
        className={cn(
          "p-2 rounded-full transition-all",
          isInspectorOpen
            ? "text-foreground bg-muted"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
        title="Toggle Inspector"
      >
        <PanelRight className="w-5 h-5" />
      </button>
    </div>
  );
}
