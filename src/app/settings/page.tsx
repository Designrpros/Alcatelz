"use client";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Settings, Bell, Moon, Sun, Monitor, User, Mail, FileText, Lock, Bot, Save, Image as ImageIcon } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  bio: string | null;
  image: string | null;
  isAgent: boolean;
  agentStatus: string | null;
}

interface NotificationPrefs {
  notify_new_user: boolean;
  notify_new_post: boolean;
  notify_like: boolean;
  notify_comment: boolean;
  notify_follow: boolean;
}

export default function SettingsPage() {
  const { isSidebarOpen, isInspectorOpen, theme, setTheme } = useUIStore();
  
  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [agentStatus, setAgentStatus] = useState("online");
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  
  // Notification prefs state
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchPreferences();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setName(data.user?.name || "");
        setEmail(data.user?.email || "");
        setBio(data.user?.bio || "");
        setAgentStatus(data.user?.agentStatus || "online");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setProfileLoading(false);
    }
  }

  async function fetchPreferences() {
    try {
      const res = await fetch("/api/notifications/preferences");
      if (res.ok) {
        const data = await res.json();
        setPrefs(data.preferences);
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    } finally {
      setNotifLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, bio, agentStatus, currentPassword: password || undefined, newPassword: newPassword || undefined }),
      });
      if (res.ok) {
        setSaveMsg("Lagret!");
        setPassword("");
      } else {
        setSaveMsg("Feil ved lagring");
      }
    } catch (error) {
      setSaveMsg("Feil ved lagring");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  }

  async function updatePreference(key: keyof NotificationPrefs, value: boolean) {
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (res.ok) {
        setPrefs(prev => prev ? { ...prev, [key]: value } : null);
      }
    } catch (error) {
      console.error("Failed to update preference:", error);
    }
  }

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
              <Settings className="w-6 h-6" />
              <h1 className="text-2xl font-serif font-bold">Innstillinger</h1>
            </div>
            
            <div className="space-y-6">
              {/* Theme */}
              <div className="border border-border rounded-lg p-4 bg-card">
                <h2 className="font-medium mb-4 flex items-center gap-2">
                  <Sun className="w-5 h-5" />/<Moon className="w-5 h-5" /> Utseende
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md ${theme === "light" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                  >
                    <Sun className="w-4 h-4" /> Lys
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md ${theme === "dark" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                  >
                    <Moon className="w-4 h-4" /> Mørk
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md ${theme === "system" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                  >
                    <Monitor className="w-4 h-4" /> System
                  </button>
                </div>
              </div>

              {/* Profile */}
              <div className="border border-border rounded-lg p-4 bg-card">
                <h2 className="font-medium mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" /> Profil
                </h2>
                {profileLoading ? (
                  <p className="text-sm text-muted-foreground">Laster...</p>
                ) : (
                  <div className="space-y-4">
                    {/* Username (read only) */}
                    <div>
                      <label className="text-sm text-muted-foreground">Brukernavn</label>
                      <p className="font-medium">@{profile?.username}</p>
                    </div>
                    
                    {/* Name */}
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="w-4 h-4" /> Navn
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border"
                        placeholder="Ditt navn"
                      />
                    </div>
                    
                    {/* Email */}
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-4 h-4" /> E-post
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border"
                        placeholder="din@epost.no"
                      />
                    </div>
                    
                    {/* Bio */}
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1">
                        <FileText className="w-4 h-4" /> Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border resize-none h-24"
                        placeholder="Fortell om deg selv..."
                      />
                    </div>
                    
                    {/* Agent Status (only for agents) */}
                    {profile?.isAgent && (
                      <div>
                        <label className="text-sm text-muted-foreground flex items-center gap-1">
                          <Bot className="w-4 h-4" /> Agent-status
                        </label>
                        <select
                          value={agentStatus}
                          onChange={(e) => setAgentStatus(e.target.value)}
                          className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border"
                        >
                          <option value="online">Online</option>
                          <option value="idle">Idle</option>
                          <option value="offline">Offline</option>
                          <option value="working">Working</option>
                          <option value="thinking">Thinking</option>
                        </select>
                      </div>
                    )}
                    
                                        {/* Password Change */}
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1">
                        <Lock className="w-4 h-4" /> Gammelt passord
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border"
                        placeholder="Skriv inn gammelt passord"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1">
                        <Lock className="w-4 h-4" /> Nytt passord
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border"
                        placeholder="Skriv inn nytt passord"
                      />
                    </div>

                    
                    {/* Save button */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? "Lagrer..." : "Lagre endringer"}
                      </button>
                      {saveMsg && <span className="text-sm text-muted-foreground">{saveMsg}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="border border-border rounded-lg p-4 bg-card">
                <h2 className="font-medium mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" /> Varslinger
                </h2>
                {notifLoading ? (
                  <p className="text-sm text-muted-foreground">Laster...</p>
                ) : (
                  <div className="space-y-3">
                    {[
                      { key: "notify_new_user" as const, label: "Nye brukere" },
                      { key: "notify_new_post" as const, label: "Nye poster" },
                      { key: "notify_like" as const, label: "Likes" },
                      { key: "notify_comment" as const, label: "Kommentarer" },
                      { key: "notify_follow" as const, label: "Nye følgere" },
                    ].map(item => (
                      <label key={item.key} className="flex items-center justify-between cursor-pointer">
                        <span>{item.label}</span>
                        <input
                          type="checkbox"
                          checked={prefs?.[item.key] ?? true}
                          onChange={(e) => updatePreference(item.key, e.target.checked)}
                          className="w-5 h-5"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>
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
