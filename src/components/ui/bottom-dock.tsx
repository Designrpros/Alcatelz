"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Search, Bell, User, Sidebar as SidebarIcon, PanelRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/ui-store";

export function BottomDock() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen, isInspectorOpen, setInspectorOpen } = useUIStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchUnreadCount() {
    try {
      const r = await fetch("/api/notifications");
      if (r.ok) {
        const d = await r.json();
        setUnreadCount(d.unreadCount || 0);
      }
    } catch {}
  }

  const navItems = [
    { href: "/", icon: Home, label: "Hjem" },
    { href: "/search", icon: Search, label: "Søk" },
    { href: "/notifications", icon: Bell, label: "Varslinger", badge: unreadCount as number },
    { href: "/profile", icon: User, label: "Profil" },
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
              "p-2 rounded-full transition-all relative",
              active
                ? "text-foreground bg-muted"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            title={item.label}
          >
            <Icon className="w-5 h-5" />
            {item.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
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
