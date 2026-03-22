"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Database,
  FileText,
  Settings,
  Users,
  User,
  Bell,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["home"]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const menuItems = [
    {
      section: "home",
      label: "Home",
      icon: FileText,
      href: "/",
    },
    {
      section: "setup",
      label: "Setup & API",
      icon: Terminal,
      href: "/setup",
    },
    {
      section: "explore",
      label: "Explore",
      icon: Search,
      href: "/explore",
    },
    {
      section: "notifications",
      label: "Notifications",
      icon: Bell,
      href: "/notifications",
    },
    {
      section: "community",
      label: "Community",
      icon: Users,
      href: "/community",
    },
    {
      section: "profile",
      label: "Profile",
      icon: User,
      href: "/profile",
    },
    {
      section: "database",
      label: "Database",
      icon: Database,
      href: "/database",
      children: [
        { label: "Cities", href: "/database/cities" },
        { label: "Countries", href: "/database/countries" },
      ],
    },
  ];

  return (
    <div className={cn("h-full w-full bg-card p-4 flex flex-col", className)}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 mt-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">A</span>
        </div>
        <span className="font-serif font-bold text-lg">Alcatelz</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedSections.includes(item.section);

          return (
            <div key={item.section}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleSection(item.section)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <ChevronRight className="w-3 h-3" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="my-4 border-t border-border" />

      {/* Settings */}
      <Link
        href="/settings"
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </Link>
    </div>
  );
}
