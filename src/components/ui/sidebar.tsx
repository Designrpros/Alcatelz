"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Home, Search, Settings, Users, User, Bell, LogOut, Bot, BookOpen, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserType { id: string; username: string; name: string | null; }
interface FollowedTag { slug: string; }

interface SidebarProps { className?: string; }

export function Sidebar({ className }: SidebarProps) {
  const [user, setUser] = useState<UserType | null>(null);
  const [followedTags, setFollowedTags] = useState<FollowedTag[]>([]);
  const [path, setPath] = useState("/");
  const router = useRouter();

  useEffect(() => { setPath(window.location.pathname); fetchUser(); }, []);
  useEffect(() => { if (user) fetch("/api/hashtags/follow").then(r => r.json()).then(d => setFollowedTags(d.hashtags || [])).catch(() => {}); }, [user]);

  const fetchUser = async () => {
    try { const r = await fetch("/api/auth/me"); const d = await r.json(); setUser(d.user); } catch {}
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/auth");
  };

  const handleUnfollow = async (slug: string) => {
    await fetch(`/api/hashtags/follow?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    setFollowedTags(prev => prev.filter(t => t.slug !== slug));
  };

  const isActive = (href: string) => href === "/" ? path === "/" : path.startsWith(href);

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/docs", icon: BookOpen, label: "API Docs" },
    { href: "/community", icon: Users, label: "Community" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className={cn("h-full w-full bg-card p-4 flex flex-col", className)}>
      <div className="flex items-center gap-3 mb-6 mt-2">
        <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0">
          <Image src="/favicon.jpg" alt="Alcatelz" width={28} height={28} className="object-cover" />
        </div>
        <span className="font-serif font-bold text-lg">Alcatelz</span>
      </div>

      {user ? (
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
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
        <div className="mb-4 p-3 rounded-lg bg-muted/50 text-center">
          <Link href="/auth" className="text-sm text-primary hover:underline">Sign in to post</Link>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg transition-colors", isActive(href) ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}

        {user && followedTags.length > 0 && (
          <>
            <div className="my-3 border-t border-border" />
            <div className="px-3 py-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Following</p>
            </div>
            {followedTags.map(tag => (
              <div key={tag.slug} className="flex items-center gap-2 px-3 py-1.5 group">
                <Link href={`/?server=${encodeURIComponent(tag.slug)}`} className="flex-1 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <Hash className="w-4 h-4 text-primary" />
                  <span>{tag.slug}</span>
                </Link>
                <button onClick={() => handleUnfollow(tag.slug)} className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-destructive transition-opacity">
                  ×
                </button>
              </div>
            ))}
          </>
        )}
      </nav>

      <div className="my-4 border-t border-border" />

      <Link href="/settings" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg transition-colors", isActive("/settings") ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </Link>

      {user && (
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full mt-1">
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      )}
    </div>
  );
}
