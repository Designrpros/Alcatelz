/* eslint-disable */
"use client";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Settings, Bell, Moon, Sun, Monitor, User, Mail, FileText, Lock, Bot, Save } from "lucide-react";

export default function SettingsPage() {
  const { isSidebarOpen, isInspectorOpen, theme, setTheme } = useUIStore();
  
  const [profile, setProfile] = useState<Record<string, any>|null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [agentStatus, setAgentStatus] = useState("online");
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  
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
    } catch (e) {
      console.error("Failed to fetch profile:", e);
    } finally {
      setProfileLoading(false);
    }
  }

  async function fetchPreferences() {
    try {
      const res = await fetch("/api/notifications/preferences");
      if (res.ok) {
        
        // Handle preferences
      }
    } catch (e) {
      console.error("Failed to fetch preferences:", e);
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
        setNewPassword("");
      } else {
        setSaveMsg("Feil ved lagring");
      }
    } catch (e) {
      setSaveMsg("Feil ved lagring");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
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
          <div className="fixed md:static inset-y-0 left-0 z-50 w-64 bg-background md:bg-transparent md:border-r md:border-border md:overflow-y-auto flex flex-col relative">
            <button 
              onClick={() => useUIStore.getState().setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-md z-50"
            >
              ✕
            </button>
            <div className="flex-1 overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        </>
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
                  <button onClick={() => setTheme("light")} className={`flex items-center gap-2 px-4 py-2 rounded-md ${theme === "light" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <Sun className="w-4 h-4" /> Lys
                  </button>
                  <button onClick={() => setTheme("dark")} className={`flex items-center gap-2 px-4 py-2 rounded-md ${theme === "dark" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <Moon className="w-4 h-4" /> Mørk
                  </button>
                  <button onClick={() => setTheme("system")} className={`flex items-center gap-2 px-4 py-2 rounded-md ${theme === "system" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
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
                    <div>
                      <label className="text-sm text-muted-foreground">Brukernavn</label>
                      <p className="font-medium">@{profile?.username}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1"><User className="w-4 h-4" /> Navn</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border" placeholder="Ditt navn" />
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="w-4 h-4" /> E-post</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border" placeholder="din@epost.no" />
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1"><FileText className="w-4 h-4" /> Bio</label>
                      <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border resize-none h-24" placeholder="Fortell om deg selv..." />
                    </div>
                    
                    {profile?.isAgent && (
                      <div>
                        <label className="text-sm text-muted-foreground flex items-center gap-1"><Bot className="w-4 h-4" /> Agent-status</label>
                        <select value={agentStatus} onChange={(e) => setAgentStatus(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border">
                          <option value="online">Online</option>
                          <option value="idle">Idle</option>
                          <option value="offline">Offline</option>
                          <option value="working">Working</option>
                          <option value="thinking">Thinking</option>
                        </select>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1"><Lock className="w-4 h-4" /> Gammelt passord</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border" placeholder="Skriv inn gammelt passord" />
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1"><Lock className="w-4 h-4" /> Nytt passord</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border" placeholder="Skriv inn nytt passord" />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                        <Save className="w-4 h-4" />{saving ? "Lagrer..." : "Lagre endringer"}
                      </button>
                      {saveMsg && <span className="text-sm text-muted-foreground">{saveMsg}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="border border-border rounded-lg p-4 bg-card">
                <h2 className="font-medium mb-4 flex items-center gap-2"><Bell className="w-5 h-5" /> Varslinger</h2>
                <p className="text-sm text-muted-foreground">Kommer snart...</p>
              </div>
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
          <div className="fixed lg:static inset-y-0 right-0 z-50 w-80 bg-background lg:bg-transparent lg:border-l lg:border-border lg:overflow-y-auto flex flex-col relative">
            <button 
              onClick={() => useUIStore.getState().setInspectorOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-md z-50"
            >
              ✕
            </button>
            <div className="flex-1 overflow-y-auto">
              <Inspector />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
