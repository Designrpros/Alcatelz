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
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setAgents(data.agents || []);
        
        const activityLogs: LogEntry[] = (data.recentAgentActivity || []).map((a: any) => ({
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
    <div className="space-y-4 sm:space-y-6 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Live Console</h1>
          <p className="text-muted-foreground mt-1 text-sm">Real-time agent activity</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-muted">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs sm:text-sm text-muted-foreground">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <Button
            variant={autoScroll ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className="text-xs sm:text-sm"
          >
            Auto-scroll
          </Button>
          <Button variant="outline" size="sm" onClick={clearLogs}>
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>

      {/* Agent Status */}
      <Card className="flex-shrink-0 overflow-hidden">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Agent Status</span>
            <span className="sm:hidden">Agents</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm hidden sm:block">Live status of all agents</CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          {loading ? (
            <div className="flex justify-center py-4 sm:py-6">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-muted-foreground" />
            </div>
          ) : agents.length === 0 ? (
            <p className="text-center py-4 sm:py-6 text-sm text-muted-foreground">No agents connected</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {agents.map((agent) => (
                <div 
                  key={agent.id}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg border border-border text-xs sm:text-sm"
                >
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                    agent.agentStatus === 'online' || agent.agentStatus === 'working'
                      ? 'bg-emerald-500 animate-pulse'
                      : agent.agentStatus === 'thinking'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-muted'
                  }`} />
                  <span className="font-medium truncate max-w-[80px] sm:max-w-none">{agent.name || agent.username}</span>
                  <span className="text-muted-foreground hidden sm:inline">
                    {agent.agentStatus || 'offline'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Console */}
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Output</span>
            <span className="sm:hidden">Logs</span>
            <span className="text-xs text-muted-foreground font-normal ml-auto">{logs.length}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-hidden flex flex-col p-2 sm:p-3">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Terminal className="w-8 h-8 sm:w-12 sm:h-12 mb-2 sm:mb-4 opacity-50" />
              <p className="text-sm">Waiting for agent activity...</p>
              <p className="text-xs mt-1 hidden sm:block">Logs will appear here in real-time</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto font-mono text-xs sm:text-sm bg-muted/30 rounded-lg p-2 sm:p-3 space-y-1">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-1.5 sm:gap-3 py-1 px-1.5 sm:py-1.5 sm:px-2 rounded hover:bg-muted/50 break-words">
                  <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0 hidden sm:block w-16 sm:w-20">
                    {formatTime(log.timestamp)}
                  </span>
                  <span className={`flex-shrink-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-0.5 ${
                    log.type === 'success' ? 'bg-emerald-500' :
                    log.type === 'error' ? 'bg-red-500' :
                    log.type === 'warning' ? 'bg-amber-500' : 'bg-muted-foreground'
                  }`} />
                  {log.agent && (
                    <span className="text-violet-500 flex-shrink-0 text-[10px] sm:text-xs">[{log.agent}]</span>
                  )}
                  <span className={`break-all ${getTypeColor(log.type)}`}>{log.message}</span>
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
