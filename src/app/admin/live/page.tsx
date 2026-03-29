"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Radio, Terminal, Clock, Zap, Loader2, Trash2 } from "lucide-react";

interface LogEntry {
  id: string;
  source: 'agent' | 'system';
  agent?: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: string;
}

export default function AdminLive() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setAgents(data.agents || []);
        
        // Convert agent activity to logs
        const activityLogs: LogEntry[] = (data.recentAgentActivity || []).map((a: any, i: number) => ({
          id: a.id,
          source: 'agent' as const,
          agent: 'Agent',
          message: a.content,
          type: a.status === 'working' ? 'success' as const : 'info' as const,
          timestamp: a.createdAt,
        }));
        setLogs(activityLogs);
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // Poll for new data every 5 seconds (simple WebSocket alternative)
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setAgents(data.agents || []);
        
        const newLogs: LogEntry[] = (data.recentAgentActivity || []).map((a: any) => ({
          id: a.id,
          source: 'agent' as const,
          agent: 'Agent',
          message: a.content,
          type: a.status === 'working' ? 'success' as const : 'info' as const,
          timestamp: a.createdAt,
        }));

        setLogs(prev => {
          // Keep last 100 logs
          const combined = [...newLogs, ...prev];
          return combined.slice(0, 100);
        });
        
        setConnected(true);
      } catch {
        setConnected(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const clearLogs = () => setLogs([]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-amber-500';
      default: return 'text-muted-foreground';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Console</h1>
          <p className="text-muted-foreground mt-1">Real-time agent activity</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {/* Auto-scroll Toggle */}
          <Button
            variant={autoScroll ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
          >
            Auto-scroll
          </Button>
          {/* Clear */}
          <Button variant="outline" size="sm" onClick={clearLogs}>
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Agent Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Agent Status
          </CardTitle>
          <CardDescription>Live status of all agents</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : agents.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No agents connected</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {agents.map((agent) => (
                <div 
                  key={agent.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    agent.agentStatus === 'online' || agent.agentStatus === 'working'
                      ? 'bg-emerald-500 animate-pulse'
                      : agent.agentStatus === 'thinking'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-muted'
                  }`} />
                  <span className="font-medium text-sm">{agent.name || agent.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {agent.agentStatus || 'offline'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Console */}
      <Card className="flex flex-col h-[calc(100vh-320px)]">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Output
          </CardTitle>
          <CardDescription>
            {logs.length} log entries
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Terminal className="w-12 h-12 mb-4 opacity-50" />
              <p>Waiting for agent activity...</p>
              <p className="text-sm mt-1">Logs will appear here in real-time</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto font-mono text-sm space-y-1 p-2 bg-muted/30 rounded-lg">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-1 px-2 rounded hover:bg-muted/50">
                  <span className="text-xs text-muted-foreground flex-shrink-0 w-20">
                    {formatTime(log.timestamp)}
                  </span>
                  <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1 ${
                    log.type === 'success' ? 'bg-emerald-500' :
                    log.type === 'error' ? 'bg-red-500' :
                    log.type === 'warning' ? 'bg-amber-500' : 'bg-muted-foreground'
                  }`} />
                  {log.agent && (
                    <span className="text-violet-500 flex-shrink-0">[{log.agent}]</span>
                  )}
                  <span className={getTypeColor(log.type)}>{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
