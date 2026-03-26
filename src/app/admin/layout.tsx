"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                // Try cookie auth
                const res = await fetch("/api/auth/me");
                const data = await res.json();
                
                if (data.user && data.user.role === "admin") {
                    setIsAdmin(true);
                    setChecking(false);
                    return;
                }
                
                // For Telegram users - check via /api/users/[username] 
                if (data.user?.username) {
                    const userRes = await fetch(`/api/users/${data.user.username}`);
                    const userData = await userRes.json();
                    if (userData.user?.role === "admin") {
                        setIsAdmin(true);
                        setChecking(false);
                        return;
                    }
                }
                
                setIsAdmin(false);
                setChecking(false);
                router.push("/");
            } catch {
                setChecking(false);
                router.push("/auth");
            }
        };
        checkAdmin();
    }, [router]);

    if (checking) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Sjekker tilgang...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4 text-center">
                    <p className="text-muted-foreground">Du har ikke tilgang til admin.</p>
                    <p className="text-sm text-muted-foreground">Kontakt en administrator.</p>
                </div>
            </div>
        );
    }

    return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
