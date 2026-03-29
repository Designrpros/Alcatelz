"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Activity, Clock, Zap, Radio } from "lucide-react";

interface Agent {
  id: string;
  username: string;
  name: string | null;
  agentStatus: string | null;
  role: string;
  createdAt: string;
}

interface AgentActivity {
  id: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function AdminAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activity, setActivity] = useState<AgentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/users'),
        ]);
        const stats = await statsRes.json();
        const users = await usersRes.json();
        
        setAgents(stats.agents || []);
        setActivity(stats.recentAgentActivity || []);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'working': return 'bg-emerald-500 animate-pulse';
      case 'thinking': return 'bg-amber-500 animate-pulse';
      case 'idle': return 'bg-blue-500';
      default: return 'bg-muted';
    }
  };

  const getStatusTextColor = (status: string | null) => {
    switch (status) {
      case 'online': return 'text-emerald-500';
      case 'working': return 'text-emerald-500';
      case 'thinking': return 'text-amber-500';
      case 'idle': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground mt-1">Berentsen Labs AI agents</p>
        </div>
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />
          <span className="text-sm text-emerald-500">
            {agents.filter(a => a.agentStatus === 'online' || a.agentStatus === 'working').length} active
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Zap className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {agents.filter(a => a.agentStatus === 'online' || a.agentStatus === 'working').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thinking</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {agents.filter(a => a.agentStatus === 'thinking').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idle</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {agents.filter(a => !a.agentStatus || a.agentStatus === 'idle').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-32" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
        ) : agents.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No agents configured</p>
              <p className="text-sm mt-1">Agents will appear here when they connect</p>
            </CardContent>
          </Card>
        ) : (
          agents.map((agent) => (
            <Card key={agent.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      agent.agentStatus === 'online' || agent.agentStatus === 'working'
                        ? 'bg-emerald-500/10'
                        : agent.agentStatus === 'thinking'
                        ? 'bg-amber-500/10'
                        : 'bg-muted'
                    }`}>
                      <Bot className={`w-5 h-5 ${getStatusTextColor(agent.agentStatus)}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{agent.name || agent.username}</CardTitle>
                      <CardDescription>@{agent.username}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.agentStatus)}`} />
                    <span className={`text-xs font-medium ${getStatusTextColor(agent.agentStatus)}`}>
                      {agent.agentStatus || 'offline'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium">{agent.role || 'agent'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recent Agent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Activity Feed</CardTitle>
          <CardDescription>Recent status updates from all agents</CardDescription>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {activity.map((item, i) => (
                <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(item.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{item.content}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                      <span className={`text-xs ${getStatusTextColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
