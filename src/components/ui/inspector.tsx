"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Activity, Database, Clock, ExternalLink } from "lucide-react";

interface AgentStatus {
  status: 'online' | 'offline' | 'thinking' | 'idle';
  content: string;
  lastUpdated: string;
}

export function Inspector({ className = "" }: { className?: string }) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["status", "system", "activity", "links"]);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setAgentStatus(data);
      } catch (error) {
        console.error('Failed to fetch agent status:', error);
        setAgentStatus({ status: 'offline', content: 'Connection error', lastUpdated: new Date().toISOString() });
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'thinking': return 'bg-yellow-500';
      case 'idle': return 'bg-blue-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'thinking': return 'Thinking...';
      case 'idle': return 'Idle';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  return (
    <div className={`h-full w-full bg-card flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-serif font-bold">Inspector</h2>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Agent Status */}
        <InspectorSection
          title="Agent Status"
          icon={Activity}
          expanded={expandedSections.includes("status")}
          onToggle={() => toggleSection("status")}
        >
          {loading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`px-2 py-0.5 rounded-full ${getStatusColor(agentStatus?.status || 'offline')}/20 text-${getStatusColor(agentStatus?.status || 'offline').replace('bg-', '')} text-xs font-medium`}>
                  {getStatusLabel(agentStatus?.status || 'offline')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Activity</span>
                <span className="text-sm truncate max-w-[120px]">{agentStatus?.content || 'Unknown'}</span>
              </div>
              {agentStatus?.lastUpdated && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last update</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(agentStatus.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </InspectorSection>

        {/* System Info */}
        <InspectorSection
          title="System"
          icon={Database}
          expanded={expandedSections.includes("system")}
          onToggle={() => toggleSection("system")}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Platform</span>
              <span className="text-sm">Alcatelz v1.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Runtime</span>
              <span className="text-sm">Next.js 15</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs">Connected</span>
              </span>
            </div>
          </div>
        </InspectorSection>

        {/* Recent Activity */}
        <InspectorSection
          title="Recent Activity"
          icon={Clock}
          expanded={expandedSections.includes("activity")}
          onToggle={() => toggleSection("activity")}
        >
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>Inspector synced</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Status checked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span>Component loaded</span>
            </div>
          </div>
        </InspectorSection>

        {/* Quick Links */}
        <InspectorSection
          title="Quick Links"
          icon={ExternalLink}
          expanded={expandedSections.includes("links")}
          onToggle={() => toggleSection("links")}
        >
          <div className="space-y-1">
            <a href="/about" className="block px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors">
              About Alcatelz
            </a>
            <a href="/docs" className="block px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors">
              Documentation
            </a>
            <a href="/settings" className="block px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors">
              Settings
            </a>
          </div>
        </InspectorSection>
      </div>
    </div>
  );
}

interface InspectorSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function InspectorSection({ title, icon: Icon, expanded, onToggle, children }: InspectorSectionProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {expanded && <div className="p-3 border-t border-border">{children}</div>}
    </div>
  );
}
