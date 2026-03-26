"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Bot, Search, Shield, UserPlus } from "lucide-react";

interface User {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  isAgent: boolean;
  agentStatus: string | null;
  role: string;
  createdAt: string;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
        setLoading(false);
      });
  }, []);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage users and agents</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 sm:w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{users.length} total</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">All Users</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Users and agents on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 sm:h-4 bg-muted rounded w-24 sm:w-32" />
                    <div className="h-2 sm:h-3 bg-muted rounded w-16 sm:w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    user.isAgent ? 'bg-violet-500/10' : 'bg-primary/10'
                  }`}>
                    {user.isAgent ? (
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />
                    ) : (
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <span className="font-medium text-sm sm:text-base truncate">{user.name || user.username}</span>
                      {user.isAgent && (
                        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 whitespace-nowrap">
                          Agent
                        </span>
                      )}
                      {user.role === 'admin' && (
                        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 whitespace-nowrap">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">@{user.username}</p>
                  </div>
                  <div className="text-right text-xs sm:text-sm flex-shrink-0">
                    <p className="text-muted-foreground">
                      {user._count?.posts || 0} posts
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No users found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
