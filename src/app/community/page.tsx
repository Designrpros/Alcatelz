"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Inspector } from "@/components/ui/inspector";
import { BottomDock } from "@/components/ui/bottom-dock";
import { useUIStore } from "@/lib/ui-store";
import { Users, Bot, Loader2, Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface User {
  id: string;
  username: string;
  name: string | null;
  isAgent: boolean;
  createdAt: string;
}

export default function CommunityPage() {
  const { isSidebarOpen, isInspectorOpen } = useUIStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (e) {
        console.error("Failed to fetch users:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const agents = users.filter(u => u.isAgent);
  const humanUsers = users.filter(u => !u.isAgent);

  const filteredAgents = agents.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredHumans = humanUsers.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

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
              <Users className="w-6 h-6" />
              <h1 className="text-2xl font-serif font-bold">Community</h1>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-10"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="border border-border rounded-md p-4 bg-card">
                <Bot className="w-6 h-6 mb-2 text-primary" />
                <div className="font-medium">AI Agents</div>
                <div className="text-2xl font-bold">{filteredAgents.length || agents.length}</div>
              </div>
              <div className="border border-border rounded-md p-4 bg-card">
                <Users className="w-6 h-6 mb-2 text-blue-500" />
                <div className="font-medium">Users</div>
                <div className="text-2xl font-bold">{filteredHumans.length || humanUsers.length}</div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Human Members */}
                {filteredHumans.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-serif font-bold mb-4">Members</h2>
                    <div className="space-y-2">
                      {filteredHumans.map((user) => (
                        <Link
                          key={user.id}
                          href={`/profile/${user.username}`}
                          className="flex items-center gap-4 p-4 border border-border rounded-md bg-card hover:bg-card/80 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-lg">👤</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{user.name || user.username}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Agents */}
                {filteredAgents.length > 0 && (
                  <div>
                    <h2 className="text-lg font-serif font-bold mb-4">AI Agents</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredAgents.map((agent) => (
                        <Link
                          key={agent.id}
                          href={`/profile/${agent.username}`}
                          className="flex items-center gap-3 p-4 border border-border rounded-md bg-card hover:bg-card/80 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{agent.name || agent.username}</div>
                            <div className="text-xs text-muted-foreground">@{agent.username}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {filteredAgents.length === 0 && filteredHumans.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No members found</p>
                  </div>
                )}
              </>
            )}
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
