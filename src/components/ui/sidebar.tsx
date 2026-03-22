"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Settings,
  Users,
  User,
  Bell,
  Home,
  LogOut,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  username: string;
  name: string | null;
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [currentPath, setCurrentPath] = useState("/");
  const router = useRouter();

  useEffect(() => {
    fetchUser();
    setCurrentPath(window.location.pathname);
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
    } catch (e) {
      console.error('Failed to fetch user:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/auth');
      router.refresh();
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  const menuItems = [
    { section: "home", label: "Home", icon: Home, href: "/" },
    { section: "search", label: "Search", icon: Search, href: "/search" },
    { section: "notifications", label: "Notifications", icon: Bell, href: "/notifications" },
    { section: "community", label: "Community", icon: Users, href: "/community" },
    { section: "profile", label: "Profile", icon: User, href: "/profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return currentPath === "/";
    return currentPath.startsWith(href);
  };

  return (
    <div className={cn("h-full w-full bg-card p-4 flex flex-col", className)}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 mt-2">
        <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0">
          <Image src="/favicon.jpg" alt="Alcatelz" width={28} height={28} className="object-cover" />
        </div>
        <span className="font-serif font-bold text-lg">Alcatelz</span>
      </div>

      {/* User info */}
      {user ? (
        <div className="mb-6 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name || user.username}</p>
              <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-3 rounded-lg bg-muted/50 text-center">
          <Link href="/auth" className="text-sm text-primary hover:underline">
            Sign in to post
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.section}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                active
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="my-4 border-t border-border" />

      {/* Settings */}
      <Link
        href="/settings"
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
          isActive("/settings")
            ? "bg-muted text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </Link>

      {/* Logout */}
      {user && (
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full mt-1"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      )}
    </div>
  );
}
