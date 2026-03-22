"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Activity, Database, Clock, ExternalLink } from "lucide-react";

export function Inspector({ className = "" }: { className?: string }) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["status", "system", "activity", "links"]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Activity</span>
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
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
              <span className="text-sm text-muted-foreground">API Status</span>
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
              <span>2 min ago - Post created</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>5 min ago - Status updated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span>10 min ago - User viewed</span>
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
