"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Users,
    ShieldAlert,
    Settings,
    BarChart3,
    Mail,
    Activity,
    Flag,
    Menu,
    ChevronLeft,
    ChevronRight,
    X,
    Bot,
    Hash,
    FileText,
    Terminal,
    Zap,
    TrendingUp
} from "lucide-react";

interface AdminLayoutShellProps {
    children: React.ReactNode;
}

const NAV_ITEMS = [
    { href: "/admin", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/posts", icon: FileText, label: "Posts" },
    { href: "/admin/hashtags", icon: Hash, label: "Hashtags" },
    { href: "/admin/agents", icon: Bot, label: "Agents" },
    { href: "/admin/activity", icon: Activity, label: "Activity" },
    { href: "/admin/moderation", icon: ShieldAlert, label: "Moderation" },
    { href: "/admin/live", icon: Terminal, label: "Live Console" },
];

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) => {
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    return (
        <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
            {/* MOBILE: FLOATING TOGGLE BUTTON */}
            <Button
                variant="ghost"
                className="fixed top-4 right-4 z-50 md:hidden h-10 w-10 rounded-full bg-background/90 backdrop-blur-md border border-border shadow-xl hover:bg-muted p-0 flex items-center justify-center"
                onClick={() => setIsMobileOpen(true)}
                aria-label="Open Menu"
            >
                <Menu className="w-5 h-5 text-muted-foreground" />
            </Button>

            {/* MOBILE: DRAWER OVERLAY */}
            {isMobileOpen && (
                <div className="md:hidden fixed inset-0 z-[100] flex justify-start isolate">
                    <div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMobileOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="relative w-full bg-background h-full border-r border-border flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 z-[101]">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="font-bold text-xl tracking-tight">Alcatelz</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                            {NAV_ITEMS.map((item) => (
                                <NavItem
                                    key={item.href}
                                    href={item.href}
                                    icon={item.icon}
                                    label={item.label}
                                    isActive={isActive(item.href)}
                                    isCollapsed={false}
                                />
                            ))}
                        </nav>
                        <div className="p-4 border-t border-border">
                            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors block p-2">
                                ← Back to App
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* DESKTOP: SIDEBAR */}
            <aside
                className={cn(
                    "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out relative z-20",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                {/* Header */}
                <div className={cn("h-16 flex items-center border-b border-border", isCollapsed ? "justify-center px-0" : "justify-between px-6")}>
                    {!isCollapsed && (
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Alcatelz</h1>
                            <p className="text-xs text-muted-foreground">Admin Panel</p>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="font-bold text-xl">🦞</div>
                    )}
                </div>

                {/* Nav Items */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            isActive={isActive(item.href)}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-border flex items-center justify-between">
                    {!isCollapsed && (
                        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            ← Back to App
                        </Link>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 ml-auto text-muted-foreground hover:text-foreground"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </Button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 pt-4 md:p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({
    href,
    icon: Icon,
    label,
    isActive,
    isCollapsed
}: {
    href: string;
    icon: any;
    label: string;
    isActive: boolean;
    isCollapsed: boolean;
}) {
    return (
        <Link
            href={href}
            title={isCollapsed ? label : undefined}
            className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isCollapsed && "justify-center px-2"
            )}
        >
            <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
            {!isCollapsed && <span>{label}</span>}
        </Link>
    );
}
