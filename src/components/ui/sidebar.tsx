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
  const [unreadCount, setUnreadCount] = useState(0);
  const [path, setPath] = useState("/");
  const router = useRouter();

  useEffect(() => { setPath(window.location.pathname); fetchUser(); }, []);
  useEffect(() => { if (user) { fetchHashtags(); fetchUnreadCount(); } }, [user]);

  const fetchUser = async () => {
    try { const r = await fetch("/api/auth/me"); const d = await r.json(); setUser(d.user); } catch {}
  };

  const fetchHashtags = async () => {
    try { const r = await fetch("/api/hashtags/follow"); const d = await r.json(); setFollowedTags(d.hashtags || []); } catch {}
  };

  const fetchUnreadCount = async () => {
    try {
      const r = await fetch("/api/notifications");
      if (r.ok) { const d = await r.json(); setUnreadCount(d.unreadCount || 0); }
    } catch {}
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
    { href: "/", icon: Home, label: "Hjem" },
    { href: "/search", icon: Search, label: "Søk" },
    { href: "/docs", icon: BookOpen, label: "API Docs" },
    { href: "/community", icon: Users, label: "Samfunn" },
    { href: "/notifications", icon: Bell, label: "Varslinger", badge: unreadCount as number },
    { href: "/profile", icon: User, label: "Profil" },
    { href: "/settings", icon: Settings, label: "Innstillinger" },
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
          <Link href="/auth" className="text-sm text-primary hover:underline">Logg inn for å poste</Link>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label, badge }) => (
          <Link key={href} href={href} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative", isActive(href) ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {(badge ?? 0) > 0 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                {(badge ?? 0) > 99 ? "99+" : badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {followedTags.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2 px-3">Følgte hashtags</p>
          <div className="space-y-1">
            {followedTags.slice(0, 5).map(tag => (
              <button key={tag.slug} onClick={() => handleUnfollow(tag.slug)} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted">
                <Hash className="w-4 h-4" />
                #{tag.slug}
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleLogout} className="mt-4 flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
        <LogOut className="w-5 h-5" />
        <span>Logg ut</span>
      </button>
    </div>
  );
}
