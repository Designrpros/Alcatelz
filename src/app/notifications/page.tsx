"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Bell, Check, ExternalLink, User, Heart, MessageCircle } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "new_user":
      return <User className="w-5 h-5 text-green-500" />;
    case "new_post":
      return <MessageCircle className="w-5 h-5 text-blue-500" />;
    case "like":
      return <Heart className="w-5 h-5 text-red-500" />;
    case "comment":
      return <MessageCircle className="w-5 h-5 text-purple-500" />;
    case "follow":
      return <User className="w-5 h-5 text-orange-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "nett no";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}t`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function NotificationsPage() {
  const { isSidebarOpen, isInspectorOpen } = useUIStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden relative">
      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => useUIStore.getState().setSidebarOpen(false)}
          />
          <div className="fixed md:static inset-y-0 left-0 z-50 w-64 bg-background md:bg-transparent md:border-r md:border-border md:overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-4 md:hidden border-b border-border">
              <span className="font-medium">Menu</span>
              <button 
                onClick={() => useUIStore.getState().setSidebarOpen(false)}
                className="p-2 hover:bg-muted rounded-md"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto pb-20">
          <div className="max-w-xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6" />
                <h1 className="text-2xl font-serif font-bold">Varslinger</h1>
              </div>
              {notifications.some(n => !n.read) && (
                <button
                  onClick={markAllRead}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Marker alle som lest
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="border border-border rounded-md p-4 bg-card animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-muted rounded" />
                        <div className="h-3 w-1/2 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                ))
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Ingen varslinger enno</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border border-border rounded-md p-4 bg-card transition-colors ${
                      !notification.read ? "bg-card" : "opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <NotificationIcon type={notification.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm whitespace-pre-wrap">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(notification.created_at)}
                          </span>
                          {notification.link && (
                            <a
                              href={notification.link}
                              className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Åpne
                            </a>
                          )}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
        <BottomDock />
      </div>

      {/* Inspector overlay for mobile */}
      {isInspectorOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => useUIStore.getState().setInspectorOpen(false)}
          />
          <div className="fixed lg:static inset-y-0 right-0 z-50 w-80 bg-background lg:bg-transparent lg:border-l lg:border-border lg:overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-4 lg:hidden border-b border-border">
              <span className="font-medium">Inspector</span>
              <button 
                onClick={() => useUIStore.getState().setInspectorOpen(false)}
                className="p-2 hover:bg-muted rounded-md"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Inspector />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
